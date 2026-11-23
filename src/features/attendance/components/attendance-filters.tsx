import { useTranslation } from 'react-i18next';
import { Button, Select } from '@/shared/components';
import { useGroups } from '@/features/groups/groups.queries';
import { ATTENDANCE_FILTER_STATUSES } from '../attendance.constants';
import { ATTENDANCE_STATUS } from '../attendance.types';

type FilterKey = 'status' | 'groupName' | 'date';

const attendanceStatusKeys: Record<(typeof ATTENDANCE_FILTER_STATUSES)[number], string> = {
  [ATTENDANCE_STATUS.present]: 'present',
  [ATTENDANCE_STATUS.late]: 'late',
  [ATTENDANCE_STATUS.excused]: 'excused',
  [ATTENDANCE_STATUS.absent]: 'absent',
};

export function AttendanceFilters({
  status,
  groupName,
  date,
  onChange,
  onClear,
}: {
  status: string;
  groupName: string;
  date: string;
  onChange: (key: FilterKey, value: string) => void;
  onClear: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const groups = useGroups({ pageNumber: 1, pageSize: 100 });

  return (
    <>
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t('attendance.status')}</legend>
          <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-2 rounded-full border border-muted/60 bg-card px-4">
            {ATTENDANCE_FILTER_STATUSES.map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="radio"
                  name="attendance-status-filter"
                  value={value}
                  checked={status === String(value)}
                  onChange={(event) => onChange('status', event.target.value)}
                  className="size-4 accent-primary"
                />
                {t(`attendance.statuses.${attendanceStatusKeys[value]}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <Select
          id="attendance-group-filter"
          label={t('attendance.groupName')}
          value={groupName}
          onChange={(event) => onChange('groupName', event.target.value)}
          placeholder={t(groups.isPending ? 'common.loading' : 'common.all')}
          disabled={groups.isPending || Boolean(groups.error)}
          options={(groups.data?.items ?? []).map((group) => ({
            id: group.groupName,
            name: group.groupName,
          }))}
        />
        <div>
          <label htmlFor="attendance-date-filter" className="mb-2 block text-sm font-medium">
            {t('attendance.date')}
          </label>
          <input
            id="attendance-date-filter"
            type="date"
            value={date}
            onChange={(event) => onChange('date', event.target.value)}
            className="h-10 w-full rounded-full border border-muted/60 bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>
      <Button variant="ghost" className="mt-3" onClick={onClear}>
        {t('common.clearFilters')}
      </Button>
    </>
  );
}
