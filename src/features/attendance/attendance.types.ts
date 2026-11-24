import type { ListFilters } from '@/infrastructure/api';

export const ATTENDANCE_STATUS = { present: 1, late: 2, excused: 3, absent: 4 } as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];
export interface AttendanceDto {
  id: string;
  studentId: string;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  groupName: string | null;
  status: AttendanceStatus;
  notes: string | null;
  attendanceDate: string;
}
export interface AttendanceFilters extends ListFilters {
  status?: AttendanceStatus;
  attendanceDate?: string;
  groupName?: string;
}
export interface AttendanceStudentOption {
  id: string;
  name: string;
  phoneNumber: string | null;
}
export interface AttendanceAppointmentOption {
  id: string;
  groupName: string;
  classroomName: string;
  days: number[];
}
export interface RecordedAttendance {
  id: string;
  status: AttendanceStatus;
  notes: string | null;
  isStatusLocked: boolean;
}
export interface AttendanceFormValues extends AttendanceValues {
  sessionDay: string;
}
export interface AttendanceValues {
  studentId: string;
  appointmentId: string;
  sessionDate: string;
  status: AttendanceStatus | '';
  notes: string;
}
