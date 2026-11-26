import type { AuditFields, ListFilters } from '@/shared/types';

export interface GroupLocalizedName {
  ar: string | null;
  en: string | null;
}

export interface GroupEnrolledStudent {
  id: string;
  name: string;
  phoneNumber?: string | null;
}

export interface GroupDto extends AuditFields {
  id: string;
  groupName: string;
  subjectId: string;
  subject: GroupLocalizedName;
  teacherId: string;
  teacher: string;
  classroomId: string;
  classroom: GroupLocalizedName;
  levelId: string | null;
  gradeId: string | null;
  level: string;
  grade: string;
  levelName: GroupLocalizedName | null;
  gradeName: GroupLocalizedName | null;
  startTime: string;
  endTime: string;
  days: number[];
  iteration: number;
  numberOfIterations: number;
  maxCapacity: number;
  studentsCount: number;
  enrolledStudents?: GroupEnrolledStudent[];
  status: number;
  notes?: string | null;
  isActive: boolean;
}

export interface GroupFilters extends ListFilters {
  subjectId?: string;
  teacherId?: string;
  classroomId?: string;
  levelId?: string;
  gradeId?: string;
}

export interface StudentOption {
  id: string;
  name: string;
  phoneNumber?: string | null;
}

export interface ConnectStudentsPayload {
  appointmentId: string;
  studentIds: string[];
}
