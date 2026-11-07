import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES, STORAGE_KEYS } from '@/config';
import { useLogin } from './hooks';
import { AuthLogo } from './components/auth-logo';
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
        className="relative min-h-screen w-full overflow-x-hidden bg-black text-white"
        style={{
          background:
            "linear-gradient(270deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.77) 100%), url('/images/auth-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Top-Left Logo fixed in header area matching Figma */}
        <header className="absolute top-8 start-8 z-20 sm:top-10 sm:start-12 lg:top-12 lg:start-16">
          <AuthLogo variant="light" size="md" />
        </header>

        {/* Main Content Area */}
        <div className="relative z-10 flex min-h-screen w-full items-center justify-between px-6 py-24 sm:px-12 lg:px-20 xl:px-24">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-12 lg:flex-row lg:items-center">
            {/* Left Hero Typography matching Figma */}
            <div className="w-full max-w-xl text-start lg:w-1/2">
              <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[46px] lg:leading-[1.2]">
                  Manage Your Center,
                  <span className="block mt-2">Empower Every Student</span>
                </h1>

                <div className="space-y-1.5 text-base font-normal text-white/90 sm:text-lg lg:text-[19px] lg:leading-[1.7]">
                  <p>All Your Educational Center Operations</p>
                  <p>In One Place.</p>
                  <p>Smart Management. Seamless Learning.</p>
                  <p>Better Results</p>
                </div>
              </div>
            </div>

            {/* Right Login Card matching Figma */}
            <div className="flex w-full justify-center lg:w-1/2 lg:justify-end">
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
