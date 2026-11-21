import { useTranslation } from 'react-i18next';
import { DetailField, ErrorState, LoadingState, Modal } from '@/shared/components';
import { useGroup } from '../groups.queries';
import { groupLocalizedName } from '../groups.lib';
import { GroupStatusBadge } from './group-status-badge';

export function ViewGroupModal({ id, onClose }: { id: string; onClose: () => void }): JSX.Element {
  const { t, i18n } = useTranslation();
  const query = useGroup(id);
  const row = query.data;

  return (
    <Modal title={t('groups.viewTitle')} icon="users" onClose={onClose}>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : row ? (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <DetailField label={t('groups.groupName')}>{row.groupName}</DetailField>
          <DetailField label={t('groups.subject')}>
            {groupLocalizedName(row.subject, i18n.language) || t('common.noValue')}
          </DetailField>
          <DetailField label={t('groups.level')}>
            {groupLocalizedName(row.levelName, i18n.language) || row.level || t('common.noValue')}
          </DetailField>
          <DetailField label={t('groups.grade')}>
            {groupLocalizedName(row.gradeName, i18n.language) || row.grade || t('common.noValue')}
          </DetailField>
          <DetailField label={t('groups.noOfStudents')}>
            {t('groups.personCount', { count: row.studentsCount ?? 0 })}
          </DetailField>
          <DetailField label={t('groups.maxCapacity')}>
            {t('groups.personCount', { count: row.maxCapacity })}
          </DetailField>
          <DetailField label={t('groups.status')}>
            <GroupStatusBadge status={row.status} />
          </DetailField>
        </dl>
      ) : null}
    </Modal>
  );
}
