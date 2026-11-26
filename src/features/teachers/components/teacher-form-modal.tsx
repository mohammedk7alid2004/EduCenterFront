import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button, FeedbackDialog, Icon, Input, Modal, StatusSwitch } from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import type { ApiError } from '@/shared/api';
import { createTeacherSchema, type TeacherFormValues as Values } from '../schemas';
import type { TeacherDto } from '../types';
import { useCreateTeacher, useUpdateTeacher } from '../commands';
import { TeacherSubjectsPicker } from './teacher-subjects-picker';

export function TeacherFormModal({
  teacher,
  onClose,
}: {
  teacher?: TeacherDto | null;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const isEdit = Boolean(teacher);
  const online = useOnline();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const schema = createTeacherSchema(t, isEdit);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: teacher?.name ?? '',
      email: teacher?.email ?? '',
      phoneNumber: teacher?.phoneNumber ?? '',
      password: '',
      subjectIds: teacher?.subjects.map((subject) => subject.id) ?? [],
      notes: teacher?.notes ?? '',
      isActive: teacher?.isActive ?? true,
    },
  });
  const create = useCreateTeacher();
  const update = useUpdateTeacher();
  const pending = create.isPending || update.isPending;
  const failure = create.error || update.error;
  function submit(values: Values) {
    if (!online) return;
    const callbacks = {
      onSuccess: () => setSuccess(true),
      onError: (error: ApiError) => setServerErrors(error, setError),
    };
    if (teacher)
      update.mutate(
        { ...values, id: teacher.id, password: values.password || undefined },
        callbacks,
      );
    else create.mutate(values, callbacks);
  }
  const title = t(isEdit ? 'teachers.form.editTitle' : 'teachers.form.createTitle');
  if (success)
    return (
      <FeedbackDialog
        title={title}
        description={t(isEdit ? 'teachers.feedback.updated' : 'teachers.feedback.created')}
        onClose={onClose}
      />
    );
  return (
    <Modal title={title} icon="graduationCap" onClose={onClose} pending={pending}>
      <form onSubmit={handleSubmit(submit)} noValidate>
        {(!online || failure) && (
          <p role="alert" className="mb-5 rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {!online
              ? t('errors.network')
              : t(failure?.message ?? 'errors.unknown', { defaultValue: failure?.message })}
          </p>
        )}
        <fieldset
          disabled={pending}
          className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 disabled:opacity-60"
        >
          <Input
            {...register('fullName')}
            label={t('teachers.form.fullName')}
            placeholder={t('teachers.form.namePlaceholder')}
            requiredAsterisk={!isEdit}
            error={errors.fullName?.message}
            autoComplete="name"
          />
          <Input
            {...register('phoneNumber')}
            label={t('teachers.form.phone')}
            placeholder={t('teachers.form.phonePlaceholder')}
            requiredAsterisk={!isEdit}
            error={errors.phoneNumber?.message}
            type="tel"
            autoComplete="tel"
          />
          <Input
            {...register('email')}
            label={t('teachers.form.email')}
            placeholder={t('teachers.form.emailPlaceholder')}
            requiredAsterisk
            error={errors.email?.message}
            type="email"
            autoComplete="email"
          />
          <Input
            {...register('password')}
            label={t('teachers.form.password')}
            placeholder={t('teachers.form.passwordPlaceholder')}
            requiredAsterisk={!isEdit}
            error={errors.password?.message}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            endIcon={showPassword ? 'eyeOff' : 'eye'}
            onEndIconClick={() => setShowPassword(!showPassword)}
            helperText={isEdit ? t('teachers.form.passwordHelp') : undefined}
          />
          <Controller
            name="subjectIds"
            control={control}
            render={({ field }) => (
              <TeacherSubjectsPicker
                selected={field.value}
                onChange={field.onChange}
                initialSubjects={teacher?.subjects ?? []}
                error={errors.subjectIds?.message}
              />
            )}
          />
          <div className="flex items-end">
            <div className="flex h-10 w-full items-center justify-between rounded-full border border-muted/60 px-3">
              <span className="text-sm">{t('common.status')}</span>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <StatusSwitch
                    active={field.value}
                    onChange={() => field.onChange(!field.value)}
                    disabled={pending}
                  />
                )}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="teacher-notes" className="mb-2 block text-sm font-medium">
              {t('teachers.form.notes')}
            </label>
            <textarea
              id="teacher-notes"
              {...register('notes')}
              rows={3}
              placeholder={t('teachers.form.notesPlaceholder')}
              className="w-full resize-y rounded-2xl border border-muted/60 bg-card p-3 text-sm outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </fieldset>
        <div className="mt-8 flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl border border-primary text-primary"
            onClick={onClose}
            disabled={pending}
          >
            {t('common.cancel')}
            <Icon name="close" className="size-4" />
          </Button>
          <Button type="submit" loading={pending} disabled={!online} className="rounded-xl px-6">
            {t(isEdit ? 'common.saveChanges' : 'common.save')}
            <Icon name="checkCircle" className="size-5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
