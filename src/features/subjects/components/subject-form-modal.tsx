import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/shared/ui';
import { setServerErrors } from '@/shared/lib';
import type { ApiError } from '@/core/api';
import type { SubjectDto } from '../subjects.types';
import { useCreateSubject, useUpdateSubject } from '../subjects.queries';

const subjectSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  noteAr: z.string().optional(),
  noteEn: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectFormModalProps {
  subject?: SubjectDto | null;
  onClose: () => void;
}

export function SubjectFormModal({ subject, onClose }: SubjectFormModalProps): JSX.Element {
  const { t } = useTranslation();
  const isEdit = Boolean(subject);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      nameAr: subject?.name.ar ?? '',
      nameEn: subject?.name.en ?? '',
      noteAr: subject?.note.ar ?? '',
      noteEn: subject?.note.en ?? '',
    },
  });

  useEffect(() => {
    reset({
      nameAr: subject?.name.ar ?? '',
      nameEn: subject?.name.en ?? '',
      noteAr: subject?.note.ar ?? '',
      noteEn: subject?.note.en ?? '',
    });
  }, [subject, reset]);

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: SubjectFormValues) {
    const handleError = (error: ApiError) => {
      setServerErrors(error, setError);
    };

    if (isEdit && subject) {
      updateMutation.mutate(
        { id: subject.id, ...values },
        { onSuccess: onClose, onError: handleError },
      );
    } else {
      createMutation.mutate(values, { onSuccess: onClose, onError: handleError });
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
    >
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          {isEdit ? t('subjects.form.editTitle') : t('subjects.form.createTitle')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              {...register('nameAr')}
              label={t('subjects.form.nameAr')}
              requiredAsterisk
              error={errors.nameAr?.message}
              dir="rtl"
            />
            <Input
              {...register('nameEn')}
              label={t('subjects.form.nameEn')}
              requiredAsterisk
              error={errors.nameEn?.message}
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              {...register('noteAr')}
              label={t('subjects.form.noteAr')}
              error={errors.noteAr?.message}
              dir="rtl"
            />
            <Input
              {...register('noteEn')}
              label={t('subjects.form.noteEn')}
              error={errors.noteEn?.message}
              dir="ltr"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={isPending}>
              {isEdit ? t('subjects.form.update') : t('subjects.form.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
