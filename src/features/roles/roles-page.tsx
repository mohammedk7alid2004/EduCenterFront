import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useListControls } from '@/shared/hooks';
import { ManagementList } from '@/shared/components';
import { useRoles } from './roles.queries';
import type { RoleDto } from './roles.types';
import { RolesTable } from './components/roles-table';
import { RoleFormModal } from './components/role-form-modal';
import { ViewRoleModal } from './components/view-role-modal';
export function RolesPage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const can = usePermission();
  const query = useRoles(controls.filters);
  const [editing, setEditing] = useState<RoleDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<RoleDto | null>(null);
  return (
    <>
      <ManagementList
        title={t('roleManagement.title')}
        description={t('roleManagement.description')}
        createLabel={t('roleManagement.create')}
        controls={controls}
        statusFilter={false}
        canCreate={can(PERMISSIONS.roles.create)}
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
        <RolesTable
          rows={query.data?.items ?? []}
          startIndex={(controls.page - 1) * controls.pageSize}
          onView={setViewing}
          onEdit={(role) => {
            setEditing(role);
            setFormOpen(true);
          }}
        />
      </ManagementList>
      {formOpen && <RoleFormModal role={editing} onClose={() => setFormOpen(false)} />}
      {viewing && <ViewRoleModal id={viewing.id} onClose={() => setViewing(null)} />}
    </>
  );
}
