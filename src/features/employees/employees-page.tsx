import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useListControls } from '@/shared/hooks';
import { ManagementList } from '@/shared/components';
import { useEmployees } from './employees.queries';
import type { EmployeeDto } from './employees.types';
import { EmployeesTable } from './components/employees-table';
import { EmployeeFormModal } from './components/employee-form-modal';
import { ViewEmployeeModal } from './components/view-employee-modal';
export function EmployeesPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const query = useEmployees(controls.filters);
  const can = usePermission();
  const [editing, setEditing] = useState<EmployeeDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<EmployeeDto | null>(null);
  return (
    <>
      <ManagementList
        title={t('employees.title')}
        description={t('employees.description')}
        createLabel={t('employees.create')}
        controls={controls}
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
      >
        <EmployeesTable
          rows={query.data?.items ?? []}
          onView={setViewing}
          onEdit={(employee) => {
            setEditing(employee);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && <EmployeeFormModal employee={editing} onClose={() => setFormOpen(false)} />}
      {viewing && <ViewEmployeeModal id={viewing.id} onClose={() => setViewing(null)} />}
    </>
  );
}
