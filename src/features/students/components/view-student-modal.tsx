import { useTranslation } from 'react-i18next';
import {
  Button,
  DetailField,
  ErrorState,
  Icon,
  LoadingState,
  Modal,
  StatusBadge,
} from '@/shared/components';
import { useStudent } from '../students.queries';
import { studentLocalizedName } from '../students.lib';
import { STUDENT_GENDER_NAMES } from '../students.constants';
export function ViewStudentModal({
  id,
  onClose,
  onOpenQr,
}: {
  id: string;
  onClose: () => void;
  onOpenQr?: (id: string) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const query = useStudent(id);
  const student = query.data;
  return (
    <Modal title={t('students.viewTitle')} icon="students" size="form" onClose={onClose}>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : student ? (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
          <DetailField label={t('students.form.fullName')}>{student.name}</DetailField>
          <DetailField label={t('students.form.email')}>
            <bdi>{student.email}</bdi>
          </DetailField>
          <DetailField label={t('students.form.phoneNumber')}>
            <bdi>{student.phoneNumber || t('common.noValue')}</bdi>
          </DetailField>
          <DetailField label={t('students.form.parentPhoneNumber')}>
            <bdi>{student.parentPhoneNumber || t('common.noValue')}</bdi>
          </DetailField>
          <DetailField label={t('students.form.level')}>
            {studentLocalizedName(student.educationLevel, i18n.language) || t('common.noValue')}
          </DetailField>
          <DetailField label={t('students.form.grade')}>
            {studentLocalizedName(student.educationGrade, i18n.language) || t('common.noValue')}
          </DetailField>
          <DetailField label={t('students.form.gender')}>
            {student.gender === STUDENT_GENDER_NAMES.male
              ? t('students.gender.male')
              : student.gender === STUDENT_GENDER_NAMES.female
                ? t('students.gender.female')
                : t('common.noValue')}
          </DetailField>
          <DetailField label={t('common.status')}>
            <StatusBadge active={student.isActive} />
          </DetailField>
          <DetailField label={t('students.subjects')}>
            {student.subjects
              ?.map((item) => studentLocalizedName(item.name, i18n.language))
              .join(' – ') || t('students.empty.subjects')}
          </DetailField>
          <DetailField label={t('students.groups')}>
            {student.groups
              ?.map((item) => studentLocalizedName(item.name, i18n.language))
              .join(' – ') || t('students.empty.groups')}
          </DetailField>
          <DetailField label={t('students.fees')}>
            {student.fees || t('students.empty.fees')}
          </DetailField>
          {onOpenQr && (
            <div className="flex justify-end sm:col-span-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl border border-primary/40 bg-primary/5 text-primary"
                onClick={() => onOpenQr(student.id)}
              >
                <Icon name="qrCode" className="size-4" />
                {t('students.qr.title')}
              </Button>
            </div>
          )}
        </dl>
      ) : null}
    </Modal>
  );
}
