import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ErrorState,
  FeedbackDialog,
  Icon,
  Input,
  LoadingState,
  Modal,
} from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import {
  useAppointment,
  useAppointmentOptions,
  useAppointmentTeachers,
  useAppointmentGrades,
  useSaveAppointment,
} from '../appointments.queries';
import { APPOINTMENT_ITERATION, APPOINTMENT_STATUS } from '../appointments.constants';
import type { AppointmentDto, AppointmentValues } from '../appointments.types';
import { localizedName, timeMinutes } from '../appointments.lib';
import { AppointmentSelect } from './appointment-select';
import { AppointmentDaysSelect } from './appointment-days-select';
import { AppointmentTimeField } from './appointment-time-field';
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
  const classrooms = useAppointmentOptions('classrooms');
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
    .refine((values) => timeMinutes(values.endTime) > timeMinutes(values.startTime), {
      path: ['endTime'],
      message: t('appointments.validation.time'),
    })
    .superRefine((values, context) => {
      const capacity = classrooms.data?.find(
        (option) => option.id === values.classroomId,
      )?.capacity;
      if (typeof capacity !== 'number' || values.maxCapacity > capacity)
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['maxCapacity'],
          message: t('appointments.validation.capacity', { count: capacity ?? 0 }),
        });
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
      levelId: appointment?.levelId ?? '',
      gradeId: appointment?.gradeId ?? '',
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
  const levelId = watch('levelId');
  const classroomCapacity = classrooms.data?.find(
    (option) => option.id === watch('classroomId'),
  )?.capacity;
  const levels = useAppointmentOptions('levels');
  const grades = useAppointmentGrades(levelId);
  const subjects = useAppointmentOptions('subjects');
  const teachers = useAppointmentTeachers(subjectId, Boolean(subjectId));
  const mutation = useSaveAppointment(appointment?.id);
  const title = t(appointment ? 'appointments.edit' : 'appointments.create');
  const optionError =
    subjects.error || classrooms.error || teachers.error || levels.error || grades.error;
  const optionsLoading =
    subjects.isPending ||
    classrooms.isPending ||
    levels.isPending ||
    (Boolean(levelId) && grades.isPending) ||
    (Boolean(subjectId) && teachers.isPending);
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
    <Modal
      title={title}
      icon="clock"
      size="appointment"
      onClose={onClose}
      pending={mutation.isPending}
    >
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
                void levels.refetch();
                if (levelId) void grades.refetch();
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
          className="grid min-w-0 grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2"
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
            {...register('classroomId', {
              onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
                const capacity = classrooms.data?.find(
                  (option) => option.id === event.target.value,
                )?.capacity;
                if (typeof capacity === 'number' && capacity > 0)
                  setValue('maxCapacity', capacity, { shouldDirty: true, shouldValidate: true });
              },
            })}
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
          <AppointmentSelect
            {...register('levelId', {
              onChange: () => setValue('gradeId', '', { shouldDirty: true }),
            })}
            label={t('appointments.fields.level')}
            requiredAsterisk
            error={errors.levelId?.message}
            disabled={levels.isPending}
            placeholder={t('appointments.selectPlaceholder')}
            options={(levels.data ?? []).map((option) => ({
              id: option.id,
              name: localizedName(option.name, i18n.language),
            }))}
          />
          <AppointmentSelect
            {...register('gradeId')}
            label={t('appointments.fields.grade')}
            requiredAsterisk
            error={errors.gradeId?.message}
            disabled={!levelId || grades.isPending}
            placeholder={t('appointments.selectGrade')}
            options={(grades.data ?? []).map((option) => ({
              id: option.id,
              name: localizedName(option.name, i18n.language),
            }))}
          />
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <AppointmentTimeField
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                label={t('appointments.fields.startTime')}
                error={errors.startTime?.message}
              />
            )}
          />
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <AppointmentTimeField
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                label={t('appointments.fields.endTime')}
                error={errors.endTime?.message}
              />
            )}
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
                <AppointmentDaysSelect
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.days?.message}
                />
              )}
            />
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              {t('appointments.fields.iteration')}
              <span className="ms-1 text-danger">*</span>
            </legend>
            <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-2 rounded-full border border-muted/60 bg-card px-4">
              {Object.entries(APPOINTMENT_ITERATION).map(([key, value]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <input
                    {...register('iteration', { valueAsNumber: true })}
                    type="radio"
                    value={value}
                    className="size-4 accent-primary"
                  />
                  {t(`appointments.iterations.${key}`)}
                </label>
              ))}
            </div>
            {errors.iteration?.message && (
              <p role="alert" className="mt-1 text-xs text-danger">
                {errors.iteration.message}
              </p>
            )}
          </fieldset>
          <Input
            {...register('numberOfIterations', { valueAsNumber: true })}
            type="number"
            min={1}
            step={1}
            label={t('appointments.fields.numberOfIterations')}
            requiredAsterisk
            error={errors.numberOfIterations?.message}
          />
          <Controller
            name="maxCapacity"
            control={control}
            render={({ field }) => (
              <Input
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={Number.isNaN(field.value) ? '' : field.value}
                onChange={(event) =>
                  field.onChange(
                    Number.isNaN(event.target.valueAsNumber)
                      ? Number.NaN
                      : Math.min(event.target.valueAsNumber, classroomCapacity ?? 0),
                  )
                }
                type="number"
                min={1}
                max={classroomCapacity ?? undefined}
                step={1}
                disabled={!classroomCapacity}
                label={t('appointments.fields.maxCapacity')}
                helperText={
                  classroomCapacity
                    ? t('appointments.classroomCapacity', { count: classroomCapacity })
                    : t('appointments.selectClassroomFirst')
                }
                requiredAsterisk
                error={errors.maxCapacity?.message}
              />
            )}
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
        <div className="mt-6 flex flex-wrap justify-end gap-3">
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
