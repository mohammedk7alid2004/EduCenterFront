import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ErrorState,
  FeedbackDialog,
  Icon,
  Input,
  LoadingState,
  Modal,
  StatusSwitch,
} from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import type { ClassroomDto, ClassroomValues } from '../types';
import { useClassroom } from '../queries';
import { useSaveClassroom } from '../commands';
import { CLASSROOM_CAPACITY } from '../constants';
import { createClassroomSchema } from '../schemas';
import { CapacityField } from './capacity-field';
export function ClassroomFormModal({
  classroom,
  onClose,
}: {
  classroom: ClassroomDto | null;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const query = useClassroom(classroom?.id);
  const title = t(classroom ? 'classrooms.form.editTitle' : 'classrooms.form.createTitle');
  if (classroom && (query.isPending || query.error))
    return (
      <Modal title={title} icon="classroom" size="form" onClose={onClose}>
        {query.isPending ? (
          <LoadingState />
        ) : (
          <ErrorState error={query.error!} onRetry={() => void query.refetch()} />
        )}
      </Modal>
    );
  return <ClassroomForm classroom={classroom ? query.data : undefined} onClose={onClose} />;
}
function ClassroomForm({
  classroom,
  onClose,
}: {
  classroom?: ClassroomDto;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const arabic = i18n.language.startsWith('ar');
  const online = useOnline();
  const [success, setSuccess] = useState(false);
  const schema = createClassroomSchema(t, arabic);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ClassroomValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameAr: classroom?.name.ar || (arabic ? classroom?.name.en : '') || '',
      nameEn: classroom?.name.en || (!arabic ? classroom?.name.ar : '') || '',
      noteAr: classroom?.note.ar ?? '',
      noteEn: classroom?.note.en ?? '',
      capacity: classroom?.capacity ?? CLASSROOM_CAPACITY.minimum,
      isActive: classroom?.isActive ?? true,
    },
  });
  const mutation = useSaveClassroom(classroom?.id);
  const title = t(classroom ? 'classrooms.form.editTitle' : 'classrooms.form.createTitle');
  if (success)
    return (
      <FeedbackDialog
        title={title}
        description={t(classroom ? 'classrooms.feedback.updated' : 'classrooms.feedback.created')}
        onClose={onClose}
      />
    );
  return (
    <Modal
      title={title}
      icon="classroom"
      size="form"
      onClose={onClose}
      pending={mutation.isPending}
    >
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          if (online)
            mutation.mutate(values, {
              onSuccess: () => setSuccess(true),
              onError: (error) => setServerErrors(error, setError),
            });
        })}
      >
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
            {...register(arabic ? 'nameAr' : 'nameEn')}
            label={t('classrooms.form.name')}
            placeholder={t('classrooms.form.namePlaceholder')}
            requiredAsterisk={!classroom}
            error={arabic ? errors.nameAr?.message : errors.nameEn?.message}
          />
          <Controller
            name="capacity"
            control={control}
            render={({ field }) => (
              <CapacityField
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                error={errors.capacity?.message}
                disabled={mutation.isPending}
                required={!classroom}
              />
            )}
          />
          <div className="flex h-[43px] items-center justify-between rounded-full border border-muted/60 px-3 text-sm">
            <span>{t('common.status')}</span>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <StatusSwitch
                  active={field.value}
                  onChange={() => field.onChange(!field.value)}
                  disabled={mutation.isPending}
                />
              )}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="classroom-notes" className="mb-2 block text-sm font-medium">
              {t('classrooms.form.notes')}
            </label>
            <textarea
              id="classroom-notes"
              {...register(arabic ? 'noteAr' : 'noteEn')}
              rows={3}
              placeholder={t('classrooms.form.notesPlaceholder')}
              className="w-full resize-y rounded-2xl border border-muted/60 bg-card p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
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
            disabled={!online}
            className="rounded-xl px-6"
          >
            {t(classroom ? 'common.saveChanges' : 'common.save')}
            <Icon name="checkCircle" className="size-5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
