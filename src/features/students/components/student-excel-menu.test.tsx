import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudentExcelMenu } from './student-excel-menu';

const exportMutate = vi.fn();
const templateMutate = vi.fn();

vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/infrastructure/auth', () => ({
  usePermission: () => () => true,
}));

vi.mock('@/shared/hooks', () => ({
  useOnline: () => true,
}));

vi.mock('../students.queries', () => ({
  useStudentsExport: () => ({ mutate: exportMutate, isPending: false }),
  useStudentTemplate: () => ({ mutate: templateMutate, isPending: false }),
}));

describe('StudentExcelMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('collapses Excel actions into a single dropdown button and triggers selected actions', () => {
    const onImport = vi.fn();
    render(<StudentExcelMenu filters={{ pageNumber: 1, pageSize: 10 }} onImport={onImport} />);

    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'students.excel' }));

    expect(screen.getByRole('menu')).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: 'students.template' }));
    expect(templateMutate).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'students.excel' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'students.import' }));
    expect(onImport).toHaveBeenCalledTimes(1);
  });
});
