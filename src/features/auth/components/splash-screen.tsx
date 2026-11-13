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
        backgroundColor: '#092422',
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgba(244, 177, 59, 0.14) 0%, rgba(15, 61, 58, 0.8) 50%, #071D1C 100%)',
      }}
    >
      {/* Decorative concentric animated pulse rings (matching Figma Animate 1 & 2) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[540px] rounded-full border border-accent/15 animate-ambient-glow" />
        <div className="absolute size-[380px] rounded-full border border-white/5 animate-ping opacity-20 [animation-duration:4s]" />
        <div className="absolute size-[220px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-7 px-6 text-center">
        {/* Animated Brand Vector Logo */}
        <div className="relative">
          <AuthLogo variant="white" size="2xl" animated={true} showLeadingDot={true} />
        </div>

        {/* Sleek Golden Progress Indicator */}
        <div className="relative h-1 w-36 overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent/80 via-accent to-accent/90 shadow-[0_0_16px_rgba(244,177,59,0.8)] animate-progress-sweep"
            style={{ animationDuration: `${duration - 600}ms` }}
          />
        </div>

        {/* Tagline */}
        <p className="max-w-md text-xs font-medium tracking-[0.22em] uppercase text-white/75 drop-shadow-sm animate-hero-entrance">
          {t('auth.splash.tagline')}
        </p>
      </div>

      {/* Skip button / hint */}
      <div className="absolute bottom-10 flex flex-col items-center gap-1 text-[11px] font-medium tracking-wider text-white/40 transition hover:text-white/80">
        <span>{t('auth.splash.skip')}</span>
      </div>
    </div>
  );
}
