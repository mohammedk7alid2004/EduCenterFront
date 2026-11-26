import type { TFunction } from 'i18next';
import { z } from 'zod';
import { ATTENDANCE_STATUS } from '../types';
import { toIsoDate, weekdayOfIsoDate } from '../utils';

export function createAttendanceSchema(t: TFunction) {
  return z
    .object({
      studentId: z.string().min(1, t('validation.required')),
      status: z.coerce
        .number()
        .refine(
          (value) => Object.values(ATTENDANCE_STATUS).includes(value as 1 | 2 | 3 | 4),
          t('validation.required'),
        ),
      appointmentId: z.string().min(1, t('validation.required')),
      sessionDay: z.string().min(1, t('validation.required')),
      sessionDate: z
        .string()
        .min(1, t('validation.required'))
        .refine((value) => value <= toIsoDate(new Date()), t('attendance.sessionDateFuture')),
      notes: z.string().max(2000, t('validation.maxLength', { count: 2000 })),
    })
    .refine((values) => weekdayOfIsoDate(values.sessionDate) === Number(values.sessionDay), {
      path: ['sessionDate'],
      message: t('attendance.sessionDateWrongDay'),
    });
}
