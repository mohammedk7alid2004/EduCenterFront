import { STORAGE_KEYS } from '@/shared/constants';

let sharedAudioContext: AudioContext | null = null;
let unlockRegistered = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioContext) {
    try {
      sharedAudioContext = new AudioCtx();
    } catch {
      return null;
    }
  }
  return sharedAudioContext;
}

export function isNotificationSoundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.notificationSound) !== 'false';
  } catch {
    return true;
  }
}

export function setNotificationSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.notificationSound, String(enabled));
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

export function unlockNotificationAudio(): void {
  if (typeof window === 'undefined' || unlockRegistered) return;
  unlockRegistered = true;

  const resume = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }
  };

  window.addEventListener('pointerdown', resume, { passive: true });
  window.addEventListener('keydown', resume, { passive: true });
}

function scheduleTone(
  ctx: AudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  peakGain: number,
  waveType: OscillatorType = 'triangle',
): void {
  const start = ctx.currentTime + startOffset;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = waveType;
  oscillator.frequency.setValueAtTime(frequency, start);

  // Clean attack and exponential decay for a clear, pleasant chime.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peakGain, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playNotificationSound(force = false): void {
  if (!force && !isNotificationSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const triggerChime = () => {
    try {
      // Clear, audible two-note chime (E5 -> A5) with soft harmonics.
      scheduleTone(ctx, 659.25, 0, 0.28, 0.38, 'triangle');
      scheduleTone(ctx, 880, 0.095, 0.4, 0.42, 'triangle');
    } catch {
      // Ignore audio scheduling failures.
    }
  };

  if (ctx.state === 'suspended') {
    void ctx
      .resume()
      .then(triggerChime)
      .catch(() => undefined);
    return;
  }

  triggerChime();
}
