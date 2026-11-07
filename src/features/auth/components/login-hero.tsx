import { useTranslation } from 'react-i18next';
import { AuthLogo } from './auth-logo';

export function LoginHero(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden p-8 lg:flex lg:w-1/2 xl:p-14">
      {/* Top Logo */}
      <div className="relative z-10 text-start">
        <AuthLogo variant="light" size="md" />
      </div>

      {/* Center Hero Content */}
      <div className="relative z-10 my-auto max-w-lg space-y-6 text-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-medium tracking-tight text-card/90 sm:text-4xl">
            {t('auth.hero.titlePart1')}
          </h2>
          <h1 className="text-4xl font-black tracking-tight text-card sm:text-5xl">
            {t('auth.hero.titlePart2')}
          </h1>
        </div>

        <div className="space-y-2 text-base text-card/80 sm:text-lg">
          <p className="leading-relaxed font-normal">{t('auth.hero.subtitle')}</p>
          <p className="text-sm font-medium tracking-wide text-accent">{t('auth.hero.tagline')}</p>
        </div>
      </div>

      {/* Bottom Footer Accent */}
      <div className="relative z-10 flex items-center gap-3 text-start text-xs text-card/50">
        <span className="inline-block size-2 rounded-full bg-accent" />
        <span>
          {t('app.name')} &copy; {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
}
