import { useTranslation } from 'react-i18next';
import { DetailField, ErrorState, LoadingState, Modal, StatusBadge } from '@/shared/components';
import { useClassroom } from '../classrooms.queries';
export function ViewClassroomModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const query = useClassroom(id);
  return (
    <Modal title={t('classrooms.viewTitle')} icon="classroom" onClose={onClose}>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : query.data ? (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <DetailField label={t('classrooms.form.name')}>
            {query.data.name[language] ||
              query.data.name.en ||
              query.data.name.ar ||
              t('common.noValue')}
          </DetailField>
          <DetailField label={t('classrooms.form.capacity')}>
            {t('classrooms.capacityPeople', { count: query.data.capacity })}
          </DetailField>
          <DetailField label={t('common.status')}>
            <StatusBadge active={query.data.isActive} />
          </DetailField>
          <DetailField label={t('classrooms.form.notes')}>
            {query.data.note[language] ||
              query.data.note.en ||
              query.data.note.ar ||
              t('common.noValue')}
          </DetailField>
        </dl>
      ) : null}
    </Modal>
  );
}
