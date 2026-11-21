import { useTranslation } from 'react-i18next';
import { Button, ErrorState, Select } from '@/shared/components';
import { useGroupOptions } from '../groups.queries';
import { groupLocalizedName } from '../groups.lib';

export function GroupsFilters({
  subjectId,
  levelId,
  gradeId,
  onChange,
  onClear,
}: {
  subjectId: string;
  levelId: string;
  gradeId: string;
  onChange: (key: 'subjectId' | 'levelId' | 'gradeId', value: string) => void;
  onClear: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();

  const subjects = useGroupOptions('subjects');
  const levels = useGroupOptions('levels');
  const grades = useGroupOptions('grades', levelId);

  const error = subjects.error ?? levels.error ?? (levelId ? grades.error : null);

  return (
    <>
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
        <Select
          id="group-subject-filter"
          label={t('groups.subject')}
          value={subjectId}
          onChange={(event) => onChange('subjectId', event.target.value)}
          options={(subjects.data ?? []).map((item) => ({
            id: item.id,
            name: groupLocalizedName(item.name, i18n.language),
          }))}
          placeholder={t(subjects.isPending ? 'common.loading' : 'common.all')}
          disabled={subjects.isPending || Boolean(subjects.error)}
        />
        <Select
          id="group-level-filter"
          label={t('groups.level')}
          value={levelId}
          onChange={(event) => onChange('levelId', event.target.value)}
          options={(levels.data ?? []).map((item) => ({
            id: item.id,
            name: groupLocalizedName(item.name, i18n.language),
          }))}
          placeholder={t(levels.isPending ? 'common.loading' : 'common.all')}
          disabled={levels.isPending || Boolean(levels.error)}
        />
        <Select
          id="group-grade-filter"
          label={t('groups.grade')}
          value={gradeId}
          onChange={(event) => onChange('gradeId', event.target.value)}
          options={(grades.data ?? []).map((item) => ({
            id: item.id,
            name: groupLocalizedName(item.name, i18n.language),
          }))}
          placeholder={t('common.all')}
          disabled={!levelId || grades.isPending || Boolean(grades.error)}
        />
      </div>
      {error && (
        <ErrorState
          error={error}
          onRetry={() => {
            void subjects.refetch();
            void levels.refetch();
            if (levelId) void grades.refetch();
          }}
        />
      )}
      <Button variant="ghost" className="mt-3" onClick={onClear}>
        {t('common.clearFilters')}
      </Button>
    </>
  );
}
