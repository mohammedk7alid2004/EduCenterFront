import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/infrastructure/api';
import { useCenterBrand } from '@/features/system-management';
import { useOnline } from '@/shared/hooks';
import { Button, ErrorState, Icon, LoadingState, Modal } from '@/shared/components';
import { useAppointment } from '../appointments.queries';
import {
  exportAllLecturesQr,
  exportAppointmentQr,
  generateAppointmentQr,
} from '../appointments-qr.lib';
import {
  appointmentLectureCount,
  formatAppointmentTime,
  localizedName,
  upcomingAppointmentDates,
} from '../appointments.lib';
import type { AppointmentDto } from '../appointments.types';

export function AppointmentQrModal({
  id,
  onClose,
}: {
  id: string;
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

  return <QrContent row={query.data} onClose={onClose} />;
}

function QrContent({ row, onClose }: { row: AppointmentDto; onClose: () => void }): JSX.Element {
  const { t, i18n } = useTranslation();
  const brand = useCenterBrand();
  const logoSource = brand.data?.navbarLogoUrl || undefined;

  const totalLectures = useMemo(
    () => appointmentLectureCount(row.days, row.iteration, row.numberOfIterations),
    [row.days, row.iteration, row.numberOfIterations],
  );

  const dates = useMemo(
    () => upcomingAppointmentDates(row.days, totalLectures),
    [row.days, totalLectures],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeIndex = Math.min(Math.max(selectedIndex, 0), Math.max(0, dates.length - 1));

  const lectures = useMemo(() => {
    const subject = localizedName(row.subject, i18n.language);
    const grade = row.gradeName ? localizedName(row.gradeName, i18n.language) : row.grade;
    const timeRange = `${formatAppointmentTime(row.startTime, i18n.language)} – ${formatAppointmentTime(row.endTime, i18n.language)}`;
    const count = dates.length || 1;

    return dates.map((date, index) => {
      const lectureNumber = index + 1;
      const formattedDate = new Intl.DateTimeFormat(i18n.language, {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);

      const shortDate = new Intl.DateTimeFormat(i18n.language, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(date);

      const labels = [
        row.teacher,
        [row.groupName, subject, grade].filter(Boolean).join(' · '),
        `${t('appointments.qr.lectureOf', { current: lectureNumber, total: count })} · ${formattedDate} · ${timeRange}`,
      ];

      const entries = [
        [t('appointments.qr.lecture'), `${lectureNumber} / ${count}`],
        [t('appointments.qr.lectureDate'), formattedDate],
        [t('common.id'), `${row.id}-L${lectureNumber}`],
        [t('appointments.fields.groupName'), row.groupName],
        [t('appointments.fields.teacher'), row.teacher],
        [t('appointments.fields.subject'), subject],
        [t('appointments.fields.classroom'), localizedName(row.classroom, i18n.language)],
        [
          t('appointments.fields.level'),
          row.levelName ? localizedName(row.levelName, i18n.language) : row.level,
        ],
        [t('appointments.fields.grade'), grade],
        [t('appointments.time'), timeRange],
      ];

      return {
        index,
        lectureNumber,
        date,
        formattedDate,
        selectorLabel: `${t('appointments.qr.lectureNumber', { number: lectureNumber })} - ${shortDate}`,
        labels,
        payload: entries
          .filter(([, value]) => value)
          .map(([label, value]) => `${label}: ${value}`)
          .join('\n'),
      };
    });
  }, [row, dates, i18n.language, t]);

  const currentLecture = lectures[activeIndex] ?? lectures[0];

  const [image, setImage] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState<'png' | 'pdf' | 'all' | null>(null);
  const [exportError, setExportError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentLecture) return;
    let cancelled = false;
    setImage('');
    setError(null);

    void generateAppointmentQr(currentLecture.payload, undefined, logoSource)
      .then((result) => {
        if (!cancelled) setImage(result);
      })
      .catch(() => {
        if (!cancelled) setError(new Error('appointments.qr.generationFailed'));
      });

    return () => {
      cancelled = true;
    };
  }, [currentLecture, retry, logoSource]);

  async function exportCurrent(format: 'png' | 'pdf') {
    if (busy || !currentLecture) return;
    setBusy(format);
    setExportError(null);
    try {
      await exportAppointmentQr({
        payload: currentLecture.payload,
        labels: currentLecture.labels,
        id: row.id,
        language: i18n.language,
        format,
        logoSource,
        lectureNumber: currentLecture.lectureNumber,
      });
    } catch {
      setExportError(new Error('appointments.qr.exportFailed'));
    } finally {
      setBusy(null);
    }
  }

  async function exportAll() {
    if (busy || lectures.length === 0) return;
    setBusy('all');
    setExportError(null);
    try {
      await exportAllLecturesQr({
        lectures: lectures.map((l) => ({
          payload: l.payload,
          labels: l.labels,
          lectureNumber: l.lectureNumber,
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
          {lectures.length > 1 && (
            <div className="mb-4 flex w-full max-w-sm items-center justify-between gap-2">
              <button
                type="button"
                aria-label={t('appointments.qr.previousLecture')}
                disabled={activeIndex === 0 || Boolean(busy)}
                onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-iconSurface text-primary transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Icon name="chevronLeft" className="size-5 shrink-0 rtl:rotate-180" />
              </button>

              <div className="relative min-w-0 flex-1">
                <select
                  id="lecture-select"
                  aria-label={t('appointments.qr.selectLecture')}
                  value={activeIndex}
                  disabled={Boolean(busy)}
                  onChange={(event) => setSelectedIndex(Number(event.target.value))}
                  className="h-9 w-full appearance-none rounded-xl border border-muted/60 bg-card pe-8 ps-3 text-center text-xs font-semibold text-foreground outline-none transition focus:border-primary sm:text-sm"
                >
                  {lectures.map((item) => (
                    <option key={item.lectureNumber} value={item.index}>
                      {item.selectorLabel}
                    </option>
                  ))}
                </select>
                <Icon
                  name="chevronDown"
                  className="pointer-events-none absolute end-2.5 top-2.5 size-4 text-primary"
                />
              </div>

              <button
                type="button"
                aria-label={t('appointments.qr.nextLecture')}
                disabled={activeIndex >= lectures.length - 1 || Boolean(busy)}
                onClick={() => setSelectedIndex((prev) => Math.min(lectures.length - 1, prev + 1))}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-iconSurface text-primary transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Icon name="chevronRight" className="size-5 shrink-0 rtl:rotate-180" />
              </button>
            </div>
          )}

          <img
            src={image}
            alt={t('appointments.qr.alt', {
              lecture: currentLecture.lectureNumber,
              name: row.groupName,
            })}
            width={320}
            height={320}
            className="aspect-square w-64 max-w-full rounded-2xl bg-qrPaper shadow-sm sm:w-72"
          />

          <span className="mt-3 rounded-full bg-permissionSurface px-3 py-1 text-xs font-semibold text-primary">
            {t('appointments.qr.lectureOf', {
              current: currentLecture.lectureNumber,
              total: lectures.length,
            })}
          </span>

          <p className="mt-2 text-base font-bold text-foreground">{row.groupName}</p>

          <p className="mt-1 text-center text-sm text-tableHeading">
            {row.teacher} · {localizedName(row.subject, i18n.language)}
            {row.grade
              ? ` · ${row.gradeName ? localizedName(row.gradeName, i18n.language) : row.grade}`
              : ''}
          </p>

          <p className="mt-1 text-center text-xs text-muted">
            {currentLecture.formattedDate} · {formatAppointmentTime(row.startTime, i18n.language)} –{' '}
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
              {t('appointments.qr.exportCurrentPng')}
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl border border-primary text-primary"
              disabled={Boolean(busy)}
              loading={busy === 'pdf'}
              onClick={() => void exportCurrent('pdf')}
            >
              <Icon name="pdfFile" className="size-4" />
              {t('appointments.qr.exportCurrentPdf')}
            </Button>
            {lectures.length > 1 && (
              <Button
                className="rounded-xl px-5"
                disabled={Boolean(busy)}
                loading={busy === 'all'}
                onClick={() => void exportAll()}
              >
                <Icon name="download" className="size-4" />
                {t('appointments.qr.exportAllPdf')}
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
