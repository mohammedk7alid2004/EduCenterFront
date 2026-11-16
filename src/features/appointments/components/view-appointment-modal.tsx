import { useTranslation } from 'react-i18next';
import { DetailField, ErrorState, LoadingState, Modal } from '@/shared/ui';
import { useAppointment } from '../appointments.queries';
import { localizedName, formatAppointmentTime } from '../appointments.lib';
import { APPOINTMENT_ITERATION, APPOINTMENT_STATUS } from '../appointments.constants';
export function ViewAppointmentModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const query = useAppointment(id);
  const row = query.data;
  const date = (value?: string | null) =>
    value && !Number.isNaN(new Date(value).getTime())
      ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(
          new Date(value),
        )
      : t('common.noValue');
  return (
    <Modal title={t('appointments.viewTitle')} icon="clock" onClose={onClose}>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : row ? (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <DetailField label={t('appointments.fields.groupName')}>{row.groupName}</DetailField>
          <DetailField label={t('appointments.fields.subject')}>
            {localizedName(row.subject, i18n.language)}
          </DetailField>
          <DetailField label={t('appointments.fields.teacher')}>{row.teacher}</DetailField>
          <DetailField label={t('appointments.fields.classroom')}>
            {localizedName(row.classroom, i18n.language)}
          </DetailField>
          <DetailField label={t('appointments.fields.level')}>{row.level}</DetailField>
          <DetailField label={t('appointments.fields.grade')}>{row.grade}</DetailField>
          <DetailField label={t('appointments.fields.startTime')}>
            {formatAppointmentTime(row.startTime, i18n.language)}
          </DetailField>
          <DetailField label={t('appointments.fields.endTime')}>
            {formatAppointmentTime(row.endTime, i18n.language)}
          </DetailField>
          <DetailField label={t('appointments.fields.days')}>
            <span className="flex flex-wrap gap-2">
              {row.days.map((day) => (
                <span
                  key={day}
                  className="rounded-full border border-primary bg-permissionSurface px-3 py-1 text-xs text-primary"
                >
                  {t(`appointments.days.${day}`)}
                </span>
              ))}
            </span>
          </DetailField>
          <DetailField label={t('appointments.fields.iteration')}>
            {t(
              `appointments.iterations.${Object.entries(APPOINTMENT_ITERATION).find(([, value]) => value === row.iteration)?.[0]}`,
            )}
          </DetailField>
          <DetailField label={t('appointments.fields.numberOfIterations')}>
            {row.numberOfIterations}
          </DetailField>
          <DetailField label={t('appointments.fields.maxCapacity')}>{row.maxCapacity}</DetailField>
          <div className="sm:col-span-2">
            <DetailField label={t('appointments.fields.notes')}>
              {row.notes || t('common.noValue')}
            </DetailField>
          </div>
          <DetailField label={t('audit.createdBy')}>
            {row.createdBy || t('common.noValue')}
          </DetailField>
          <DetailField label={t('audit.updatedBy')}>
            {row.updatedBy || t('common.noValue')}
          </DetailField>
          <DetailField label={t('audit.createdAt')}>{date(row.createdAt)}</DetailField>
          <DetailField label={t('audit.updatedAt')}>{date(row.updatedAt)}</DetailField>
          <DetailField label={t('common.status')}>
            <span className="rounded-lg border border-primary/20 bg-permissionSurface px-3 py-1 text-xs text-primary">
              {t(
                `appointments.statuses.${Object.entries(APPOINTMENT_STATUS).find(([, value]) => value === row.status)?.[0]}`,
              )}
            </span>
          </DetailField>
        </dl>
      ) : null}
    </Modal>
  );
}
