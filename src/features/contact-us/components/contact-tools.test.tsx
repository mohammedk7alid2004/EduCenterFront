import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContactTools } from './contact-tools';

vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/hooks', () => ({
  usePermission: () => () => true,
  useOnline: () => true,
}));

vi.mock('../commands', () => ({
  useContactFile: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('ContactTools', () => {
  it('renders only Export Excel and omits template and import buttons', () => {
    render(<ContactTools filters={{ pageNumber: 1, pageSize: 10 }} />);

    expect(screen.getByRole('button', { name: 'contactUs.export' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'contactUs.template' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'contactUs.import' })).toBeNull();
  });
});
