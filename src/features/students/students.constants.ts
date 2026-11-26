export const STUDENT_GENDER = { male: '1', female: '2' } as const;
export const STUDENT_GENDER_NAMES = { male: 'Male', female: 'Female' } as const;
export const STUDENT_FILTER_PARAMS = { level: 'level', grade: 'grade', gender: 'gender' } as const;
export const STUDENT_VALIDATION = {
  fullNameMax: 50,
  emailMax: 150,
  phoneMax: 20,
  passwordMin: 8,
  phone: /^(\+?20)?01[0125][0-9]{8}$|^\+9(66|71|65|74|73|68)[0-9]{7,9}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
} as const;
export const STUDENT_FILE_NAMES = {
  export: 'Students.xlsx',
  template: 'StudentsImportTemplate.xlsx',
} as const;
export const STUDENT_IMPORT = {
  extensions: ['.xlsx', '.xls'],
  maxBytes: 10 * 1024 * 1024,
  accept: '.xlsx,.xls',
} as const;
