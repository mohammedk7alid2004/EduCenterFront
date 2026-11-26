import { useTranslation } from 'react-i18next';
import { Button, ErrorState, Select } from '@/shared/components';
import { STUDENT_GENDER } from '../constants';
import { studentLocalizedName } from '../utils';
import { useStudentEducation } from '../queries';
export function StudentFilters({
  level,
  grade,
  gender,
  onChange,
  onClear,
}: {
  level: string;
  grade: string;
  gender: string;
  onChange: (key: 'level' | 'grade' | 'gender', value: string) => void;
  onClear: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const levels = useStudentEducation('levels');
  const grades = useStudentEducation('grades', level);
  const error = levels.error ?? (level ? grades.error : null);
  return (
    <>
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
        <Select
          id="student-level-filter"
          label={t('students.form.level')}
          value={level}
          onChange={(event) => onChange('level', event.target.value)}
          options={(levels.data ?? []).map((item) => ({
            id: item.id,
            name: studentLocalizedName(item.name, i18n.language),
          }))}
          placeholder={t(levels.isPending ? 'common.loading' : 'common.all')}
          disabled={levels.isPending || Boolean(levels.error)}
        />
        <Select
          id="student-grade-filter"
          label={t('students.form.grade')}
          value={grade}
          onChange={(event) => onChange('grade', event.target.value)}
          options={(grades.data ?? []).map((item) => ({
            id: item.id,
            name: studentLocalizedName(item.name, i18n.language),
          }))}
          placeholder={t('common.all')}
          disabled={!level || grades.isPending || Boolean(grades.error)}
        />
        <Select
          id="student-gender-filter"
          label={t('students.form.gender')}
          value={gender}
          onChange={(event) => onChange('gender', event.target.value)}
          options={[
            { id: STUDENT_GENDER.male, name: t('students.gender.male') },
            { id: STUDENT_GENDER.female, name: t('students.gender.female') },
          ]}
          placeholder={t('common.all')}
        />
      </div>
      {error && (
        <ErrorState
          error={error}
          onRetry={() => {
            void levels.refetch();
            if (level) void grades.refetch();
          }}
        />
      )}
      <Button variant="ghost" className="mt-3" onClick={onClear}>
        {t('common.clearFilters')}
      </Button>
    </>
  );
}
