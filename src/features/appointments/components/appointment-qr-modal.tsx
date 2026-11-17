import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/core/api';
import { useCenterBrand } from '@/features/system-management';
import { useOnline } from '@/shared/lib';
import { Button, ErrorState, Icon, LoadingState, Modal } from '@/shared/ui';
import { useAppointment } from '../appointments.queries';
import { exportAppointmentQr, generateAppointmentQr } from '../appointments-qr.lib';
import { localizedName, formatAppointmentTime } from '../appointments.lib';
import { APPOINTMENT_ITERATION, QR_EXPORT_FORMAT } from '../appointments.constants';
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
  const [image, setImage] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState<'png' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState<Error | null>(null);
  const data = useMemo(() => {
    const subject = localizedName(row.subject, i18n.language);
    const grade = row.gradeName ? localizedName(row.gradeName, i18n.language) : row.grade;
    const labels = [row.teacher, [subject, grade].filter(Boolean).join(' · '), row.groupName];
    const entries = [
      [t('common.id'), row.id],
      [t('appointments.fields.groupName'), row.groupName],
      [t('appointments.fields.teacher'), row.teacher],
      [t('appointments.fields.subject'), subject],
      [t('appointments.fields.classroom'), localizedName(row.classroom, i18n.language)],
      [
        t('appointments.fields.level'),
        row.levelName ? localizedName(row.levelName, i18n.language) : row.level,
      ],
      [t('appointments.fields.grade'), grade],
      [
        t('appointments.time'),
        `${formatAppointmentTime(row.startTime, i18n.language)} – ${formatAppointmentTime(row.endTime, i18n.language)}`,
      ],
      [
        t('appointments.fields.days'),
        row.days.map((day) => t(`appointments.days.${day}`)).join(t('appointments.separator')),
      ],
      [
        t('appointments.fields.iteration'),
        t(
          `appointments.iterations.${Object.entries(APPOINTMENT_ITERATION).find(([, value]) => value === row.iteration)?.[0]}`,
        ),
      ],
      [t('appointments.fields.numberOfIterations'), String(row.numberOfIterations)],
    ];
    return {
      labels,
      payload: entries
        .filter(([, value]) => value)
        .map(([label, value]) => `${label}: ${value}`)
        .join('\n'),
    };
  }, [row, i18n.language, t]);
  useEffect(() => {
    let cancelled = false;
    setImage('');
    setError(null);
    void generateAppointmentQr(data.payload, undefined, logoSource)
      .then((result) => {
        if (!cancelled) setImage(result);
      })
      .catch(() => {
        if (!cancelled) setError(new Error('appointments.qr.generationFailed'));
      });
    return () => {
      cancelled = true;
    };
  }, [data.payload, retry, logoSource]);
  async function exportFile(format: 'png' | 'pdf') {
    if (busy) return;
    setBusy(format);
    setExportError(null);
    try {
      await exportAppointmentQr({
        ...data,
        id: row.id,
        language: i18n.language,
        format,
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
          <img
            src={image}
            alt={t('appointments.qr.alt', { name: row.groupName })}
            width={320}
            height={320}
            className="aspect-square w-64 max-w-full bg-qrPaper sm:w-72"
          />
          <div className="mt-3 flex flex-wrap justify-center gap-x-8 gap-y-2 text-center text-sm font-medium">
            {data.labels.slice(0, 2).map((label, index) => (
              <span key={index} className="max-w-full break-words">
                {label}
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm text-tableHeading">{row.groupName}</p>
          {exportError && (
            <p role="alert" className="mt-4 text-sm text-danger">
              {t(exportError.message)}
            </p>
          )}
          <div className="mt-8 flex w-full flex-wrap justify-center gap-4">
            {Object.values(QR_EXPORT_FORMAT).map((format) => (
              <Button
                key={format}
                className="rounded-xl"
                disabled={Boolean(busy)}
                loading={busy === format}
                onClick={() => void exportFile(format)}
              >
                {t(`appointments.qr.${format}`)}
                <Icon
                  name={format === QR_EXPORT_FORMAT.png ? 'imageFile' : 'pdfFile'}
                  className="size-4"
                />
              </Button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
