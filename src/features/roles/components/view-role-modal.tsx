import { useTranslation } from 'react-i18next';
import { Modal, DetailField, LoadingState, ErrorState } from '@/shared/ui';
import { usePermissionCatalog, useRole } from '../roles.queries';
import { PermissionGrid } from './permission-grid';
export function ViewRoleModal({ id, onClose }: { id: string; onClose: () => void }): JSX.Element {
  const { t } = useTranslation();
  const detail = useRole(id);
  const catalog = usePermissionCatalog();
  const error = detail.error || catalog.error;
  return (
    <Modal title={t('roleManagement.viewTitle')} icon="permission" onClose={onClose} size="wide">
      {detail.isPending || catalog.isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={() => {
            void detail.refetch();
            void catalog.refetch();
          }}
        />
      ) : (
        <div className="space-y-6">
          <dl>
            <DetailField label={t('roleManagement.form.name')}>{detail.data?.roleName}</DetailField>
          </dl>
          <PermissionGrid
            permissions={catalog.data ?? []}
            selected={detail.data?.permissions.map((permission) => permission.permissionId) ?? []}
            readOnly
          />
        </div>
      )}
    </Modal>
  );
}
