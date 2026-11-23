import { useTranslation } from 'react-i18next';
import { Button, Select } from '@/shared/components';
import { ATTENDANCE_FILTER_STATUSES } from '../attendance.constants';
import { ATTENDANCE_STATUS } from '../attendance.types';

type FilterKey = 'status' | 'groupName' | 'date';

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

  return (
    <>
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <Select
          id="attendance-status-filter"
          label={t('attendance.status')}
          value={status}
          onChange={(event) => onChange('status', event.target.value)}
          placeholder={t('common.all')}
          options={ATTENDANCE_FILTER_STATUSES.map((value) => ({
            id: String(value),
            name: t(
              `attendance.statuses.${value === ATTENDANCE_STATUS.present ? 'present' : value === ATTENDANCE_STATUS.late ? 'late' : 'excused'}`,
            ),
          }))}
        />
        <div>
          <label htmlFor="attendance-group-filter" className="mb-2 block text-sm font-medium">
            {t('attendance.groupName')}
          </label>
          <input
            id="attendance-group-filter"
            type="search"
            value={groupName}
            onChange={(event) => onChange('groupName', event.target.value)}
            placeholder={t('attendance.groupName')}
            className="h-10 w-full rounded-full border border-muted/60 bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
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
