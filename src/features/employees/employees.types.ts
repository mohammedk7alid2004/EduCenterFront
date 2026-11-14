import type { EMPLOYEE_GENDER } from './employees.constants';
export interface EmployeeDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  image: string | null;
  gender: string | null;
  role: { id: string; name: string };
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}
export interface EmployeeValues {
  fullName: string;
  phoneNumber?: string;
  email: string;
  password: string;
  roleId: string;
  gender: (typeof EMPLOYEE_GENDER)[keyof typeof EMPLOYEE_GENDER] | '';
  isActive: boolean;
}
export type EmployeePayload = Omit<EmployeeValues, 'isActive'>;
