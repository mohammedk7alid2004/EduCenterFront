import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { LIST_PARAMS } from '@/shared/constants';
import { PERMISSIONS } from '@/app/config';
import { useListControls, usePermission } from '@/shared/hooks';
import { ManagementList } from '@/shared/components';
import {
  useEmployees,
  EMPLOYEE_FILTER_PARAMS,
  EmployeesTable,
  EmployeeFilters,
  EmployeeExcelMenu,
  EmployeeFormModal,
  ImportEmployeesModal,
  ViewEmployeeModal,
} from '@/features/employees';
import type { EmployeeDto } from '@/features/employees';

export function EmployeesPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const [params, setParams] = useSearchParams();
  const roleId = params.get(EMPLOYEE_FILTER_PARAMS.roleId) ?? '';
  const filters = {
    ...controls.filters,
    roleId: roleId || undefined,
  };
  const query = useEmployees(filters);
  const can = usePermission();
  const [editing, setEditing] = useState<EmployeeDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [viewing, setViewing] = useState<EmployeeDto | null>(null);

  function changeRole(value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(EMPLOYEE_FILTER_PARAMS.roleId, value);
      else next.delete(EMPLOYEE_FILTER_PARAMS.roleId);
      next.delete(LIST_PARAMS.page);
      return next;
    });
  }

  return (
    <>
      <ManagementList
        title={t('employees.title')}
        description={t('employees.description')}
        createLabel={t('employees.create')}
        searchPlaceholder={t('employees.searchPlaceholder')}
        controls={controls}
        statusFilter={false}
        filterActive={Boolean(roleId || controls.status)}
        canCreate={can(PERMISSIONS.employees.create)}
        totalCount={query.data?.totalCount ?? 0}
        totalPages={Math.max(1, query.data?.totalPages ?? 1)}
        loading={query.isPending}
        fetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        onCreate={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        filterContent={
          <EmployeeFilters
            roleId={roleId}
            status={controls.status}
            onRoleChange={changeRole}
            onStatusChange={controls.setStatus}
            onClear={() =>
              setParams((current) => {
                const next = new URLSearchParams(current);
                for (const key of Object.values(EMPLOYEE_FILTER_PARAMS)) next.delete(key);
                next.delete(LIST_PARAMS.status);
                next.delete(LIST_PARAMS.page);
                return next;
              })
            }
          />
        }
        searchActions={<EmployeeExcelMenu filters={filters} onImport={() => setImportOpen(true)} />}
      >
        <EmployeesTable
          rows={query.data?.items ?? []}
          startIndex={(controls.page - 1) * controls.pageSize}
          onView={setViewing}
          onEdit={(employee) => {
            setEditing(employee);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && <EmployeeFormModal employee={editing} onClose={() => setFormOpen(false)} />}
      {importOpen && <ImportEmployeesModal onClose={() => setImportOpen(false)} />}
      {viewing && <ViewEmployeeModal id={viewing.id} onClose={() => setViewing(null)} />}
    </>
  );
}
