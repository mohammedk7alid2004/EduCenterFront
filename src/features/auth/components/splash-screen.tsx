import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLogo } from './auth-logo';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2400 }: SplashScreenProps): JSX.Element {
  const { t } = useTranslation();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      role="banner"
      onClick={() => onComplete()}
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out select-none ${
        isFadingOut
          ? 'pointer-events-none scale-105 opacity-0 backdrop-blur-md'
          : 'scale-100 opacity-100'
      }`}
      style={{
        backgroundColor: 'rgb(var(--color-sidebar))',
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgb(var(--color-accent) / 0.14) 0%, rgb(var(--color-primary) / 0.8) 50%, rgb(var(--color-sidebar)) 100%)',
      }}
    >
      {/* Decorative concentric animated pulse rings (matching Figma Animate 1 & 2) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[540px] rounded-full border border-accent/15 animate-ambient-glow" />
        <div className="absolute size-[380px] rounded-full border border-card/5 animate-ping opacity-20 [animation-duration:4s]" />
        <div className="absolute size-[220px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-7 px-6 text-center">
        {/* Animated Brand Vector Logo */}
        <div className="relative">
          <AuthLogo variant="white" size="2xl" animated={true} showLeadingDot={true} />
        </div>

        {/* Sleek Golden Progress Indicator */}
        <div className="relative h-1 w-36 overflow-hidden rounded-full bg-card/10 backdrop-blur-sm">
          <div
            className="h-full rounded-full bg-gradient-to-tr from-accent/80 via-accent to-accent/90 shadow-lg shadow-accent/40 animate-progress-sweep"
            style={{ animationDuration: `${duration - 600}ms` }}
          />
        </div>

        {/* Tagline */}
        <p className="max-w-md text-xs font-medium tracking-[0.22em] uppercase text-card/75 drop-shadow-sm animate-hero-entrance">
          {t('auth.splash.tagline')}
        </p>
      </div>

      {/* Skip button / hint */}
      <div className="absolute bottom-10 flex flex-col items-center gap-1 text-[11px] font-medium tracking-wider text-card/40 transition hover:text-card/80">
        <span>{t('auth.splash.skip')}</span>
      </div>
    </div>
  );
}
