import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button, Icon, Input } from '@/shared/ui';
import { ApiError } from '@/core/api';
import { setServerErrors } from '@/shared/lib';
import type {
  CodeFormValues,
  EmailFormValues,
  NewPasswordFormValues,
  PasswordRecoveryStep,
} from '../password-recovery.types';
import { AuthLogo } from './auth-logo';

interface PasswordRecoveryCardProps {
  email: string;
  step: PasswordRecoveryStep;
  title: string;
  onBack: () => void;
  onEmailSubmitted: (email: string) => Promise<void>;
  onCodeSubmitted: (code: string) => Promise<void>;
  onPasswordSubmitted: (values: NewPasswordFormValues) => Promise<void>;
  onRestart: () => void;
}

const CODE_LENGTH = 6;

export function PasswordRecoveryCard(props: PasswordRecoveryCardProps): JSX.Element {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [requestError, setRequestError] = useState<ApiError | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const emailSchema = z.object({
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
  });
  const codeSchema = z.object({
    code: z.string().regex(new RegExp(`^\\d{${CODE_LENGTH}}$`), t('auth.recovery.validation.code')),
  });
  const passwordSchema = z
    .object({
      password: z
        .string()
        .regex(
          /(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}/,
          t('auth.recovery.validation.passwordStrength'),
        ),
      confirmPassword: z.string(),
    })
    .refine((values) => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: t('auth.recovery.validation.passwordMatch'),
    });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: props.email },
  });
  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });
  const passwordForm = useForm<NewPasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    const updateConnection = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  useEffect(() => {
    emailForm.reset({ email: props.email });
  }, [emailForm, props.email]);

  const complete = async (
    callback: () => Promise<void>,
    applyServerErrors: (error: ApiError) => void,
  ) => {
    if (isOffline) return;
    setRequestError(null);
    setIsPending(true);
    try {
      await callback();
    } catch (error) {
      if (error instanceof ApiError) {
        applyServerErrors(error);
        setRequestError(error);
      }
    } finally {
      setIsPending(false);
    }
  };

  const heading = props.step === 'success' ? t('auth.recovery.successTitle') : props.title;
  const description =
    props.step === 'email'
      ? t('auth.recovery.emailDescription')
      : props.step === 'code'
        ? t('auth.recovery.codeDescription', { email: props.email })
        : props.step === 'password'
          ? t('auth.recovery.passwordDescription')
          : t('auth.recovery.successDescription');

  return (
    <section
      aria-labelledby="password-recovery-title"
      className="w-full max-w-[480px] rounded-[38px] border-2 border-primary bg-card p-8 text-start text-foreground shadow-2xl sm:p-11"
    >
      <div className="flex justify-center">
        {props.step === 'success' ? (
          <Icon name="checkCircle" className="size-12 text-success" />
        ) : (
          <AuthLogo variant="dark" size="xl" />
        )}
      </div>
      <div className="mt-4 text-center">
        <h1 id="password-recovery-title" className="text-2xl font-bold tracking-tight">
          {heading}
        </h1>
        <p className="mx-auto mt-2 max-w-[360px] text-sm leading-relaxed text-muted">
          {description}
        </p>
      </div>
      {isOffline && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
        >
          {t('errors.network')}
        </p>
      )}
      {requestError && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
        >
          {requestError.message.startsWith('errors.')
            ? t(requestError.message)
            : requestError.message}
        </p>
      )}
      {props.step === 'email' && (
        <form
          noValidate
          className="mt-7 space-y-5"
          onSubmit={emailForm.handleSubmit(
            (values) =>
              void complete(
                () => props.onEmailSubmitted(values.email.trim()),
                (error) => setServerErrors(error, emailForm.setError),
              ),
          )}
        >
          <Input
            label={t('auth.recovery.emailLabel')}
            requiredAsterisk
            startIcon="mail"
            type="email"
            autoComplete="email"
            disabled={isPending || isOffline}
            error={emailForm.formState.errors.email?.message}
            {...emailForm.register('email')}
          />
          <SubmitButton
            loading={isPending}
            label={t('auth.recovery.sendCode')}
            loadingLabel={t('auth.recovery.sendingCode')}
          />
        </form>
      )}
      {props.step === 'code' && (
        <form
          noValidate
          className="mt-7 space-y-5"
          onSubmit={codeForm.handleSubmit(
            (values) =>
              void complete(
                () => props.onCodeSubmitted(values.code),
                (error) => setServerErrors(error, codeForm.setError),
              ),
          )}
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              {t('auth.recovery.codeLabel')}
              <span className="ms-1 font-semibold text-danger">*</span>
            </label>
            <Controller
              control={codeForm.control}
              name="code"
              render={({ field }) => (
                <VerificationCodeInput
                  value={field.value}
                  disabled={isPending || isOffline}
                  onChange={field.onChange}
                />
              )}
            />
            {codeForm.formState.errors.code?.message && (
              <p className="mt-1.5 text-xs text-danger">{codeForm.formState.errors.code.message}</p>
            )}
          </div>
          <p className="text-center text-xs text-muted">{t('auth.recovery.resendHint')}</p>
          <SubmitButton
            loading={isPending}
            label={t('auth.recovery.verifyCode')}
            loadingLabel={t('auth.recovery.verifyingCode')}
          />
        </form>
      )}
      {props.step === 'password' && (
        <form
          noValidate
          className="mt-7 space-y-5"
          onSubmit={passwordForm.handleSubmit(
            (values) =>
              void complete(
                () => props.onPasswordSubmitted(values),
                (error) => setServerErrors(error, passwordForm.setError),
              ),
          )}
        >
          <Input
            label={t('auth.recovery.newPassword')}
            requiredAsterisk
            startIcon="lock"
            endIcon={showPassword ? 'eyeOff' : 'eye'}
            onEndIconClick={() => setShowPassword((value) => !value)}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            disabled={isPending || isOffline}
            error={passwordForm.formState.errors.password?.message}
            {...passwordForm.register('password')}
          />
          <Input
            label={t('auth.recovery.confirmPassword')}
            requiredAsterisk
            startIcon="lock"
            endIcon={showConfirmation ? 'eyeOff' : 'eye'}
            onEndIconClick={() => setShowConfirmation((value) => !value)}
            type={showConfirmation ? 'text' : 'password'}
            autoComplete="new-password"
            disabled={isPending || isOffline}
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />
          <SubmitButton
            loading={isPending}
            label={t('auth.recovery.resetPassword')}
            loadingLabel={t('auth.recovery.resettingPassword')}
          />
        </form>
      )}
      {props.step === 'success' && (
        <Button type="button" className="mt-7 w-full" onClick={props.onBack}>
          {t('auth.recovery.backToLogin')}
        </Button>
      )}
      {props.step !== 'success' && (
        <button
          type="button"
          disabled={isPending}
          onClick={props.step === 'email' ? props.onBack : props.onRestart}
          className="mx-auto mt-6 flex items-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
        >
          <Icon name="arrowLeft" className="size-4 rtl:rotate-180" />
          {t(props.step === 'email' ? 'auth.recovery.backToLogin' : 'auth.recovery.restart')}
        </button>
      )}
    </section>
  );
}

function SubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}): JSX.Element {
  return (
    <Button type="submit" loading={loading} className="w-full">
      {loading ? loadingLabel : label}
      <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
    </Button>
  );
}

function VerificationCodeInput({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}): JSX.Element {
  const { t } = useTranslation();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: CODE_LENGTH }, (_, index) => value[index]?.trim() ?? '');

  const setDigit = (index: number, rawValue: string) => {
    const numeric = rawValue.replace(/\D/g, '');
    if (numeric.length > 1) {
      onChange(numeric.slice(0, CODE_LENGTH));
      inputRefs.current[Math.min(numeric.length, CODE_LENGTH) - 1]?.focus();
      return;
    }
    const digit = numeric.slice(-1);
    const nextValue = digits
      .map((item, itemIndex) => (itemIndex === index ? digit || ' ' : item || ' '))
      .join('')
      .trimEnd();
    onChange(nextValue);
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  return (
    <div className="flex justify-center gap-1.5 sm:gap-3" dir="ltr">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          aria-label={t('auth.recovery.codeDigit', { number: index + 1 })}
          className="h-12 min-w-0 flex-1 rounded-xl sm:size-12 sm:flex-none border border-border bg-card text-center text-lg font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          inputMode="numeric"
          maxLength={1}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          onPaste={(event) => {
            const pasted = event.clipboardData
              .getData('text')
              .replace(/\D/g, '')
              .slice(0, CODE_LENGTH);
            if (!pasted) return;
            event.preventDefault();
            onChange(pasted);
            inputRefs.current[pasted.length - 1]?.focus();
          }}
          type="text"
          value={digit}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digit && index > 0)
              inputRefs.current[index - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}
