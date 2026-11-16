import type { AuditFields, ListFilters } from '@/core/api';
export interface LocalizedName {
  ar: string | null;
  en: string | null;
}
export interface AppointmentValues {
  groupName: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
  level: string;
  grade: string;
  startTime: string;
  endTime: string;
  days: number[];
  iteration: number;
  numberOfIterations: number;
  maxCapacity: number;
  notes: string;
  status: number;
}
export interface AppointmentDto extends AppointmentValues, AuditFields {
  id: string;
  subject: LocalizedName;
  classroom: LocalizedName;
  teacher: string;
  isActive: boolean;
}
export interface AppointmentFilters extends ListFilters {
  subjectId?: string;
  teacherId?: string;
  classroomId?: string;
}
export interface AppointmentOption {
  id: string;
  name: LocalizedName;
}
export interface TeacherOption {
  id: string;
  name: string;
}
