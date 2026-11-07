import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLogo } from './auth-logo';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2000 }: SplashScreenProps): JSX.Element {
  const { t } = useTranslation();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, duration - 400);

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
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-primary transition-opacity duration-500 ease-out select-none ${
        isFadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#0F3D3A',
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgba(244, 177, 59, 0.08) 0%, rgba(15, 61, 58, 1) 75%)',
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Animated logo container */}
        <div className="animate-in fade-in zoom-in-90 duration-700 ease-out">
          <AuthLogo variant="light" size="xl" />
        </div>

        {/* Subtle accent bar with glow */}
        <div className="h-0.5 w-16 overflow-hidden rounded-full bg-accent/30">
          <div className="h-full w-full animate-pulse bg-accent" />
        </div>

        {/* Tagline */}
        <p className="text-xs font-medium tracking-wider text-card/60 transition">
          {t('auth.splash.tagline')}
        </p>
      </div>

      {/* Skip hint */}
      <span className="absolute bottom-6 text-[11px] text-card/30">{t('auth.splash.skip')}</span>
    </div>
  );
}
