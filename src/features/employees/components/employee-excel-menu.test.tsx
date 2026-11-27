import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmployeeExcelMenu } from './employee-excel-menu';

const exportMutate = vi.fn();
const templateMutate = vi.fn();

vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/hooks', () => ({
  usePermission: () => () => true,
  useOnline: () => true,
}));

vi.mock('../commands', () => ({
  useEmployeesExport: () => ({ mutate: exportMutate, isPending: false }),
  useEmployeeTemplate: () => ({ mutate: templateMutate, isPending: false }),
}));

describe('EmployeeExcelMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('collapses Excel actions into a single dropdown button and triggers selected actions', () => {
    const onImport = vi.fn();
    render(<EmployeeExcelMenu filters={{ pageNumber: 1, pageSize: 10 }} onImport={onImport} />);

    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'employees.excel' }));

    expect(screen.getByRole('menu')).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: 'employees.template' }));
    expect(templateMutate).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'employees.excel' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'employees.import' }));
    expect(onImport).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'employees.excel' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'employees.export' }));
    expect(exportMutate).toHaveBeenCalledTimes(1);
  });
});
