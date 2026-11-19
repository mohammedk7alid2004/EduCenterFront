import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import {
  Button,
  ErrorState,
  FeedbackDialog,
  Icon,
  Input,
  LoadingState,
  Modal,
  Select,
  StatusSwitch,
} from '@/shared/components';
import { STUDENT_GENDER, STUDENT_GENDER_NAMES, STUDENT_VALIDATION } from '../students.constants';
import { studentLocalizedName } from '../students.lib';
import { useStudent, useStudentEducation, useSaveStudent } from '../students.queries';
import type { StudentDto, StudentValues } from '../students.types';

export function StudentFormModal({
  student,
  onClose,
}: {
  student: StudentDto | null;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const query = useStudent(student?.id);
  if (student && (query.isPending || query.error))
    return (
      <Modal title={t('students.form.editTitle')} icon="students" size="form" onClose={onClose}>
        {query.isPending ? (
          <LoadingState />
        ) : (
          <ErrorState error={query.error!} onRetry={() => void query.refetch()} />
        )}
      </Modal>
    );
  return <StudentForm student={student ? query.data : undefined} onClose={onClose} />;
}

function StudentForm({
  student,
  onClose,
}: {
  student?: StudentDto;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const online = useOnline();
  const can = usePermission();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const required = t('validation.required');
  const rules = STUDENT_VALIDATION;
  const schema = z
    .object({
      fullName: z
        .string()
        .trim()
        .min(1, required)
        .max(rules.fullNameMax, t('students.validation.name')),
      email: z
        .string()
        .trim()
        .min(1, required)
        .email(t('students.validation.email'))
        .max(rules.emailMax, t('students.validation.email')),
      phoneNumber: z
        .string()
        .trim()
        .min(1, required)
        .max(rules.phoneMax)
        .regex(rules.phone, t('students.validation.phone')),
      parentPhoneNumber: z
        .string()
        .trim()
        .min(1, required)
        .max(rules.phoneMax)
        .regex(rules.phone, t('students.validation.phone')),
      educationLevelId: z.string().min(1, required),
      educationGradeId: z.string().min(1, required),
      gender: z.enum([STUDENT_GENDER.male, STUDENT_GENDER.female], {
        errorMap: () => ({ message: required }),
      }),
      isActive: z.boolean(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine((values, ctx) => {
      if ((!student || values.password) && !rules.password.test(values.password))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: t('students.validation.password'),
        });
      if (values.password !== values.confirmPassword)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: t('students.validation.confirmPassword'),
        });
    });
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<StudentValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: student?.name ?? '',
      email: student?.email ?? '',
      phoneNumber: student?.phoneNumber ?? '',
      parentPhoneNumber: student?.parentPhoneNumber ?? '',
      educationLevelId: student?.educationLevelId ?? '',
      educationGradeId: student?.educationGradeId ?? '',
      gender:
        student?.gender === STUDENT_GENDER_NAMES.male
          ? STUDENT_GENDER.male
          : student?.gender === STUDENT_GENDER_NAMES.female
            ? STUDENT_GENDER.female
            : '',
      isActive: student?.isActive ?? true,
      password: '',
      confirmPassword: '',
    },
  });
  const levelId = watch('educationLevelId');
  const levels = useStudentEducation('levels');
  const grades = useStudentEducation('grades', levelId);
  const mutation = useSaveStudent(student?.id);
  const options = (items: typeof levels.data) =>
    (items ?? []).map((item) => ({
      id: item.id,
      name: studentLocalizedName(item.name, i18n.language),
    }));
  const title = t(student ? 'students.form.editTitle' : 'students.form.createTitle');
  const optionError = levels.error ?? (levelId ? grades.error : null);
  if (success)
    return (
      <FeedbackDialog
        title={title}
        description={t(student ? 'students.feedback.updated' : 'students.feedback.created')}
        onClose={onClose}
      />
    );
  return (
    <Modal title={title} icon="students" size="form" onClose={onClose} pending={mutation.isPending}>
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          if (online && !optionError)
            mutation.mutate(values, {
              onSuccess: () => setSuccess(true),
              onError: (error) => setServerErrors(error, setError, { name: 'fullName' }),
            });
        })}
      >
        {optionError && (
          <div className="mb-5">
            <ErrorState
              error={optionError}
              onRetry={() => {
                void levels.refetch();
                if (levelId) void grades.refetch();
              }}
            />
          </div>
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
            {...register('fullName')}
            label={t('students.form.fullName')}
            placeholder={t('students.form.namePlaceholder')}
            requiredAsterisk
            error={errors.fullName?.message}
            autoComplete="name"
            maxLength={rules.fullNameMax}
          />
          <Input
            {...register('email')}
            label={t('students.form.email')}
            placeholder={t('students.form.emailPlaceholder')}
            requiredAsterisk
            error={errors.email?.message}
            type="email"
            autoComplete="email"
            maxLength={rules.emailMax}
          />
          <Input
            {...register('phoneNumber')}
            label={t('students.form.phoneNumber')}
            placeholder={t('students.form.phonePlaceholder')}
            requiredAsterisk
            error={errors.phoneNumber?.message}
            type="tel"
            autoComplete="tel"
            maxLength={rules.phoneMax}
          />
          <Input
            {...register('parentPhoneNumber')}
            label={t('students.form.parentPhoneNumber')}
            placeholder={t('students.form.parentPhonePlaceholder')}
            requiredAsterisk
            error={errors.parentPhoneNumber?.message}
            type="tel"
            maxLength={rules.phoneMax}
          />
          <Select
            {...register('educationLevelId', {
              onChange: () => setValue('educationGradeId', '', { shouldValidate: false }),
            })}
            label={t('students.form.level')}
            requiredAsterisk
            error={errors.educationLevelId?.message}
            options={options(levels.data)}
            placeholder={t(levels.isPending ? 'common.loading' : 'students.form.levelPlaceholder')}
            disabled={levels.isPending || Boolean(levels.error)}
          />
          <Select
            {...register('educationGradeId')}
            label={t('students.form.grade')}
            requiredAsterisk
            error={errors.educationGradeId?.message}
            options={options(grades.data)}
            placeholder={t(
              !levelId
                ? 'students.form.selectLevelFirst'
                : grades.isPending
                  ? 'common.loading'
                  : 'students.form.gradePlaceholder',
            )}
            disabled={!levelId || grades.isPending || Boolean(grades.error)}
          />
          <Select
            {...register('gender')}
            label={t('students.form.gender')}
            requiredAsterisk
            error={errors.gender?.message}
            options={[
              { id: STUDENT_GENDER.male, name: t('students.gender.male') },
              { id: STUDENT_GENDER.female, name: t('students.gender.female') },
            ]}
            placeholder={t('students.form.genderPlaceholder')}
          />
          <div className="flex h-10 items-center justify-between self-end rounded-full border border-muted/60 px-3 text-sm">
            <span>{t('common.status')}</span>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <StatusSwitch
                  active={field.value}
                  onChange={() => field.onChange(!field.value)}
                  readOnly={Boolean(student) && !can(PERMISSIONS.students.toggleStatus)}
                  compact
                />
              )}
            />
          </div>
          <Input
            {...register('password')}
            label={t('students.form.password')}
            requiredAsterisk={!student}
            error={errors.password?.message}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            helperText={t(
              student ? 'students.form.passwordOptional' : 'students.validation.password',
            )}
            endIcon={showPassword ? 'eyeOff' : 'eye'}
            onEndIconClick={() => setShowPassword(!showPassword)}
          />
          <Input
            {...register('confirmPassword')}
            label={t('students.form.confirmPassword')}
            requiredAsterisk={!student}
            error={errors.confirmPassword?.message}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
          />
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
            disabled={
              !online ||
              Boolean(optionError) ||
              levels.isPending ||
              Boolean(levelId && grades.isPending)
            }
            className="rounded-xl px-6"
          >
            {t(student ? 'common.saveChanges' : 'common.save')}
            <Icon name="checkCircle" className="size-5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
