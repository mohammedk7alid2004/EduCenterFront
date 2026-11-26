import { useTranslation } from 'react-i18next';
import { Button, ErrorState, Select } from '@/shared/components';
import { NOTIFICATION_TYPE } from '../notifications.constants';
import { notificationLocalizedName } from '../notifications.lib';
import {
  useNotificationGroups,
  useNotificationLevels,
  useNotificationGrades,
} from '../notifications.queries';

export function NotificationFilters({
  type,
  group,
  level,
  grade,
  onChange,
  onClear,
}: {
  type: string;
  group: string;
  level: string;
  grade: string;
  onChange: (key: 'type' | 'group' | 'level' | 'grade', value: string) => void;
  onClear: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const groups = useNotificationGroups();
  const levels = useNotificationLevels();
  const grades = useNotificationGrades(level || undefined);
  const error = groups.error ?? levels.error ?? (level ? grades.error : null);

  return (
    <>
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          id="notification-type-filter"
          label={t('notifications.fields.type')}
          value={type}
          onChange={(event) => onChange('type', event.target.value)}
          options={Object.entries(NOTIFICATION_TYPE).map(([key, value]) => ({
            id: String(value),
            name: t(`notifications.types.${key}`),
          }))}
          placeholder={t('common.all')}
        />
        <Select
          id="notification-group-filter"
          label={t('notifications.fields.group')}
          value={group}
          onChange={(event) => onChange('group', event.target.value)}
          options={(groups.data ?? []).map((item) => ({
            id: item.id,
            name: item.name,
          }))}
          placeholder={t(groups.isPending ? 'common.loading' : 'common.all')}
          disabled={groups.isPending || Boolean(groups.error)}
        />
        <Select
          id="notification-level-filter"
          label={t('notifications.fields.level')}
          value={level}
          onChange={(event) => onChange('level', event.target.value)}
          options={(levels.data ?? []).map((item) => ({
            id: item.id,
            name: notificationLocalizedName(item.name, i18n.language),
          }))}
          placeholder={t(levels.isPending ? 'common.loading' : 'common.all')}
          disabled={levels.isPending || Boolean(levels.error)}
        />
        <Select
          id="notification-grade-filter"
          label={t('notifications.fields.grade')}
          value={grade}
          onChange={(event) => onChange('grade', event.target.value)}
          options={(grades.data ?? []).map((item) => ({
            id: item.id,
            name: notificationLocalizedName(item.name, i18n.language),
          }))}
          placeholder={t('common.all')}
          disabled={!level || grades.isPending || Boolean(grades.error)}
        />
      </div>
      {error && (
        <ErrorState
          error={error}
          onRetry={() => {
            void groups.refetch();
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
