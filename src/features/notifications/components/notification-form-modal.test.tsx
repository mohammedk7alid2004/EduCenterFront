import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotificationFormModal } from './notification-form-modal';

const mutate = vi.fn();

vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/shared/hooks', () => ({
  useOnline: () => true,
}));

vi.mock('../notifications.queries', () => ({
  useNotification: () => ({ data: undefined, isPending: false, error: null }),
  useCreateNotification: () => ({ mutate, isPending: false, error: null }),
  useUpdateNotification: () => ({ mutate, isPending: false, error: null }),
  useNotificationGroups: () => ({
    data: [{ id: 'g-1', name: 'Physics 3rd', levelId: 'l-1', gradeId: 'gr-1' }],
    isPending: false,
    error: null,
  }),
  useNotificationLevels: () => ({
    data: [{ id: 'l-1', name: { ar: 'الثانوية', en: 'Secondary' } }],
    isPending: false,
    error: null,
  }),
  useNotificationGrades: (levelId?: string) => ({
    data: levelId ? [{ id: 'gr-1', name: { ar: 'الصف الثالث', en: 'Grade 12' } }] : [],
    isPending: false,
    error: null,
  }),
}));

describe('NotificationFormModal group selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it('auto-fills and disables level and grade when a group is selected, and clears on reset', () => {
    render(<NotificationFormModal notification={null} onClose={vi.fn()} />);

    const groupSelect = screen.getByLabelText('notifications.fields.group') as HTMLSelectElement;
    const levelSelect = screen.getByLabelText('notifications.fields.level') as HTMLSelectElement;
    const gradeSelect = screen.getByLabelText('notifications.fields.grade') as HTMLSelectElement;

    expect(levelSelect.disabled).toBe(false);
    expect(gradeSelect.disabled).toBe(true);

    fireEvent.change(groupSelect, { target: { value: 'g-1' } });

    expect(levelSelect.value).toBe('l-1');
    expect(gradeSelect.value).toBe('gr-1');
    expect(levelSelect.disabled).toBe(true);
    expect(gradeSelect.disabled).toBe(true);

    fireEvent.change(groupSelect, { target: { value: '' } });

    expect(levelSelect.value).toBe('');
    expect(gradeSelect.value).toBe('');
    expect(levelSelect.disabled).toBe(false);
    expect(gradeSelect.disabled).toBe(true);
  });
});
