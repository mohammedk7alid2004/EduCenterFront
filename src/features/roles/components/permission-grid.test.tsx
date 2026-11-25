import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PermissionGrid } from './permission-grid';

vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({ t: (key: string) => key }),
}));
const permissions = [
  { permissionId: 'read-id', permissionName: 'Teachers.GetAll' },
  { permissionId: 'create-id', permissionName: 'Teachers.Create' },
  { permissionId: 'delete-id', permissionName: 'Teachers.Delete' },
];

describe('permission grants', () => {
  it('revokes and grants only the selected permission while preserving the others', async () => {
    const changed = vi.fn();
    function Harness() {
      const [selected, setSelected] = useState(['read-id', 'delete-id']);
      return (
        <PermissionGrid
          permissions={permissions}
          selected={selected}
          onChange={(ids) => {
            setSelected(ids);
            changed(ids);
          }}
        />
      );
    }
    render(<Harness />);
    await userEvent.click(screen.getByRole('switch', { name: 'permissionActions.GetAll' }));
    expect(changed).toHaveBeenLastCalledWith(['delete-id']);
    expect(screen.getByRole('switch', { name: 'permissionActions.GetAll' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await userEvent.click(screen.getByRole('switch', { name: 'permissionActions.Create' }));
    expect(changed).toHaveBeenLastCalledWith(['delete-id', 'create-id']);
    expect(screen.getByRole('switch', { name: 'permissionActions.Delete' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('does not change permissions from the view dialog', async () => {
    const changed = vi.fn();
    render(
      <PermissionGrid
        permissions={permissions}
        selected={['read-id']}
        readOnly
        onChange={changed}
      />,
    );
    await userEvent.click(screen.getByRole('switch', { name: 'permissionActions.GetAll' }));
    expect(changed).not.toHaveBeenCalled();
  });

  it('grants and revokes every permission in a section from its checkbox', async () => {
    const changed = vi.fn();
    function Harness() {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <PermissionGrid
          permissions={permissions}
          selected={selected}
          onChange={(ids) => {
            setSelected(ids);
            changed(ids);
          }}
        />
      );
    }
    render(<Harness />);
    const sectionCheckbox = screen.getByRole('checkbox', {
      name: 'roleManagement.selectGroupPermissions',
    });
    await userEvent.click(sectionCheckbox);
    expect(changed).toHaveBeenLastCalledWith(['read-id', 'create-id', 'delete-id']);
    expect(sectionCheckbox).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(sectionCheckbox);
    expect(changed).toHaveBeenLastCalledWith([]);
  });
});
