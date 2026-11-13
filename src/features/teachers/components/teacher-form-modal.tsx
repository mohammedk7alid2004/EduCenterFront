import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Input } from '@/shared/ui';
import { setServerErrors } from '@/shared/lib';
import type { ApiError } from '@/core/api';
import { useSubjects } from '@/features/subjects';
import type { TeacherDto } from '../teachers.types';
import { useCreateTeacher, useUpdateTeacher } from '../teachers.queries';

const createSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  password: z.string().min(6),
  subjectIds: z.array(z.string()).min(1),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

const editSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  subjectIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;
type FormValues = CreateFormValues & EditFormValues;

interface TeacherFormModalProps {
  teacher?: TeacherDto | null;
  onClose: () => void;
}

export function TeacherFormModal({ teacher, onClose }: TeacherFormModalProps): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'ar' | 'en';
  const isEdit = Boolean(teacher);

  const { data: subjectsData } = useSubjects({ pageSize: 100 });
  const allSubjects = subjectsData?.items ?? [];

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      fullName: teacher?.name ?? '',
      email: teacher?.email ?? '',
      phoneNumber: teacher?.phoneNumber ?? '',
      password: '',
      subjectIds: teacher?.subjects.map((s) => s.id) ?? [],
      notes: teacher?.notes ?? '',
      isActive: teacher?.isActive ?? true,
    },
  });

  useEffect(() => {
    reset({
      fullName: teacher?.name ?? '',
      email: teacher?.email ?? '',
      phoneNumber: teacher?.phoneNumber ?? '',
      password: '',
      subjectIds: teacher?.subjects.map((s) => s.id) ?? [],
      notes: teacher?.notes ?? '',
      isActive: teacher?.isActive ?? true,
    });
  }, [teacher, reset]);

  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const selectedSubjectIds = watch('subjectIds') ?? [];

  function toggleSubject(id: string) {
    const current = selectedSubjectIds as string[];
    if (current.includes(id)) {
      setValue(
        'subjectIds',
        current.filter((s) => s !== id),
        { shouldValidate: true },
      );
    } else {
      setValue('subjectIds', [...current, id], { shouldValidate: true });
    }
  }

  function onSubmit(values: FormValues) {
    const handleError = (error: ApiError) => {
      setServerErrors(error, setError);
    };

    if (isEdit && teacher) {
      const payload = {
        id: teacher.id,
        fullName: values.fullName || undefined,
        email: values.email || undefined,
        phoneNumber: values.phoneNumber || undefined,
        password: values.password || undefined,
        subjectIds: values.subjectIds,
        notes: values.notes || undefined,
        isActive: values.isActive,
      };
      updateMutation.mutate(payload, { onSuccess: onClose, onError: handleError });
    } else {
      createMutation.mutate(
        {
          fullName: values.fullName!,
          email: values.email!,
          phoneNumber: values.phoneNumber || undefined,
          password: values.password!,
          subjectIds: values.subjectIds ?? [],
          notes: values.notes || undefined,
          isActive: values.isActive ?? true,
        },
        { onSuccess: onClose, onError: handleError },
      );
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
    >
      <div className="w-full max-w-2xl rounded-lg bg-card p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          {isEdit ? t('teachers.form.editTitle') : t('teachers.form.createTitle')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              {...register('fullName')}
              label={t('teachers.form.fullName')}
              requiredAsterisk={!isEdit}
              error={errors.fullName?.message}
            />
            <Input
              {...register('email')}
              type="email"
              label={t('teachers.form.email')}
              requiredAsterisk={!isEdit}
              startIcon="atSign"
              error={errors.email?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              {...register('phoneNumber')}
              type="tel"
              label={t('teachers.form.phone')}
              startIcon="phone"
              error={errors.phoneNumber?.message}
            />
            <Input
              {...register('password')}
              type="password"
              label={t('teachers.form.password')}
              requiredAsterisk={!isEdit}
              startIcon="lock"
              error={errors.password?.message}
              helperText={isEdit ? t('teachers.form.passwordHelp') : undefined}
            />
          </div>

          <Input
            {...register('notes')}
            label={t('teachers.form.notes')}
            startIcon="stickyNote"
            error={errors.notes?.message}
          />

          {/* Subjects multi-select */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {t('teachers.form.subjects')}
              {!isEdit && <span className="ms-1 font-semibold text-danger">*</span>}
            </p>
            {allSubjects.length === 0 ? (
              <p className="text-sm text-muted">{t('teachers.form.noSubjects')}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allSubjects.map((subject) => {
                  const label =
                    subject.name[lang] ?? subject.name.en ?? subject.name.ar ?? subject.id;
                  const selected = (selectedSubjectIds as string[]).includes(subject.id);
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => toggleSubject(subject.id)}
                      className={`rounded-full border px-3 py-1 text-sm transition ${
                        selected
                          ? 'border-primary bg-primary text-card'
                          : 'border-border bg-card text-foreground hover:border-primary hover:text-primary'
                      }`}
                    >
                      {selected && <Icon name="check" className="me-1 inline size-3" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.subjectIds && (
              <p className="mt-1.5 text-xs text-danger">{errors.subjectIds.message}</p>
            )}
          </div>

          {/* isActive toggle */}
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {t('teachers.form.isActive')}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className="focus:outline-none"
                >
                  <Icon
                    name={field.value ? 'toggleRight' : 'toggleLeft'}
                    className={`size-8 ${field.value ? 'text-success' : 'text-muted'}`}
                  />
                </button>
              </label>
            )}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={isPending}>
              {isEdit ? t('teachers.form.update') : t('teachers.form.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
