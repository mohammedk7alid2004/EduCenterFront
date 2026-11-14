import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/core/auth';
import { useRoleOptions, type RoleDto } from '@/features/roles';
import {
  Button,
  ErrorState,
  FeedbackDialog,
  Icon,
  Input,
  LoadingState,
  Modal,
  StatusSwitch,
} from '@/shared/ui';
import { useOnline, setServerErrors } from '@/shared/lib';
import type { EmployeeDto, EmployeeValues } from '../employees.types';
import { EMPLOYEE_GENDER, EMPLOYEE_GENDER_NAMES } from '../employees.constants';
import { useEmployee, useSaveEmployee } from '../employees.queries';
export function EmployeeFormModal({
  employee,
  onClose,
}: {
  employee: EmployeeDto | null;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const roles = useRoleOptions();
  const detail = useEmployee(employee?.id);
  const title = t(employee ? 'employees.form.editTitle' : 'employees.form.createTitle');
  if (roles.isPending || (employee && detail.isPending))
    return (
      <Modal title={title} icon="users" size="form" onClose={onClose}>
        <LoadingState />
      </Modal>
    );
  const error = roles.error || detail.error;
  if (error)
    return (
      <Modal title={title} icon="users" size="form" onClose={onClose}>
        <ErrorState
          error={error}
          onRetry={() => {
            void roles.refetch();
            if (employee) void detail.refetch();
          }}
        />
      </Modal>
    );
  return <EmployeeFormFields employee={detail.data} roles={roles.data ?? []} onClose={onClose} />;
}
function EmployeeFormFields({
  employee,
  roles,
  onClose,
}: {
  employee?: EmployeeDto;
  roles: RoleDto[];
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const can = usePermission();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const schema = z.object({
    fullName: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .max(100, t('validation.maxLength', { count: 100 })),
    phoneNumber: z
      .string()
      .trim()
      .max(20, t('validation.maxLength', { count: 20 }))
      .refine(
        (value) => !value || /^\+?[0-9\s\-()]+$/.test(value),
        t('profile.validation.employeePhone'),
      )
      .optional(),
    email: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .email(t('auth.validation.emailInvalid'))
      .max(150, t('validation.maxLength', { count: 150 })),
    password: z
      .string()
      .refine(
        (value) =>
          Boolean(employee && !value) ||
          (value.length >= 8 &&
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /[0-9]/.test(value) &&
            /[\W_]/.test(value)),
        t('auth.recovery.validation.passwordStrength'),
      ),
    roleId: z.string().min(1, t('validation.required')),
    gender: z
      .enum([EMPLOYEE_GENDER.male, EMPLOYEE_GENDER.female])
      .or(z.literal(''))
      .refine((value) => Boolean(employee) || Boolean(value), t('validation.required')),
    isActive: z.boolean(),
  });
  const gender =
    employee?.gender === EMPLOYEE_GENDER_NAMES.male
      ? EMPLOYEE_GENDER.male
      : employee?.gender === EMPLOYEE_GENDER_NAMES.female
        ? EMPLOYEE_GENDER.female
        : '';
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmployeeValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: employee?.name ?? '',
      email: employee?.email ?? '',
      phoneNumber: employee?.phoneNumber ?? '',
      password: '',
      roleId: employee?.role.id ?? '',
      gender,
      isActive: employee?.isActive ?? true,
    },
  });
  const mutation = useSaveEmployee(employee);
  const title = t(employee ? 'employees.form.editTitle' : 'employees.form.createTitle');
  if (success)
    return (
      <FeedbackDialog
        title={title}
        description={t(employee ? 'employees.feedback.updated' : 'employees.feedback.created')}
        onClose={onClose}
      />
    );
  return (
    <Modal title={title} icon="users" size="form" onClose={onClose} pending={mutation.isPending}>
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
            {...register('fullName')}
            label={t('employees.form.fullName')}
            placeholder={t('teachers.form.namePlaceholder')}
            requiredAsterisk={!employee}
            error={errors.fullName?.message}
            autoComplete="name"
          />
          <Input
            {...register('email')}
            label={t('employees.form.email')}
            placeholder={t('teachers.form.emailPlaceholder')}
            requiredAsterisk={!employee}
            error={errors.email?.message}
            type="email"
            autoComplete="email"
          />
          <Input
            {...register('password')}
            label={t('employees.form.password')}
            placeholder={t('teachers.form.passwordPlaceholder')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            requiredAsterisk={!employee}
            endIcon={showPassword ? 'eyeOff' : 'eye'}
            onEndIconClick={() => setShowPassword(!showPassword)}
            error={errors.password?.message}
            helperText={employee ? t('teachers.form.passwordHelp') : undefined}
          />
          <div>
            <label htmlFor="employee-role" className="mb-2 block text-sm font-medium">
              {t('employees.form.role')}
              <span className="ms-1 text-danger">*</span>
            </label>
            <select
              id="employee-role"
              {...register('roleId')}
              aria-invalid={Boolean(errors.roleId)}
              className="h-10 w-full rounded-full border border-muted/60 bg-card px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">{t('employees.form.selectRole')}</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.roleId?.message && (
              <p className="mt-1.5 text-xs text-danger">{errors.roleId.message}</p>
            )}
            {roles.length === 0 && (
              <p className="mt-1.5 text-xs text-muted">{t('employees.form.noRoles')}</p>
            )}
          </div>
          <Input
            {...register('phoneNumber')}
            label={t('employees.form.phone')}
            type="tel"
            autoComplete="tel"
            error={errors.phoneNumber?.message}
          />
          <div className="flex items-end">
            <div className="flex h-10 w-full items-center justify-between rounded-full border border-muted/60 px-3 text-sm">
              <span>{t('common.status')}</span>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <StatusSwitch
                    active={field.value}
                    onChange={() => field.onChange(!field.value)}
                    disabled={mutation.isPending || !can(PERMISSIONS.employees.toggleStatus)}
                  />
                )}
              />
            </div>
          </div>
          <div>
            <label htmlFor="employee-gender" className="mb-2 block text-sm font-medium">
              {t('employees.form.gender')}
              {!employee && <span className="ms-1 text-danger">*</span>}
            </label>
            <select
              id="employee-gender"
              {...register('gender')}
              aria-invalid={Boolean(errors.gender)}
              className="h-10 w-full rounded-full border border-muted/60 bg-card px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">{t('employees.form.selectGender')}</option>
              <option value={EMPLOYEE_GENDER.male}>{t('employees.form.male')}</option>
              <option value={EMPLOYEE_GENDER.female}>{t('employees.form.female')}</option>
            </select>
            {errors.gender?.message && (
              <p className="mt-1.5 text-xs text-danger">{errors.gender.message}</p>
            )}
          </div>
        </fieldset>
        <div className="mt-10 flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
            className="rounded-xl border border-primary text-primary"
          >
            {t('common.cancel')}
            <Icon name="close" className="size-4" />
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!online || roles.length === 0}
            className="rounded-xl px-6"
          >
            {t(employee ? 'common.saveChanges' : 'common.save')}
            <Icon name="checkCircle" className="size-5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
