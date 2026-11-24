import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/infrastructure/api';
import { useCenterBrand } from '@/features/system-management';
import { useOnline } from '@/shared/hooks';
import { Button, ErrorState, Icon, LoadingState, Modal } from '@/shared/components';
import { useAppointment } from '../appointments.queries';
import {
  exportAllDaysQr,
  exportAppointmentQr,
  generateAppointmentQr,
} from '../appointments-qr.lib';
import { appointmentDayDate, formatAppointmentTime, localizedName } from '../appointments.lib';
import { WEEK_DAYS } from '../appointments.constants';
import type { AppointmentDto } from '../appointments.types';

const DAY_NAMES_EN: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export function AppointmentQrModal({
  id,
  initialDay,
  onClose,
}: {
  id: string;
  initialDay?: number;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const query = useAppointment(id);
  const online = useOnline();

  if (!query.data)
    return (
      <Modal title={t('appointments.qr.title')} icon="qrCode" onClose={onClose}>
        {query.isPending && !online ? (
          <ErrorState error={new ApiError('NETWORK')} onRetry={() => void query.refetch()} />
        ) : query.isPending ? (
          <LoadingState />
        ) : (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        )}
      </Modal>
    );

  return <QrContent row={query.data} initialDay={initialDay} onClose={onClose} />;
}

function QrContent({
  row,
  initialDay,
  onClose,
}: {
  row: AppointmentDto;
  initialDay?: number;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const brand = useCenterBrand();
  const logoSource = brand.data?.navbarLogoUrl || undefined;

  const sortedDays = useMemo(() => {
    const list = row.days && row.days.length > 0 ? [...row.days] : [new Date().getDay()];
    return list.sort(
      (a, b) =>
        WEEK_DAYS.indexOf(a as (typeof WEEK_DAYS)[number]) -
        WEEK_DAYS.indexOf(b as (typeof WEEK_DAYS)[number]),
    );
  }, [row.days]);

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (initialDay !== undefined && sortedDays.includes(initialDay)) return initialDay;
    const today = new Date().getDay();
    if (sortedDays.includes(today)) return today;
    return sortedDays[0];
  });

  const activeDay = sortedDays.includes(selectedDay) ? selectedDay : sortedDays[0];

  const dayItems = useMemo(() => {
    const subject = localizedName(row.subject, i18n.language);
    const grade = row.gradeName ? localizedName(row.gradeName, i18n.language) : row.grade;
    const timeRange = `${formatAppointmentTime(row.startTime, i18n.language)} – ${formatAppointmentTime(row.endTime, i18n.language)}`;

    return sortedDays.map((dayNumber) => {
      const dayName = t(`appointments.days.${dayNumber}`);
      const date = appointmentDayDate(dayNumber);
      const formattedDate = new Intl.DateTimeFormat(i18n.language, {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
      const dayKey = DAY_NAMES_EN[dayNumber] || `day-${dayNumber}`;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const sessionDate = `${year}-${month}-${day}`;
      const sessionBarcode = `EDU-SESSION:${row.id}:${sessionDate}`;

      const labels = [
        row.teacher,
        [row.groupName, subject, grade].filter(Boolean).join(' · '),
        `${dayName} (${formattedDate}) · ${timeRange}`,
      ];

      const jsonPayload = JSON.stringify({
        barcode: sessionBarcode,
        appointmentId: row.id,
        date: sessionDate,
        dayOfWeek: dayNumber,
        startTime: row.startTime,
        endTime: row.endTime,
        groupName: row.groupName,
        teacherId: row.teacherId,
        teacherName: row.teacher,
        subjectId: row.subjectId,
        classroomId: row.classroomId,
      });

      return {
        dayNumber,
        dayName,
        dayKey,
        formattedDate,
        sessionBarcode,
        labels,
        payload: jsonPayload,
      };
    });
  }, [row, sortedDays, i18n.language, t]);

  const currentItem = dayItems.find((item) => item.dayNumber === activeDay) ?? dayItems[0];

  const [image, setImage] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState<'png' | 'pdf' | 'all' | null>(null);
  const [exportError, setExportError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentItem) return;
    let cancelled = false;
    setImage('');
    setError(null);

    void generateAppointmentQr(currentItem.payload, undefined, logoSource)
      .then((result) => {
        if (!cancelled) setImage(result);
      })
      .catch(() => {
        if (!cancelled) setError(new Error('appointments.qr.generationFailed'));
      });

    return () => {
      cancelled = true;
    };
  }, [currentItem, retry, logoSource]);

  async function exportCurrent(format: 'png' | 'pdf') {
    if (busy || !currentItem) return;
    setBusy(format);
    setExportError(null);
    try {
      await exportAppointmentQr({
        payload: currentItem.payload,
        labels: currentItem.labels,
        id: row.id,
        language: i18n.language,
        format,
        logoSource,
        dayKey: currentItem.dayKey,
      });
    } catch {
      setExportError(new Error('appointments.qr.exportFailed'));
    } finally {
      setBusy(null);
    }
  }

  async function exportAll() {
    if (busy || dayItems.length === 0) return;
    setBusy('all');
    setExportError(null);
    try {
      await exportAllDaysQr({
        days: dayItems.map((item) => ({
          payload: item.payload,
          labels: item.labels,
        })),
        id: row.id,
        language: i18n.language,
        logoSource,
      });
    } catch {
      setExportError(new Error('appointments.qr.exportFailed'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal
      title={t('appointments.qr.title')}
      icon="qrCode"
      onClose={onClose}
      pending={Boolean(busy)}
    >
      {error ? (
        <ErrorState error={error} onRetry={() => setRetry((current) => current + 1)} />
      ) : !image ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col items-center">
          {dayItems.length > 1 && (
            <div
              role="tablist"
              aria-label={t('appointments.fields.days')}
              className="mb-5 flex flex-wrap justify-center gap-2"
            >
              {dayItems.map((item) => (
                <button
                  key={item.dayNumber}
                  type="button"
                  role="tab"
                  aria-selected={item.dayNumber === activeDay}
                  disabled={Boolean(busy)}
                  onClick={() => setSelectedDay(item.dayNumber)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                    item.dayNumber === activeDay
                      ? 'bg-primary text-card shadow-sm'
                      : 'bg-permissionSurface text-primary hover:bg-primary/10'
                  }`}
                >
                  <Icon name="scheduleGrid" className="size-4" />
                  <span>{item.dayName}</span>
                </button>
              ))}
            </div>
          )}

          <img
            src={image}
            alt={t('appointments.qr.alt', {
              day: currentItem.dayName,
              name: row.groupName,
            })}
            width={320}
            height={320}
            className="aspect-square w-64 max-w-full rounded-2xl bg-qrPaper shadow-sm sm:w-72"
          />

          <span className="mt-3 rounded-full bg-permissionSurface px-3 py-1 text-xs font-semibold text-primary">
            {t('appointments.qr.dayBarcode', { day: currentItem.dayName })}
          </span>

          <p className="mt-2 text-base font-bold text-foreground">{row.groupName}</p>
          <span className="mt-0.5 font-mono text-xs text-muted" dir="ltr">
            {currentItem.sessionBarcode}
          </span>

          <p className="mt-1 text-center text-sm text-tableHeading">
            {row.teacher} · {localizedName(row.subject, i18n.language)}
            {row.grade
              ? ` · ${row.gradeName ? localizedName(row.gradeName, i18n.language) : row.grade}`
              : ''}
          </p>

          <p className="mt-1 text-center text-xs text-muted">
            {currentItem.formattedDate} · {formatAppointmentTime(row.startTime, i18n.language)} –{' '}
            {formatAppointmentTime(row.endTime, i18n.language)}
          </p>

          {exportError && (
            <p role="alert" className="mt-4 text-sm text-danger">
              {t(exportError.message)}
            </p>
          )}

          <div className="mt-6 flex w-full flex-wrap justify-center gap-3">
            <Button
              variant="ghost"
              className="rounded-xl border border-primary text-primary"
              disabled={Boolean(busy)}
              loading={busy === 'png'}
              onClick={() => void exportCurrent('png')}
            >
              <Icon name="imageFile" className="size-4" />
              {t('appointments.qr.exportDayPng')}
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl border border-primary text-primary"
              disabled={Boolean(busy)}
              loading={busy === 'pdf'}
              onClick={() => void exportCurrent('pdf')}
            >
              <Icon name="pdfFile" className="size-4" />
              {t('appointments.qr.exportDayPdf')}
            </Button>
            {dayItems.length > 1 && (
              <Button
                className="rounded-xl px-5"
                disabled={Boolean(busy)}
                loading={busy === 'all'}
                onClick={() => void exportAll()}
              >
                <Icon name="download" className="size-4" />
                {t('appointments.qr.exportAllDaysPdf')}
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
