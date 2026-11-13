import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/core/i18n';
import { Icon } from '@/shared/ui';
import { AuthLogo } from './auth-logo';
import { LoginHero } from './login-hero';
export function AuthShell({ children }: PropsWithChildren): JSX.Element {
  const { t, i18n } = useTranslation();
  const arabic = i18n.language.startsWith('ar');
  return (
    <main
      className="relative flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-overlay font-sans text-card"
      style={{
        backgroundImage:
          "linear-gradient(270deg, rgb(var(--color-overlay) / 0.9), rgb(var(--color-overlay) / 0.77)), url('/images/auth-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <header className="absolute inset-x-6 top-6 z-20 flex items-center justify-between sm:inset-x-12 sm:top-10 lg:inset-x-20">
        <AuthLogo variant="light" size="md" showLeadingDot={false} />
        <button
          type="button"
          aria-label={t('common.changeLanguage')}
          onClick={() => setLanguage(arabic ? 'en' : 'ar')}
          className="flex items-center gap-2 rounded-xl border border-card/20 bg-card/10 px-3 py-2 text-xs transition hover:bg-card/20"
        >
          <Icon name="globe" className="size-4" />
          {arabic ? 'EN' : 'العربية'}
        </button>
      </header>
      <div className="relative z-10 flex min-h-dvh w-full max-w-[1440px] flex-col items-center justify-between gap-10 px-6 pb-12 pt-28 sm:px-12 lg:flex-row lg:gap-12 lg:px-20 lg:py-28">
        <div className="w-full lg:w-1/2">
          <LoginHero />
        </div>
        <div className="flex w-full justify-center lg:w-1/2 lg:justify-end">{children}</div>
      </div>
    </main>
  );
}
