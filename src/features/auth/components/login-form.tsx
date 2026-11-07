import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Input } from '@/shared/ui';
import { AuthLogo } from './auth-logo';
import type { LoginCredentials } from '../types';

interface LoginFormProps {
  onSubmit: (data: LoginCredentials) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  onForgotPasswordClick?: () => void;
}

export function LoginForm({
  onSubmit,
  isLoading,
  errorMessage,
  onForgotPasswordClick,
}: LoginFormProps): JSX.Element {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
    rememberMe: z.boolean().default(false),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-10">
      {/* Top Logo */}
      <div className="mb-6 flex justify-center text-center">
        <AuthLogo variant="dark" size="lg" />
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('auth.login.welcome')}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
          {t('auth.login.subtitle')}
        </p>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-3.5 text-xs text-danger sm:text-sm"
        >
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          <span className="flex-1 font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email Field */}
        <Input
          label={t('auth.login.emailLabel')}
          requiredAsterisk
          type="email"
          autoComplete="email"
          placeholder={t('auth.login.emailPlaceholder')}
          startIcon="mail"
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email')}
        />

        {/* Password Field */}
        <Input
          label={t('auth.login.passwordLabel')}
          requiredAsterisk
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder={t('auth.login.passwordPlaceholder')}
          startIcon="lock"
          endIcon={showPassword ? 'eyeOff' : 'eye'}
          onEndIconClick={() => setShowPassword((prev) => !prev)}
          error={errors.password?.message}
          disabled={isLoading}
          {...register('password')}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              className="size-4 rounded-md border-border text-primary accent-primary focus:ring-primary/20"
              disabled={isLoading}
              {...register('rememberMe')}
            />
            <span className="text-foreground">{t('auth.login.rememberMe')}</span>
          </label>

          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="font-medium text-foreground/80 transition hover:text-primary hover:underline"
          >
            {t('auth.login.forgotPassword')}
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            loading={isLoading}
            className="w-full rounded-2xl py-3.5 text-base font-semibold shadow-lg shadow-primary/20 transition hover:opacity-95"
            style={{ backgroundColor: '#0F3D3A' }}
          >
            <span>{isLoading ? t('auth.login.submitting') : t('auth.login.submit')}</span>
            {!isLoading && <Icon name="checkCircle" className="ms-2 size-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
