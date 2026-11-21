import { useTranslation } from 'react-i18next';
import { DetailField, ErrorState, LoadingState, Modal } from '@/shared/components';
import { useAttendanceItem } from '../attendance.queries';
import { AttendanceStatusBadge } from './attendance-status-badge';
export function ViewAttendanceModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const query = useAttendanceItem(id);
  return (
    <Modal title={t('attendance.viewTitle')} icon="listChecks" onClose={onClose}>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.data ? (
        <dl className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
          <DetailField label={t('attendance.fullName')}>{query.data.fullName}</DetailField>
          <DetailField label={t('attendance.phoneNumber')}>
            <bdi>{query.data.phoneNumber || t('common.noValue')}</bdi>
          </DetailField>
          <DetailField label={t('attendance.email')}>
            <bdi>{query.data.email || t('common.noValue')}</bdi>
          </DetailField>
          <DetailField label={t('attendance.group')}>
            {query.data.groupName || t('common.noValue')}
          </DetailField>
          <DetailField label={t('attendance.status')}>
            <AttendanceStatusBadge status={query.data.status} />
          </DetailField>
          <DetailField label={t('attendance.notes')}>
            {query.data.notes || t('common.noValue')}
          </DetailField>
        </dl>
      ) : null}
    </Modal>
  );
}
