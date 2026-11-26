import type { TFunction } from 'i18next';
import { z } from 'zod';
import { APPOINTMENT_ITERATION, APPOINTMENT_STATUS } from '../constants';
import { appointmentEndMinutes, timeMinutes } from '../utils';

export function createAppointmentSchema(
  t: TFunction,
  getClassroomCapacity: (classroomId: string) => number | null | undefined,
) {
  const required = z.string().trim().min(1, t('validation.required'));
  const positive = z
    .number({ invalid_type_error: t('appointments.validation.positive') })
    .int(t('appointments.validation.positive'))
    .min(1, t('appointments.validation.positive'));

  return z
    .object({
      groupName: required,
      subjectId: required,
      teacherId: required,
      classroomId: required,
      levelId: required,
      gradeId: required,
      startTime: z.string().regex(/^\d{2}:\d{2}$/, t('validation.required')),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, t('validation.required')),
      days: z.array(z.number().int().min(0).max(6)).min(1, t('appointments.validation.days')),
      iteration: z
        .number()
        .refine(
          (value) => Object.values(APPOINTMENT_ITERATION).some((item) => item === value),
          t('validation.required'),
        ),
      numberOfIterations: positive,
      maxCapacity: positive,
      notes: z.string(),
      status: z
        .number()
        .refine(
          (value) => Object.values(APPOINTMENT_STATUS).some((item) => item === value),
          t('validation.required'),
        ),
    })
    .refine(
      (values) => {
        const start = timeMinutes(values.startTime);
        const end = appointmentEndMinutes(values.startTime, values.endTime);
        const duration = end - start;
        return duration > 0 && duration <= 12 * 60;
      },
      {
        path: ['endTime'],
        message: t('appointments.validation.time'),
      },
    )
    .superRefine((values, context) => {
      const capacity = getClassroomCapacity(values.classroomId);
      if (typeof capacity !== 'number' || values.maxCapacity > capacity)
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['maxCapacity'],
          message: t('appointments.validation.capacity', { count: capacity ?? 0 }),
        });
    });
}
