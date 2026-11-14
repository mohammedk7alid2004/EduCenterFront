import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, ErrorState, FeedbackDialog, Icon, Input, LoadingState, Modal } from '@/shared/ui';
import { setServerErrors, useOnline } from '@/shared/lib';
import type { RoleDto, RoleValues, PermissionDto } from '../roles.types';
import { usePermissionCatalog, useRole, useSaveRole } from '../roles.queries';
import { PermissionGrid } from './permission-grid';
export function RoleFormModal({
  role,
  onClose,
}: {
  role: RoleDto | null;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const catalog = usePermissionCatalog();
  const detail = useRole(role?.id);
  const title = t(role ? 'roleManagement.form.editTitle' : 'roleManagement.form.createTitle');
  if (catalog.isPending || (role && detail.isPending))
    return (
      <Modal title={title} icon="permission" onClose={onClose} size="wide">
        <LoadingState />
      </Modal>
    );
  const error = catalog.error || detail.error;
  if (error)
    return (
      <Modal title={title} icon="permission" onClose={onClose} size="wide">
        <ErrorState
          error={error}
          onRetry={() => {
            void catalog.refetch();
            if (role) void detail.refetch();
          }}
        />
      </Modal>
    );
  return (
    <RoleFormFields
      role={role}
      initialValues={{
        name: detail.data?.roleName ?? '',
        permissionIds: detail.data?.permissions.map((permission) => permission.permissionId) ?? [],
      }}
      permissions={catalog.data ?? []}
      onClose={onClose}
    />
  );
}
function RoleFormFields({
  role,
  initialValues,
  permissions,
  onClose,
}: {
  role: RoleDto | null;
  initialValues: RoleValues;
  permissions: PermissionDto[];
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const [success, setSuccess] = useState(false);
  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .max(50, t('validation.maxLength', { count: 50 })),
    permissionIds: role
      ? z.array(z.string())
      : z.array(z.string()).min(1, t('roleManagement.form.permissionsRequired')),
  });
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RoleValues>({ resolver: zodResolver(schema), defaultValues: initialValues });
  const mutation = useSaveRole(role?.id);
  const title = t(role ? 'roleManagement.form.editTitle' : 'roleManagement.form.createTitle');
  if (success)
    return (
      <FeedbackDialog
        title={title}
        description={t(
          role ? 'roleManagement.feedback.updated' : 'roleManagement.feedback.created',
        )}
        onClose={onClose}
      />
    );
  return (
    <Modal
      title={title}
      icon="permission"
      onClose={onClose}
      size="wide"
      pending={mutation.isPending}
    >
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          if (online)
            mutation.mutate(values, {
              onSuccess: () => setSuccess(true),
              onError: (error) => setServerErrors(error, setError, { roleName: 'name' }),
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
        <fieldset disabled={mutation.isPending} className="min-w-0 space-y-6">
          <Input
            {...register('name')}
            label={t('roleManagement.form.name')}
            placeholder={t('roleManagement.form.namePlaceholder')}
            requiredAsterisk
            error={errors.name?.message}
          />
          <Controller
            name="permissionIds"
            control={control}
            render={({ field }) => (
              <PermissionGrid
                permissions={permissions}
                selected={field.value}
                onChange={field.onChange}
                disabled={mutation.isPending}
              />
            )}
          />
          {errors.permissionIds?.message && (
            <p className="text-xs text-danger">{errors.permissionIds.message}</p>
          )}
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
            disabled={!online}
            className="rounded-xl px-6"
          >
            {t(role ? 'common.saveChanges' : 'common.save')}
            <Icon name="checkCircle" className="size-5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
