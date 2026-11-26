import { useTranslation } from 'react-i18next';
import { DetailField, ErrorState, LoadingState, Modal, StatusBadge } from '@/shared/components';
import { useEmployee } from '../queries';
export function ViewEmployeeModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const query = useEmployee(id);
  return (
    <Modal title={t('employees.viewTitle')} icon="users" onClose={onClose}>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        query.data && (
          <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <DetailField label={t('employees.form.fullName')}>{query.data.name}</DetailField>
            <DetailField label={t('employees.form.email')}>
              <bdi>{query.data.email}</bdi>
            </DetailField>
            <DetailField label={t('employees.form.phone')}>
              <bdi>{query.data.phoneNumber || t('common.noValue')}</bdi>
            </DetailField>
            <DetailField label={t('employees.form.role')}>
              {query.data.role.name || t('common.noValue')}
            </DetailField>
            <DetailField label={t('common.status')}>
              <StatusBadge active={query.data.isActive} />
            </DetailField>
          </dl>
        )
      )}
    </Modal>
  );
}
