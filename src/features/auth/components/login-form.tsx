import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/shared/ui';
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
    <div className="w-full max-w-[460px] rounded-[32px] bg-white p-8 sm:p-10 shadow-2xl text-start select-none">
      {/* Centered Logo */}
      <div className="flex justify-center text-center">
        <AuthLogo variant="dark" size="lg" />
      </div>

      {/* Heading & Subtitle */}
      <div className="mt-3 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#1E293B] sm:text-[28px]">
          {t('auth.login.welcome')}
        </h2>
        <p className="mx-auto mt-2 max-w-[320px] text-xs leading-[1.6] text-[#64748B] sm:text-[13px]">
          {t('auth.login.subtitle')}
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
        >
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          <span className="flex-1 font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-[#1E293B]">
            {t('auth.login.emailLabel')} : <span className="text-[#E0745E]">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute start-3.5 flex items-center text-[#64748B]">
              <Icon name="mail" className="size-5" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.login.emailPlaceholder')}
              disabled={isLoading}
              className={`h-[48px] w-full rounded-xl border bg-white pe-4 ps-11 text-sm text-[#1E293B] placeholder:text-[#94A3B8] transition focus:border-[#0F3D3A] focus:outline-none focus:ring-1 focus:ring-[#0F3D3A] disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.email ? 'border-danger' : 'border-slate-300'
              }`}
              {...register('email')}
            />
          </div>
          {errors.email?.message && (
            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-[#1E293B]">
            {t('auth.login.passwordLabel')} : <span className="text-[#E0745E]">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute start-3.5 flex items-center text-[#64748B]">
              <Icon name="lock" className="size-5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('auth.login.passwordPlaceholder')}
              disabled={isLoading}
              className={`h-[48px] w-full rounded-xl border bg-white pe-11 ps-11 text-sm text-[#1E293B] placeholder:text-[#94A3B8] transition focus:border-[#0F3D3A] focus:outline-none focus:ring-1 focus:ring-[#0F3D3A] disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.password ? 'border-danger' : 'border-slate-300'
              }`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute end-3.5 flex items-center text-[#64748B] transition hover:text-[#1E293B]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPassword ? 'eyeOff' : 'eye'} className="size-5" />
            </button>
          </div>
          {errors.password?.message && (
            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me & Forget Password */}
        <div className="flex items-center justify-between pt-0.5 text-xs">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300 text-[#0F3D3A] accent-[#0F3D3A] focus:ring-[#0F3D3A]"
              disabled={isLoading}
              {...register('rememberMe')}
            />
            <span className="font-medium text-[#1E293B]">{t('auth.login.rememberMe')}</span>
          </label>

          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="font-medium text-[#1E293B] transition hover:text-[#0F3D3A] hover:underline"
          >
            {t('auth.login.forgotPassword')}
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            loading={isLoading}
            className="h-[48px] w-full rounded-xl bg-[#0F3D3A] text-sm font-semibold text-white transition hover:bg-[#0F3D3A]/90 hover:opacity-100"
          >
            <span>{isLoading ? t('auth.login.submitting') : t('auth.login.submit')}</span>
            {!isLoading && <Icon name="checkCircle" className="ms-2 size-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
