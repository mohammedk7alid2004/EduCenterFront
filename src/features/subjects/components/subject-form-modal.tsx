import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, FeedbackDialog, Icon, Input, Modal, StatusSwitch } from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import type { ApiError } from '@/infrastructure/api';
import type { SubjectDto } from '../subjects.types';
import { useSaveSubject } from '../subjects.queries';
export function SubjectFormModal({
  subject,
  onClose,
}: {
  subject?: SubjectDto | null;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const arabic = i18n.language.startsWith('ar');
  const isEdit = Boolean(subject);
  const online = useOnline();
  const [success, setSuccess] = useState(false);
  const schema = z
    .object({
      nameAr: z.string().trim(),
      nameEn: z.string().trim(),
      noteAr: z.string(),
      noteEn: z.string(),
      isActive: z.boolean(),
    })
    .refine((values) => values.nameAr || values.nameEn, {
      path: [arabic ? 'nameAr' : 'nameEn'],
      message: t('validation.subjectName'),
    });
  type Values = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameAr: subject?.name.ar ?? '',
      nameEn: subject?.name.en ?? '',
      noteAr: subject?.note.ar ?? '',
      noteEn: subject?.note.en ?? '',
      isActive: subject?.isActive ?? true,
    },
  });
  const mutation = useSaveSubject(subject?.id);
  function submit(values: Values) {
    if (!online) return;
    mutation.mutate(values, {
      onSuccess: () => setSuccess(true),
      onError: (error: ApiError) => setServerErrors(error, setError),
    });
  }
  const title = t(isEdit ? 'subjects.form.editTitle' : 'subjects.form.createTitle');
  if (success)
    return (
      <FeedbackDialog
        title={title}
        description={t(isEdit ? 'subjects.feedback.updated' : 'subjects.feedback.created')}
        onClose={onClose}
      />
    );
  return (
    <Modal title={title} icon="bookOpen" onClose={onClose} pending={mutation.isPending}>
      <form onSubmit={handleSubmit(submit)} noValidate>
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
          className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 disabled:opacity-60"
        >
          <div className="sm:col-span-2">
            <Input
              {...register(arabic ? 'nameAr' : 'nameEn')}
              label={t('subjects.table.name')}
              placeholder={t('subjects.form.namePlaceholder')}
              requiredAsterisk
              error={arabic ? errors.nameAr?.message : errors.nameEn?.message}
            />
          </div>
          <div className="flex h-10 items-center justify-between rounded-full border border-muted/60 px-3">
            <span className="text-sm">{t('common.status')}</span>
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
            <label htmlFor="subject-notes" className="mb-2 block text-sm font-medium">
              {t('subjects.table.note')}
            </label>
            <textarea
              id="subject-notes"
              {...register(arabic ? 'noteAr' : 'noteEn')}
              rows={3}
              placeholder={t('teachers.form.notesPlaceholder')}
              className="w-full resize-y rounded-2xl border border-muted/60 bg-card p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </fieldset>
        <div className="mt-8 flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl border border-primary text-primary"
            onClick={onClose}
            disabled={mutation.isPending}
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
            {t(isEdit ? 'common.saveChanges' : 'common.save')}
            <Icon name="checkCircle" className="size-5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
