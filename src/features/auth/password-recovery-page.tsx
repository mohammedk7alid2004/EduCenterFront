import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { AuthLogo } from './components/auth-logo';
import { LoginHero } from './components/login-hero';
import { PasswordRecoveryCard } from './components/password-recovery-card';
import type { PasswordRecoveryStep } from './password-recovery.types';
import { useRequestPasswordReset, useResetPassword, useVerifyResetOtp } from './hooks';

export function PasswordRecoveryPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<PasswordRecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const requestPasswordReset = useRequestPasswordReset();
  const verifyResetOtp = useVerifyResetOtp();
  const resetPassword = useResetPassword();

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-black font-sans text-white"
      style={{
        background:
          "linear-gradient(270deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.77) 100%), url('/images/auth-bg.jpg')",
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <header className="absolute start-8 top-8 z-20 sm:start-14 sm:top-12 lg:start-20 lg:top-14">
        <AuthLogo variant="light" size="md" showLeadingDot={false} />
      </header>
      <div className="relative z-10 flex min-h-screen w-full max-w-[1400px] items-center px-6 py-24 sm:px-12 lg:px-20 xl:px-24">
        <div className="flex w-full flex-col items-center justify-between gap-12 lg:flex-row lg:items-center">
          <div className="w-full lg:w-1/2">
            <LoginHero />
          </div>
          <div className="flex w-full justify-center lg:w-1/2 lg:justify-end">
            <PasswordRecoveryCard
              email={email}
              step={step}
              onBack={() => navigate(ROUTES.login)}
              onEmailSubmitted={async (value) => {
                await requestPasswordReset.mutateAsync({ email: value });
                setEmail(value);
                setStep('code');
              }}
              onCodeSubmitted={async (otp) => {
                const token = await verifyResetOtp.mutateAsync({ email, otp });
                setResetToken(token);
                setStep('password');
              }}
              onPasswordSubmitted={async (values) => {
                await resetPassword.mutateAsync({
                  email,
                  token: resetToken,
                  newPassword: values.password,
                  confirmPassword: values.confirmPassword,
                });
                setStep('success');
              }}
              onRestart={() => {
                setEmail('');
                setResetToken('');
                setStep('email');
              }}
              title={t('auth.recovery.title')}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
