import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudentQrModal } from './student-qr-modal';

const generateQrDataUrlMock = vi.fn().mockResolvedValue('data:image/png;base64,abc');
const exportQrCardMock = vi.fn().mockResolvedValue(undefined);

vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/features/system-management', () => ({
  useCenterBrand: () => ({ data: { navbarLogoUrl: '/logo.png' } }),
}));

vi.mock('@/shared/hooks', () => ({
  useOnline: () => true,
}));

vi.mock('@/shared/utils', async () => {
  const actual = await vi.importActual<typeof import('@/shared/utils')>('@/shared/utils');
  return {
    ...actual,
    generateQrDataUrl: (...args: unknown[]) => generateQrDataUrlMock(...args),
    exportQrCard: (...args: unknown[]) => exportQrCardMock(...args),
  };
});

vi.mock('../queries', () => ({
  useStudent: () => ({
    isPending: false,
    error: null,
    refetch: vi.fn(),
    data: {
      id: 'st-1',
      userId: 'usr-1',
      name: 'Ahmed Gamal',
      email: 'ahmed@example.test',
      phoneNumber: '01012345678',
      parentPhoneNumber: '01098765432',
      gender: 'Male',
      role: 'Student',
      educationLevelId: 'lvl-1',
      educationLevel: { ar: 'المرحلة الإعدادية', en: 'Preparatory School' },
      educationGradeId: 'grd-1',
      educationGrade: { ar: 'الصف الثالث الإعدادي', en: 'Preparatory Grade 3' },
      isActive: true,
      subjects: [{ id: 'sub-1', name: { ar: 'رياضيات', en: 'Math' } }],
      groups: [{ id: 'grp-1', name: { ar: 'مجموعة أ', en: 'Group A' } }],
      fees: null,
      createdBy: 'Admin',
      createdAt: '2026-11-26T00:00:00Z',
    },
  }),
}));

describe('StudentQrModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  });

  it('encodes the student profile fields into QR payload and supports PNG/PDF export', async () => {
    render(<StudentQrModal id="st-1" onClose={vi.fn()} />);

    await waitFor(() => expect(generateQrDataUrlMock).toHaveBeenCalledTimes(1));
    const encodedPayload = JSON.parse(generateQrDataUrlMock.mock.calls[0][0] as string);
    expect(encodedPayload).toMatchObject({
      id: 'st-1',
      userId: 'usr-1',
      name: 'Ahmed Gamal',
      email: 'ahmed@example.test',
      phoneNumber: '01012345678',
      parentPhoneNumber: '01098765432',
      educationLevel: 'Preparatory School',
      educationGrade: 'Preparatory Grade 3',
      isActive: true,
      subjects: ['Math'],
      groups: ['Group A'],
    });

    const pngButton = await screen.findByRole('button', { name: 'students.qr.png' });
    fireEvent.click(pngButton);
    await waitFor(() =>
      expect(exportQrCardMock).toHaveBeenCalledWith(
        expect.objectContaining({ fileNameBase: 'student-st-1-qr', format: 'png' }),
      ),
    );
  });
});
