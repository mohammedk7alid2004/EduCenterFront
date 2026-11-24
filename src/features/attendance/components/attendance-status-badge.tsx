import { useTranslation } from 'react-i18next';
import { ATTENDANCE_STATUS, type AttendanceStatus } from '../attendance.types';
export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }): JSX.Element {
  const { t } = useTranslation();
  const statusConfig = {
    [ATTENDANCE_STATUS.present]: {
      key: 'present',
      tone: 'border-success bg-success/10 text-success',
    },
    [ATTENDANCE_STATUS.late]: {
      key: 'late',
      tone: 'border-warning bg-warning/10 text-warning',
    },
    [ATTENDANCE_STATUS.excused]: {
      key: 'excused',
      tone: 'border-info bg-info/10 text-info',
    },
    [ATTENDANCE_STATUS.absent]: {
      key: 'absent',
      tone: 'border-danger bg-danger/10 text-danger',
    },
  } as const;
  const { key, tone } = statusConfig[status];
  return (
    <span className={`inline-flex rounded-xl border px-3 py-1 text-xs font-medium ${tone}`}>
      {t(`attendance.statuses.${key}`)}
    </span>
  );
}
