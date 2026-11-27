import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExcelMenu } from './excel-menu';

vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/hooks', () => ({
  useOnline: () => true,
}));

describe('ExcelMenu', () => {
  it('renders a single dropdown trigger and invokes selected Excel actions', () => {
    const onTemplate = vi.fn();
    const onImport = vi.fn();
    const onExport = vi.fn();

    render(
      <ExcelMenu
        actions={[
          {
            key: 'template',
            label: 'excel.template',
            icon: 'pdfFile',
            pending: false,
            onSelect: onTemplate,
          },
          {
            key: 'import',
            label: 'excel.import',
            icon: 'upload',
            pending: false,
            onSelect: onImport,
          },
          {
            key: 'export',
            label: 'excel.export',
            icon: 'download',
            pending: false,
            onSelect: onExport,
          },
        ]}
      />,
    );

    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'excel.label' }));
    expect(screen.getByRole('menu')).toBeTruthy();

    fireEvent.click(screen.getByRole('menuitem', { name: 'excel.template' }));
    expect(onTemplate).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'excel.label' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'excel.import' }));
    expect(onImport).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'excel.label' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'excel.export' }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});
