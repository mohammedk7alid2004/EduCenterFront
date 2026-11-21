import { useTranslation } from 'react-i18next';
import { ATTENDANCE_STATUS, type AttendanceStatus } from '../attendance.types';
export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }): JSX.Element {
  const { t } = useTranslation();
  const tone =
    status === ATTENDANCE_STATUS.present
      ? 'border-success bg-success/10 text-success'
      : status === ATTENDANCE_STATUS.late
        ? 'border-danger bg-danger/10 text-danger'
        : 'border-info bg-info/10 text-info';
  const key =
    status === ATTENDANCE_STATUS.present
      ? 'present'
      : status === ATTENDANCE_STATUS.late
        ? 'late'
        : 'excused';
  return (
    <span className={`inline-flex rounded-xl border px-3 py-1 text-xs font-medium ${tone}`}>
      {t(`attendance.statuses.${key}`)}
    </span>
  );
}
