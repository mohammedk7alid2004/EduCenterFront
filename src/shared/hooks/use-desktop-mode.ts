import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'edu_desktop_mode';
const DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1.0';
const DESKTOP_VIEWPORT = 'width=1280, initial-scale=0.3, maximum-scale=3.0, user-scalable=yes';

export function useDesktopMode(): {
  isDesktopMode: boolean;
  toggleDesktopMode: () => void;
} {
  const [isDesktopMode, setIsDesktopMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const applyMode = useCallback((enabled: boolean) => {
    if (typeof document === 'undefined') return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }

    if (enabled) {
      meta.setAttribute('content', DESKTOP_VIEWPORT);
      document.documentElement.classList.add('desktop-site');
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      meta.setAttribute('content', DEFAULT_VIEWPORT);
      document.documentElement.classList.remove('desktop-site');
      localStorage.setItem(STORAGE_KEY, 'false');
    }
  }, []);

  useEffect(() => {
    if (isDesktopMode) {
      applyMode(true);
    }
  }, [isDesktopMode, applyMode]);

  const toggleDesktopMode = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && document.fullscreenEnabled) {
      if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        void document.exitFullscreen?.().catch(() => {});
      }
    }

    setIsDesktopMode((prev) => {
      const next = !prev;
      applyMode(next);
      return next;
    });
  }, [applyMode]);

  return { isDesktopMode, toggleDesktopMode };
}
