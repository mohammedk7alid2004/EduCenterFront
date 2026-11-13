import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/shared/ui';
import { AuthLogo } from './auth-logo';
import { ApiError } from '@/core/api';
import { setServerErrors, useOnline } from '@/shared/lib';
import type { LoginCredentials } from '../types';

interface LoginFormProps {
  onSubmit: (data: LoginCredentials) => Promise<void>;
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
  const online = useOnline();
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
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function submit(values: LoginFormValues) {
    if (!online) return;
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) setServerErrors(error, setError);
    }
  }
  return (
    <div className="w-full max-w-[480px] rounded-[32px] border-2 border-primary bg-card px-6 py-8 sm:px-10 sm:py-10 shadow-2xl text-start select-none font-sans">
      {/* Centered Logo with leading & trailing golden dots */}
      <div className="flex justify-center text-center">
        <AuthLogo variant="dark" size="lg" showLeadingDot={true} />
      </div>

      {/* Heading & Subtitle */}
      <div className="mt-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-[27px]">
          {t('auth.login.welcome')}
        </h2>
        <p className="mx-auto mt-2 max-w-[340px] text-[13px] leading-[1.65] text-muted">
          {t('auth.login.subtitle')}
        </p>
      </div>

      {/* Error Alert Banner */}
      {(errorMessage || !online) && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
        >
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          <span className="flex-1 font-medium">{online ? errorMessage : t('errors.network')}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(submit)} className="mt-7 space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">
            {t('auth.login.emailLabel')} : <span className="text-danger">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute start-4 flex items-center text-primary">
              <Icon name="mail" className="size-5" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.login.emailPlaceholder')}
              disabled={isLoading || !online}
              className={`h-[52px] w-full rounded-[12px] border bg-card pe-4 ps-12 text-sm font-normal text-foreground placeholder:text-muted/60 transition focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.email ? 'border-danger focus:border-danger' : 'border-primary'
              }`}
              {...register('email')}
            />
          </div>
          {errors.email?.message && (
            <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="mb-2 block text-base font-medium text-foreground">
            {t('auth.login.passwordLabel')} : <span className="text-danger">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute start-4 flex items-center text-muted">
              <Icon name="lock" className="size-5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('auth.login.passwordPlaceholder')}
              disabled={isLoading || !online}
              className={`h-[52px] w-full rounded-[12px] border bg-card pe-12 ps-12 text-sm font-normal text-foreground placeholder:text-muted/60 transition focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.password
                  ? 'border-danger focus:border-danger'
                  : 'border-muted focus:border-primary'
              }`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute end-4 flex items-center text-muted transition hover:text-foreground"
              aria-label={t(showPassword ? 'common.hidePassword' : 'common.showPassword')}
            >
              <Icon name={showPassword ? 'eyeOff' : 'eye'} className="size-5" />
            </button>
          </div>
          {errors.password?.message && (
            <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me & Forget Password */}
        <div className="flex items-center justify-between pt-1 text-[13px]">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              className="size-4 rounded-[4px] border-[1.5px] border-primary text-primary accent-primary focus:ring-primary/20"
              disabled={isLoading || !online}
              {...register('rememberMe')}
            />
            <span className="font-medium text-foreground">{t('auth.login.rememberMe')}</span>
          </label>

          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="font-medium text-primary transition hover:text-primary/80 hover:underline"
          >
            {t('auth.login.forgotPassword')}
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            loading={isLoading}
            disabled={!online}
            className="h-[52px] w-full rounded-[12px] bg-primary text-sm font-semibold text-card shadow-lg shadow-primary/20 transition hover:bg-primary/90 hover:opacity-100"
          >
            <span>{isLoading ? t('auth.login.submitting') : t('auth.login.submit')}</span>
            {!isLoading && <Icon name="checkCircle" className="ms-2 size-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
