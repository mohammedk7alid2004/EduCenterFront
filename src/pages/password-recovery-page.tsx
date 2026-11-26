import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/shared/constants';
import {
  AuthShell,
  PasswordRecoveryCard,
  useRequestPasswordReset,
  useResetPassword,
  useVerifyResetOtp,
} from '@/features/auth';
import type { PasswordRecoveryStep } from '@/features/auth';

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
    <AuthShell>
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
    </AuthShell>
  );
}
