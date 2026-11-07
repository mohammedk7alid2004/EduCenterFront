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
    }, duration - 450);

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
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center transition-all duration-500 ease-out select-none ${
        isFadingOut ? 'pointer-events-none scale-105 opacity-0' : 'scale-100 opacity-100'
      }`}
      style={{
        backgroundColor: '#0F3D3A',
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgba(244, 177, 59, 0.12) 0%, rgba(15, 61, 58, 1) 70%)',
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Animated logo with soft float */}
        <div className="animate-card-entrance">
          <AuthLogo variant="light" size="xl" showLeadingDot={true} />
        </div>

        {/* Golden sleek progress bar */}
        <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#F4B13B] shadow-[0_0_12px_#F4B13B] animate-progress-sweep" />
        </div>

        {/* Tagline */}
        <p className="text-xs font-medium tracking-widest uppercase text-white/70 animate-hero-entrance">
          {t('auth.splash.tagline')}
        </p>
      </div>

      {/* Skip button / hint */}
      <span className="absolute bottom-8 text-[11px] font-medium tracking-wide text-white/40 transition hover:text-white/80">
        {t('auth.splash.skip')}
      </span>
    </div>
  );
}
