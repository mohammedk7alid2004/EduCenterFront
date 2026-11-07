import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES, STORAGE_KEYS } from '@/config';
import { useLogin } from './hooks';
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

  // Show splash animation on first entry
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

      <main className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-primary">
        {/* Fullscreen background image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/auth-bg.jpg')",
          }}
          aria-hidden="true"
        />
        {/* Dark Deep Forest overlay matching design */}
        <div className="absolute inset-0 bg-[#0F3D3A]/90 backdrop-blur-[2px]" aria-hidden="true" />

        {/* Two-column layout */}
        <div className="relative z-10 flex min-h-screen w-full max-w-7xl items-center justify-between p-4 sm:p-6 lg:p-12">
          {/* Left Hero Section (Image 3) */}
          <LoginHero />

          {/* Right Login Card (Image 2) */}
          <div className="flex w-full items-center justify-center lg:w-1/2">
            <LoginForm
              onSubmit={handleLoginSubmit}
              isLoading={loginMutation.isPending || showSuccess}
              errorMessage={errorMessage}
              onForgotPasswordClick={() => setShowForgotPassword(true)}
            />
          </div>
        </div>

        {/* Success Modal (Image 3) */}
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
