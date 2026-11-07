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
    <div className="w-full max-w-[490px] rounded-[36px] border-2 border-[#0F3D3A] bg-white p-8 shadow-2xl sm:p-11 text-start">
      {/* Centered Logo */}
      <div className="mb-4 flex justify-center text-center">
        <AuthLogo variant="dark" size="lg" />
      </div>

      {/* Heading & Subtitle */}
      <div className="mb-8 text-center">
        <h2 className="text-[26px] font-bold tracking-tight text-[#1E293B]">
          {t('auth.login.welcome')}
        </h2>
        <p className="mx-auto mt-2 max-w-[340px] text-[13px] leading-[1.6] text-[#64748B]">
          {t('auth.login.subtitle')}
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-3.5 text-xs text-danger"
        >
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          <span className="flex-1 font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#1E293B]">
            {t('auth.login.emailLabel')} : <span className="text-[#E0745E]">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute start-4 flex items-center text-[#0F3D3A]">
              <Icon name="mail" className="size-5" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.login.emailPlaceholder')}
              disabled={isLoading}
              className={`h-[52px] w-full rounded-[14px] border bg-white pe-4 ps-12 text-sm font-medium text-[#1E293B] placeholder:text-[#64748B]/60 transition focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]/20 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.email ? 'border-danger focus:border-danger' : 'border-[#0F3D3A]'
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
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#1E293B]">
            {t('auth.login.passwordLabel')} : <span className="text-[#E0745E]">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute start-4 flex items-center text-[#94A3B8]">
              <Icon name="lock" className="size-5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('auth.login.passwordPlaceholder')}
              disabled={isLoading}
              className={`h-[52px] w-full rounded-[14px] border bg-white pe-12 ps-12 text-sm font-medium text-[#1E293B] placeholder:text-[#64748B]/60 transition focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]/20 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.password
                  ? 'border-danger focus:border-danger'
                  : 'border-slate-300 focus:border-[#0F3D3A]'
              }`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute end-4 flex items-center text-[#94A3B8] transition hover:text-[#1E293B]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              className="size-4 rounded border-[#0F3D3A] text-[#0F3D3A] accent-[#0F3D3A] focus:ring-[#0F3D3A]/20"
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
        <div className="pt-3">
          <Button
            type="submit"
            loading={isLoading}
            className="h-[52px] w-full rounded-[14px] bg-[#0F3D3A] text-[15px] font-semibold text-white shadow-lg shadow-[#0F3D3A]/20 transition hover:bg-[#0F3D3A]/90 hover:opacity-100"
          >
            <span>{isLoading ? t('auth.login.submitting') : t('auth.login.submit')}</span>
            {!isLoading && <Icon name="checkCircle" className="ms-2 size-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
