import type { TFunction } from 'i18next';
import { z } from 'zod';
import { STUDENT_GENDER, STUDENT_VALIDATION } from '../constants';

export function createStudentSchema(t: TFunction, isEdit: boolean) {
  const required = t('validation.required');
  const rules = STUDENT_VALIDATION;

  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(1, required)
        .max(rules.fullNameMax, t('students.validation.name')),
      email: z
        .string()
        .trim()
        .min(1, required)
        .email(t('students.validation.email'))
        .max(rules.emailMax, t('students.validation.email')),
      phoneNumber: z
        .string()
        .trim()
        .min(1, required)
        .max(rules.phoneMax)
        .regex(rules.phone, t('students.validation.phone')),
      parentPhoneNumber: z
        .string()
        .trim()
        .min(1, required)
        .max(rules.phoneMax)
        .regex(rules.phone, t('students.validation.phone')),
      educationLevelId: z.string().min(1, required),
      educationGradeId: z.string().min(1, required),
      gender: z.enum([STUDENT_GENDER.male, STUDENT_GENDER.female], {
        errorMap: () => ({ message: required }),
      }),
      isActive: z.boolean(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine((values, ctx) => {
      if ((!isEdit || values.password) && !rules.password.test(values.password))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: t('students.validation.password'),
        });
      if (values.password !== values.confirmPassword)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: t('students.validation.confirmPassword'),
        });
    });
}
