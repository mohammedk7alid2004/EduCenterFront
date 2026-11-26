import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Modal } from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import { PASSWORD_SPECIAL_PATTERN } from '../profile.constants';
import { useChangePassword } from '../profile.queries';
import type { ChangePasswordValues } from '../profile.types';
import { PasswordField } from './password-field';

export function ChangePasswordForm({ onClose }: { onClose: () => void }): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const mutation = useChangePassword();
  const schema = z
    .object({
      currentPassword: z.string().min(1, t('validation.required')),
      newPassword: z
        .string()
        .refine(
          (value) =>
            value.length >= 8 &&
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /[0-9]/.test(value) &&
            PASSWORD_SPECIAL_PATTERN.test(value),
          t('auth.recovery.validation.passwordStrength'),
        ),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
      path: ['confirmPassword'],
      message: t('profile.validation.passwordMatch'),
    });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  return (
    <Modal
      title={t('profile.changePassword')}
      icon="lock"
      pending={mutation.isPending}
      onClose={onClose}
    >
      <p className="mb-6 mt-2 text-sm text-muted">{t('profile.passwordHelp')}</p>
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          if (online)
            mutation.mutate(values, { onError: (error) => setServerErrors(error, setError) });
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
        <fieldset disabled={mutation.isPending} className="space-y-6">
          <PasswordField
            field={register('currentPassword')}
            label={t('profile.currentPassword')}
            current
            error={errors.currentPassword?.message}
          />
          <PasswordField
            field={register('newPassword')}
            label={t('profile.newPassword')}
            error={errors.newPassword?.message}
          />
          <PasswordField
            field={register('confirmPassword')}
            label={t('profile.confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        </fieldset>
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!online}
            className="rounded-xl"
          >
            <Icon name="lock" className="size-4" />
            {t('profile.changePassword')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
