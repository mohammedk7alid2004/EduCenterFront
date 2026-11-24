import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, ErrorState, FeedbackDialog, Icon, Modal, Select } from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import { ATTENDANCE_STATUS, type AttendanceValues } from '../attendance.types';
import {
  useAttendanceAppointmentOptions,
  useAttendanceStudents,
  useRecordAttendance,
} from '../attendance.queries';
export function AttendanceFormModal({ onClose }: { onClose: () => void }): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const [success, setSuccess] = useState(false);
  const students = useAttendanceStudents();
  const mutation = useRecordAttendance();
  const schema = z.object({
    studentId: z.string().min(1, t('validation.required')),
    status: z.coerce
      .number()
      .refine(
        (value) => Object.values(ATTENDANCE_STATUS).includes(value as 1 | 2 | 3 | 4),
        t('validation.required'),
      ),
    appointmentId: z.string().min(1, t('validation.required')),
    notes: z.string().max(2000, t('validation.maxLength', { count: 2000 })),
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AttendanceValues>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: '', appointmentId: '', status: '', notes: '' },
  });
  const studentField = register('studentId');
  const selectedStudentId = watch('studentId');
  const selectedAppointmentId = watch('appointmentId');
  const appointments = useAttendanceAppointmentOptions(selectedStudentId);
  const selectedAppointment = appointments.data?.find(
    (appointment) => appointment.id === selectedAppointmentId,
  );
  if (success)
    return (
      <FeedbackDialog
        title={t('attendance.recordTitle')}
        description={t('attendance.feedback.recorded')}
        onClose={onClose}
      />
    );
  return (
    <Modal
      title={t('attendance.recordTitle')}
      icon="listChecks"
      size="form"
      onClose={onClose}
      pending={mutation.isPending}
    >
      {students.error ? (
        <ErrorState error={students.error} onRetry={() => void students.refetch()} />
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit((values) =>
            mutation.mutate(values, { onSuccess: () => setSuccess(true) }),
          )}
        >
          {!online && (
            <p role="alert" className="mb-5 rounded-xl bg-warning/10 p-3 text-sm text-warning">
              {t('errors.network')}
            </p>
          )}
          {mutation.error && (
            <p role="alert" className="mb-5 rounded-xl bg-danger/10 p-3 text-sm text-danger">
              {mutation.error.message}
            </p>
          )}
          <fieldset
            disabled={mutation.isPending || students.isPending}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            <Select
              {...studentField}
              onChange={(event) => {
                studentField.onChange(event);
                setValue('appointmentId', '', { shouldValidate: true });
              }}
              label={t('attendance.student')}
              requiredAsterisk
              error={errors.studentId?.message}
              options={(students.data ?? []).map((student) => ({
                id: student.id,
                name: student.phoneNumber
                  ? `${student.name} - ${student.phoneNumber}`
                  : student.name,
              }))}
              placeholder={t(students.isPending ? 'common.loading' : 'attendance.selectStudent')}
            />
            <Select
              {...register('appointmentId')}
              label={t('attendance.appointment')}
              requiredAsterisk
              error={errors.appointmentId?.message}
              disabled={!selectedStudentId || appointments.isPending}
              options={(appointments.data ?? []).map((appointment) => ({
                id: appointment.id,
                name: appointment.groupName,
              }))}
              placeholder={t(
                !selectedStudentId
                  ? 'attendance.selectStudentFirst'
                  : appointments.isPending
                    ? 'common.loading'
                    : 'attendance.selectAppointment',
              )}
            />
            <Select
              label={t('attendance.classroom')}
              disabled
              value={selectedAppointment?.classroomName ?? ''}
              options={
                selectedAppointment
                  ? [
                      {
                        id: selectedAppointment.classroomName,
                        name: selectedAppointment.classroomName,
                      },
                    ]
                  : []
              }
              placeholder={t('attendance.classroomAuto')}
            />
            <Select
              {...register('status')}
              label={t('attendance.status')}
              requiredAsterisk
              error={errors.status?.message}
              options={Object.entries(ATTENDANCE_STATUS).map(([key, value]) => ({
                id: String(value),
                name: t(`attendance.statuses.${key}`),
              }))}
              placeholder={t('attendance.selectStatus')}
            />
            <div className="sm:col-span-2">
              <label htmlFor="attendance-notes" className="mb-2 block text-sm font-medium">
                {t('attendance.notes')}
              </label>
              <textarea
                {...register('notes')}
                id="attendance-notes"
                rows={4}
                placeholder={t('attendance.notesPlaceholder')}
                className="w-full resize-y rounded-2xl border border-muted/60 bg-card p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              {errors.notes?.message && (
                <p className="mt-1 text-xs text-danger">{errors.notes.message}</p>
              )}
            </div>
          </fieldset>
          <div className="mt-10 flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl border border-primary text-primary"
              disabled={mutation.isPending}
              onClick={onClose}
            >
              {t('common.cancel')}
              <Icon name="close" className="size-4" />
            </Button>
            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={!online || students.isPending || mutation.isPending}
              className="rounded-xl px-6"
            >
              {t('common.save')}
              <Icon name="check" className="size-5" />
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
