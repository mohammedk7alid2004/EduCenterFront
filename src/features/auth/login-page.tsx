import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES, STORAGE_KEYS } from '@/config';
import { useLogin } from './hooks';
import { AuthLogo } from './components/auth-logo';
import { LoginHero } from './components/login-hero';
import { LoginForm } from './components/login-form';
import { LoginSuccessModal } from './components/login-success-modal';
import { ForgotPasswordModal } from './components/forgot-password-modal';
import { SplashScreen } from './components/splash-screen';
import type { LoginCredentials } from './types';

export function LoginPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem(STORAGE_KEYS.splashShown);
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginMutation = useLogin();

  const handleSplashComplete = () => {
    sessionStorage.setItem(STORAGE_KEYS.splashShown, 'true');
    setShowSplash(false);
  };

  const handleLoginSubmit = (credentials: LoginCredentials) => {
    loginMutation.mutate(credentials, {
      onSuccess: () => {
        setShowSuccess(true);
        const destination =
          (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.dashboard;
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 1300);
      },
    });
  };

  const errorMessage = loginMutation.isError
    ? t(loginMutation.error.message, { defaultValue: t('errors.unknown') })
    : null;

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <main
        className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-black text-white font-sans"
        style={{
          background:
            "linear-gradient(270deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.77) 100%), url('/images/auth-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Top-Left Logo with smooth fade-in */}
        <header className="absolute top-8 start-8 z-20 sm:top-12 sm:start-14 lg:top-14 lg:start-20 transition-opacity duration-700">
          <AuthLogo variant="light" size="md" showLeadingDot={false} />
        </header>

        {/* Content container */}
        <div className="relative z-10 flex min-h-screen w-full max-w-[1400px] items-center justify-between px-6 py-24 sm:px-12 lg:px-20 xl:px-24">
          <div className="flex w-full flex-col items-center justify-between gap-12 lg:flex-row lg:items-center">
            {/* Left Hero Section with smooth entrance */}
            <div className="w-full lg:w-1/2 animate-hero-entrance">
              <LoginHero />
            </div>

            {/* Right Login Card with spring entrance */}
            <div className="flex w-full justify-center lg:w-1/2 lg:justify-end animate-card-entrance">
              <LoginForm
                onSubmit={handleLoginSubmit}
                isLoading={loginMutation.isPending || showSuccess}
                errorMessage={errorMessage}
                onForgotPasswordClick={() => setShowForgotPassword(true)}
              />
            </div>
          </div>
        </div>

        {/* Success Modal */}
        <LoginSuccessModal open={showSuccess} />

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          open={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      </main>
    </>
  );
}
