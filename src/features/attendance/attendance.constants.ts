import { ATTENDANCE_STATUS } from './attendance.types';

export const ATTENDANCE_FILTER_PARAMS = {
  status: 'attendanceStatus',
  groupName: 'groupName',
  date: 'attendanceDate',
} as const;

export const ATTENDANCE_FILTER_STATUSES = [
  ATTENDANCE_STATUS.present,
  ATTENDANCE_STATUS.late,
  ATTENDANCE_STATUS.excused,
  ATTENDANCE_STATUS.absent,
] as const;
