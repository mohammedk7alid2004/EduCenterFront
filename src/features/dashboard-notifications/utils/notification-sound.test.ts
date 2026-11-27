import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isNotificationSoundEnabled,
  playNotificationSound,
  setNotificationSoundEnabled,
} from './notification-sound';

describe('notification sound preference and chime', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('defaults to enabled and persists mute preference', () => {
    expect(isNotificationSoundEnabled()).toBe(true);
    setNotificationSoundEnabled(false);
    expect(isNotificationSoundEnabled()).toBe(false);
    setNotificationSoundEnabled(true);
    expect(isNotificationSoundEnabled()).toBe(true);
  });

  it('does not throw when AudioContext is unavailable', () => {
    expect(() => playNotificationSound()).not.toThrow();
    expect(() => playNotificationSound(true)).not.toThrow();
  });
});
