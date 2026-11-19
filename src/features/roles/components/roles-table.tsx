import { useAuditColumns } from '@/shared/components';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS, isReservedRole } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import { DataTable, Icon, RowActions, useConfirm, type Column } from '@/shared/components';
import { useDeleteRoles } from '../roles.queries';
import type { RoleDto } from '../roles.types';
export function RolesTable({
  rows,
  onView,
  onEdit,
}: {
  rows: RoleDto[];
  onView: (role: RoleDto) => void;
  onEdit: (role: RoleDto) => void;
}): JSX.Element {
  const { t } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const mutation = useDeleteRoles();
  const { confirm, dialog } = useConfirm();
  function remove(ids: string[]) {
    confirm({
      title: t('roleManagement.delete.title'),
      description: t('common.deleteSelection', { count: ids.length }),
      onConfirm: () => mutation.mutateAsync(ids),
      successTitle: t('roleManagement.delete.title'),
      successDescription: t('roleManagement.feedback.deleted'),
    });
  }
  const auditColumns = useAuditColumns<RoleDto>();
  const columns: Column<RoleDto>[] = [
    {
      id: 'id',
      header: t('common.id'),
      headerClassName: 'w-28',
      cell: (role) => (
        <span className="block max-w-24 truncate" title={role.id}>
          #<bdi>{role.id}</bdi>
        </span>
      ),
    },
    {
      id: 'name',
      header: t('roleManagement.form.name'),
      cell: (role) => (
        <button type="button" onClick={() => onView(role)} className="text-start">
          {role.name}
        </button>
      ),
    },
    {
      id: 'permissions',
      header: t('roleManagement.permissions'),
      cell: (role) => (
        <button
          type="button"
          onClick={() => onView(role)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs text-card"
        >
          <Icon name="permission" className="size-4" />
          {t('common.view')}
        </button>
      ),
    },
    ...auditColumns,
    {
      id: 'actions',
      header: t('common.actions'),
      headerClassName: 'w-44',
      cell: (role) => (
        <RowActions
          onView={() => onView(role)}
          onEdit={() => onEdit(role)}
          onDelete={() => remove([role.id])}
          disabled={!online || mutation.isPending}
          canEdit={can(PERMISSIONS.roles.update) && !isReservedRole(role.name)}
          canDelete={can(PERMISSIONS.roles.delete) && !isReservedRole(role.name)}
        />
      ),
    },
  ];
  return (
    <>
      {dialog}
      <DataTable
        columns={columns}
        rows={rows}
        pending={!online || mutation.isPending}
        onDeleteSelected={can(PERMISSIONS.roles.delete) ? (ids) => remove(ids) : undefined}
      />
    </>
  );
}
