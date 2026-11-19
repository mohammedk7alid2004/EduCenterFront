import { useTranslation } from 'react-i18next';
import { DetailField, Modal, StatusBadge } from '@/shared/components';
import type { TeacherDto } from '../teachers.types';
export function ViewTeacherModal({
  teacher,
  onClose,
}: {
  teacher: TeacherDto;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  return (
    <Modal title={t('teachers.viewTitle')} icon="graduationCap" onClose={onClose}>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <DetailField label={t('teachers.form.fullName')}>{teacher.name}</DetailField>
        <DetailField label={t('teachers.form.phone')}>
          <bdi>{teacher.phoneNumber || t('common.noValue')}</bdi>
        </DetailField>
        <DetailField label={t('teachers.form.email')}>
          <bdi>{teacher.email}</bdi>
        </DetailField>
        <DetailField label={t('teachers.form.subjects')}>
          {teacher.subjects
            .map((subject) => subject.name[lang] || subject.name.en || subject.name.ar)
            .filter(Boolean)
            .join(' - ') || t('common.noValue')}
        </DetailField>
        <DetailField label={t('common.status')}>
          <StatusBadge active={teacher.isActive} />
        </DetailField>
        <DetailField label={t('teachers.form.notes')}>
          {teacher.notes || t('common.noValue')}
        </DetailField>
      </dl>
    </Modal>
  );
}
