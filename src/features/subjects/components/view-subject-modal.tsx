import { useTranslation } from 'react-i18next';
import { DetailField, Modal, StatusBadge } from '@/shared/components';
import type { SubjectDto } from '../subjects.types';
export function ViewSubjectModal({
  subject,
  onClose,
}: {
  subject: SubjectDto;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  return (
    <Modal title={t('subjects.viewTitle')} icon="bookOpen" onClose={onClose}>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <DetailField label={t('subjects.table.name')}>
          {subject.name[lang] || subject.name.en || subject.name.ar || t('common.noValue')}
        </DetailField>
        <DetailField label={t('common.status')}>
          <StatusBadge active={subject.isActive} />
        </DetailField>
        <div className="sm:col-span-2">
          <DetailField label={t('subjects.table.note')}>
            {subject.note[lang] || subject.note.en || subject.note.ar || t('common.noValue')}
          </DetailField>
        </div>
      </dl>
    </Modal>
  );
}
