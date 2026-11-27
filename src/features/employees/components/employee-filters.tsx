import { useTranslation } from 'react-i18next';
import { STATUS_FILTER } from '@/shared/constants';
import { Button, ErrorState, Select } from '@/shared/components';
import { useRoleOptions } from '@/features/roles';

export function EmployeeFilters({
  roleId,
  status,
  onRoleChange,
  onStatusChange,
  onClear,
}: {
  roleId: string;
  status: string;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const roles = useRoleOptions();

  return (
    <>
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
        <Select
          id="employee-role-filter"
          label={t('employees.form.role')}
          value={roleId}
          onChange={(event) => onRoleChange(event.target.value)}
          options={(roles.data ?? []).map((role) => ({
            id: role.id,
            name: role.name,
          }))}
          placeholder={t(roles.isPending ? 'common.loading' : 'common.all')}
          disabled={roles.isPending || Boolean(roles.error)}
        />
        <Select
          id="employee-status-filter"
          label={t('common.status')}
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          options={[
            { id: STATUS_FILTER.active, name: t('common.active') },
            { id: STATUS_FILTER.inactive, name: t('common.inactive') },
          ]}
          placeholder={t('common.all')}
        />
      </div>
      {roles.error && <ErrorState error={roles.error} onRetry={() => void roles.refetch()} />}
      <Button variant="ghost" className="mt-3" onClick={onClear}>
        {t('common.clearFilters')}
      </Button>
    </>
  );
}
