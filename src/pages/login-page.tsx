import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES, STORAGE_KEYS } from '@/shared/constants';
import { getDefaultAuthorizedRoute } from '@/app/config';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/hooks';
import { useLogin, AuthShell, LoginForm, LoginSuccessModal, SplashScreen } from '@/features/auth';
import type { LoginCredentials, LoginResult } from '@/features/auth';

export function LoginPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem(STORAGE_KEYS.splashShown);
  });

  const [result, setResult] = useState<LoginResult | null>(null);
  const showSuccess = Boolean(result);
  const setSession = useAuthStore((state) => state.setSession);

  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const [rememberMe, setRememberMe] = useState(false);

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEYS.splashShown, 'true');
    setShowSplash(false);
  }, []);

  const handleLoginSubmit = async (credentials: LoginCredentials) => {
    setRememberMe(Boolean(credentials.rememberMe));
    setResult(await loginMutation.mutateAsync(credentials));
  };
  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => {
      queryClient.clear();
      setSession(result.accessToken, result.refreshToken, result.user, rememberMe);
      const destination =
        (location.state as { from?: { pathname: string } } | null)?.from?.pathname ||
        getDefaultAuthorizedRoute(result.user);
      navigate(destination, { replace: true });
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [result, setSession, location.state, navigate, queryClient, rememberMe]);

  const errorMessage = loginMutation.isError
    ? t(loginMutation.error.message, { defaultValue: loginMutation.error.message })
    : null;

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <AuthShell>
        <LoginForm
          onSubmit={handleLoginSubmit}
          isLoading={loginMutation.isPending || showSuccess}
          errorMessage={errorMessage}
          onForgotPasswordClick={() => navigate(ROUTES.forgotPassword)}
        />
        {/* Success Modal */}
        <LoginSuccessModal open={showSuccess} />
      </AuthShell>
    </>
  );
}
