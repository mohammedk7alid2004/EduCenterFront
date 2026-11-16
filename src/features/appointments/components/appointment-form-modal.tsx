import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, ErrorState, FeedbackDialog, Icon, Input, LoadingState, Modal } from '@/shared/ui';
import { setServerErrors, useOnline } from '@/shared/lib';
import {
  useAppointment,
  useAppointmentOptions,
  useAppointmentTeachers,
  useSaveAppointment,
} from '../appointments.queries';
import { APPOINTMENT_ITERATION, APPOINTMENT_STATUS, WEEK_DAYS } from '../appointments.constants';
import type { AppointmentDto, AppointmentValues } from '../appointments.types';
import { localizedName, timeMinutes } from '../appointments.lib';
import { AppointmentSelect } from './appointment-select';
export function AppointmentFormModal({
  appointment,
  onClose,
}: {
  appointment: AppointmentDto | null;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const query = useAppointment(appointment?.id);
  if (appointment && (query.isPending || query.error))
    return (
      <Modal title={t('appointments.edit')} icon="clock" size="form" onClose={onClose}>
        {query.isPending ? (
          <LoadingState />
        ) : (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        )}
      </Modal>
    );
  return <AppointmentForm appointment={appointment ? query.data : undefined} onClose={onClose} />;
}
function AppointmentForm({
  appointment,
  onClose,
}: {
  appointment?: AppointmentDto;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const online = useOnline();
  const [success, setSuccess] = useState(false);
  const required = z.string().trim().min(1, t('validation.required'));
  const positive = z
    .number({ invalid_type_error: t('appointments.validation.positive') })
    .int(t('appointments.validation.positive'))
    .min(1, t('appointments.validation.positive'));
  const schema = z
    .object({
      groupName: required,
      subjectId: required,
      teacherId: required,
      classroomId: required,
      level: required,
      grade: required,
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
    .refine((values) => timeMinutes(values.endTime) > timeMinutes(values.startTime), {
      path: ['endTime'],
      message: t('appointments.validation.time'),
    });
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AppointmentValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      groupName: appointment?.groupName ?? '',
      subjectId: appointment?.subjectId ?? '',
      teacherId: appointment?.teacherId ?? '',
      classroomId: appointment?.classroomId ?? '',
      level: appointment?.level ?? '',
      grade: appointment?.grade ?? '',
      startTime: appointment?.startTime.slice(0, 5) ?? '10:00',
      endTime: appointment?.endTime.slice(0, 5) ?? '12:00',
      days: appointment?.days ?? [],
      iteration: appointment?.iteration ?? APPOINTMENT_ITERATION.weekly,
      numberOfIterations: appointment?.numberOfIterations ?? 1,
      maxCapacity: appointment?.maxCapacity ?? 1,
      notes: appointment?.notes ?? '',
      status: appointment?.status ?? APPOINTMENT_STATUS.active,
    },
  });
  const subjectId = watch('subjectId');
  const subjects = useAppointmentOptions('subjects');
  const classrooms = useAppointmentOptions('classrooms');
  const teachers = useAppointmentTeachers(subjectId, Boolean(subjectId));
  const mutation = useSaveAppointment(appointment?.id);
  const title = t(appointment ? 'appointments.edit' : 'appointments.create');
  const optionError = subjects.error || classrooms.error || teachers.error;
  const optionsLoading =
    subjects.isPending || classrooms.isPending || (Boolean(subjectId) && teachers.isPending);
  const currentOption = (options: { id: string; name: string }[], id?: string, name?: string) =>
    id && name && !options.some((option) => option.id === id)
      ? [{ id, name }, ...options]
      : options;
  if (success)
    return (
      <FeedbackDialog
        title={title}
        description={t(appointment ? 'appointments.updated' : 'appointments.created')}
        onClose={onClose}
      />
    );
  return (
    <Modal title={title} icon="clock" size="form" onClose={onClose} pending={mutation.isPending}>
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          if (online && !optionError && !optionsLoading)
            mutation.mutate(values, {
              onSuccess: () => setSuccess(true),
              onError: (error) => setServerErrors(error, setError),
            });
        })}
      >
        {optionError && (
          <div className="mb-4">
            <ErrorState
              error={optionError}
              onRetry={() => {
                void subjects.refetch();
                void classrooms.refetch();
                if (subjectId) void teachers.refetch();
              }}
            />
          </div>
        )}
        {optionsLoading && (
          <p role="status" className="mb-4 text-sm text-muted">
            {t('common.loading')}
          </p>
        )}
        {(!online || mutation.error) && (
          <p role="alert" className="mb-5 rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {!online
              ? t('errors.network')
              : t(mutation.error?.message ?? 'errors.unknown', {
                  defaultValue: mutation.error?.message,
                })}
          </p>
        )}
        <fieldset
          disabled={mutation.isPending}
          className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2"
        >
          <Input
            {...register('groupName')}
            label={t('appointments.fields.groupName')}
            requiredAsterisk
            error={errors.groupName?.message}
            placeholder={t('appointments.groupPlaceholder')}
          />
          <AppointmentSelect
            {...register('subjectId', { onChange: () => setValue('teacherId', '') })}
            label={t('appointments.fields.subject')}
            requiredAsterisk
            error={errors.subjectId?.message}
            disabled={subjects.isPending}
            placeholder={t('appointments.selectPlaceholder')}
            options={currentOption(
              (subjects.data ?? []).map((option) => ({
                id: option.id,
                name: localizedName(option.name, i18n.language),
              })),
              appointment?.subjectId,
              appointment && localizedName(appointment.subject, i18n.language),
            )}
          />
          <AppointmentSelect
            {...register('teacherId')}
            label={t('appointments.fields.teacher')}
            requiredAsterisk
            error={errors.teacherId?.message}
            disabled={!subjectId || teachers.isPending}
            placeholder={t('appointments.selectTeacher')}
            options={currentOption(
              teachers.data ?? [],
              subjectId === appointment?.subjectId ? appointment?.teacherId : undefined,
              appointment?.teacher,
            )}
          />
          <AppointmentSelect
            {...register('classroomId')}
            label={t('appointments.fields.classroom')}
            requiredAsterisk
            error={errors.classroomId?.message}
            disabled={classrooms.isPending}
            placeholder={t('appointments.selectPlaceholder')}
            options={currentOption(
              (classrooms.data ?? []).map((option) => ({
                id: option.id,
                name: localizedName(option.name, i18n.language),
              })),
              appointment?.classroomId,
              appointment && localizedName(appointment.classroom, i18n.language),
            )}
          />
          <Input
            {...register('level')}
            label={t('appointments.fields.level')}
            requiredAsterisk
            error={errors.level?.message}
          />
          <Input
            {...register('grade')}
            label={t('appointments.fields.grade')}
            requiredAsterisk
            error={errors.grade?.message}
          />
          <Input
            {...register('startTime')}
            type="time"
            step={60}
            label={t('appointments.fields.startTime')}
            requiredAsterisk
            error={errors.startTime?.message}
          />
          <Input
            {...register('endTime')}
            type="time"
            step={60}
            label={t('appointments.fields.endTime')}
            requiredAsterisk
            error={errors.endTime?.message}
          />
          <div>
            <span id="appointment-days-label" className="mb-2 block text-sm font-medium">
              {t('appointments.fields.days')}
              <span className="ms-1 text-danger">*</span>
            </span>
            <Controller
              name="days"
              control={control}
              render={({ field }) => (
                <div
                  role="group"
                  aria-labelledby="appointment-days-label"
                  className="flex flex-wrap gap-2"
                >
                  {WEEK_DAYS.map((day) => (
                    <label
                      key={day}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${field.value.includes(day) ? 'border-primary bg-permissionSurface text-primary' : 'border-border text-tableHeading'}`}
                    >
                      <input
                        type="checkbox"
                        className="me-1 accent-primary"
                        checked={field.value.includes(day)}
                        onChange={(event) =>
                          field.onChange(
                            event.target.checked
                              ? [...field.value, day]
                              : field.value.filter((value) => value !== day),
                          )
                        }
                      />
                      {t(`appointments.days.${day}`)}
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.days && (
              <p role="alert" className="mt-1 text-xs text-danger">
                {errors.days.message}
              </p>
            )}
          </div>
          <AppointmentSelect
            {...register('iteration', { valueAsNumber: true })}
            label={t('appointments.fields.iteration')}
            requiredAsterisk
            error={errors.iteration?.message}
            options={Object.entries(APPOINTMENT_ITERATION).map(([key, value]) => ({
              id: String(value),
              name: t(`appointments.iterations.${key}`),
            }))}
          />
          <Input
            {...register('numberOfIterations', { valueAsNumber: true })}
            type="number"
            min={1}
            step={1}
            label={t('appointments.fields.numberOfIterations')}
            requiredAsterisk
            error={errors.numberOfIterations?.message}
          />
          <Input
            {...register('maxCapacity', { valueAsNumber: true })}
            type="number"
            min={1}
            step={1}
            label={t('appointments.fields.maxCapacity')}
            requiredAsterisk
            error={errors.maxCapacity?.message}
          />
          <AppointmentSelect
            {...register('status', { valueAsNumber: true })}
            label={t('common.status')}
            error={errors.status?.message}
            options={Object.entries(APPOINTMENT_STATUS).map(([key, value]) => ({
              id: String(value),
              name: t(`appointments.statuses.${key}`),
            }))}
          />
          <div className="sm:col-span-2">
            <label htmlFor="appointment-notes" className="mb-2 block text-sm font-medium">
              {t('appointments.fields.notes')}
            </label>
            <textarea
              id="appointment-notes"
              {...register('notes')}
              rows={3}
              className="w-full resize-y rounded-2xl border border-muted/60 bg-card p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </fieldset>
        <div className="mt-10 flex flex-wrap justify-end gap-4">
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
            disabled={!online || Boolean(optionError) || optionsLoading}
            className="rounded-xl px-6"
          >
            {t(appointment ? 'common.saveChanges' : 'common.save')}
            <Icon name="checkCircle" className="size-5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
