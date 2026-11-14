import { useAuditColumns } from '@/shared/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/core/auth';
import { useOnline } from '@/shared/lib';
import { DataTable, RowActions, StatusSwitch, useConfirm, type Column } from '@/shared/ui';
import type { EmployeeDto } from '../employees.types';
import { useDeleteEmployees, useToggleEmployeeStatus } from '../employees.queries';
export function EmployeesTable({
  rows,
  onView,
  onEdit,
}: {
  rows: EmployeeDto[];
  onView: (employee: EmployeeDto) => void;
  onEdit: (employee: EmployeeDto) => void;
}): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const can = usePermission();
  const remove = useDeleteEmployees();
  const toggle = useToggleEmployeeStatus();
  const { confirm, dialog } = useConfirm();
  function deleteSelection(ids: string[]) {
    confirm({
      title: t('employees.delete.title'),
      description: t('common.deleteSelection', { count: ids.length }),
      onConfirm: () => remove.mutateAsync(ids),
      successTitle: t('employees.delete.title'),
      successDescription: t('employees.feedback.deleted'),
    });
  }
  const auditColumns = useAuditColumns<EmployeeDto>();
  const columns: Column<EmployeeDto>[] = [
    {
      id: 'id',
      header: t('common.id'),
      headerClassName: 'w-28',
      cell: (employee) => (
        <span className="block max-w-24 truncate" title={employee.id}>
          #<bdi>{employee.id}</bdi>
        </span>
      ),
    },
    {
      id: 'name',
      header: t('employees.table.name'),
      cell: (employee) => <span>{employee.name}</span>,
    },
    {
      id: 'email',
      header: t('employees.form.email'),
      cell: (employee) => <bdi>{employee.email}</bdi>,
    },
    {
      id: 'phone',
      header: t('employees.form.phone'),
      cell: (employee) => <bdi>{employee.phoneNumber || t('common.noValue')}</bdi>,
    },
    {
      id: 'role',
      header: t('employees.form.role'),
      cell: (employee) => employee.role.name || t('common.noValue'),
    },
    ...auditColumns,
    {
      id: 'status',
      header: t('common.status'),
      cell: (employee) => (
        <StatusSwitch
          active={employee.isActive}
          disabled={!online || toggle.isPending || !can(PERMISSIONS.employees.toggleStatus)}
          onChange={() =>
            toggle.mutate(employee.id, {
              onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
            })
          }
        />
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      headerClassName: 'w-44',
      cell: (employee) => (
        <RowActions
          onView={() => onView(employee)}
          onEdit={() => onEdit(employee)}
          onDelete={() => deleteSelection([employee.id])}
          disabled={!online || remove.isPending}
          canView={can(PERMISSIONS.employees.detail)}
          canEdit={can(PERMISSIONS.employees.update) && can(PERMISSIONS.employees.detail)}
          canDelete={can(PERMISSIONS.employees.delete)}
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
        pending={!online || remove.isPending}
        onDeleteSelected={can(PERMISSIONS.employees.delete) ? deleteSelection : undefined}
      />
    </>
  );
}
