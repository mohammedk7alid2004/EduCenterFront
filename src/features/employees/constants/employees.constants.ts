export const EMPLOYEE_GENDER = { male: '1', female: '2' } as const;
export const EMPLOYEE_GENDER_NAMES = { male: 'Male', female: 'Female' } as const;
export const EMPLOYEE_FILTER_PARAMS = { roleId: 'roleId' } as const;
export const EMPLOYEE_FILE_NAMES = {
  export: 'Employees.xlsx',
  template: 'EmployeesImportTemplate.xlsx',
} as const;
export const EMPLOYEE_IMPORT = {
  extensions: ['.xlsx', '.xls'],
  maxBytes: 10 * 1024 * 1024,
  accept: '.xlsx,.xls',
} as const;
