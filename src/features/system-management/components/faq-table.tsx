import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePermission } from '@/core/auth';
import { useOnline } from '@/shared/lib';
import {
  DataTable,
  RowActions,
  StatusSwitch,
  useAuditColumns,
  useConfirm,
  type Column,
} from '@/shared/ui';
import { FAQ_PERMISSIONS } from '../system-management.constants';
import { useDeleteFaqs, useToggleFaq } from '../system-management.queries';
import type { FaqDto } from '../system-management.types';
export function FaqTable({
  rows,
  onView,
  onEdit,
}: {
  rows: FaqDto[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const remove = useDeleteFaqs();
  const toggle = useToggleFaq();
  const { confirm, dialog } = useConfirm();
  const audit = useAuditColumns<FaqDto>();
  const language = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const pending = !online || remove.isPending || toggle.isPending;
  function deleteSelection(ids: string[]) {
    confirm({
      title: t('systemManagement.faq.delete'),
      description: t('common.deleteSelection', { count: ids.length }),
      onConfirm: () => remove.mutateAsync(ids).then(() => undefined),
      successTitle: t('systemManagement.faq.delete'),
      successDescription: t('systemManagement.faq.deleted'),
    });
  }
  const columns: Column<FaqDto>[] = [
    {
      id: 'id',
      header: t('common.id'),
      cell: (row) => (
        <span className="block max-w-24 truncate" title={row.id}>
          #<bdi>{row.id}</bdi>
        </span>
      ),
    },
    ...(['question', 'answer'] as const).map((key) => ({
      id: key,
      header: t(`systemManagement.faq.${key}`),
      headerClassName: 'min-w-64',
      cell: (row: FaqDto) => (
        <span className="block max-w-80 truncate" title={row[key][language] ?? ''}>
          {row[key][language] || t('common.noValue')}
        </span>
      ),
    })),
    ...audit,
    {
      id: 'status',
      header: t('common.status'),
      cell: (row) => (
        <StatusSwitch
          active={row.isActive}
          disabled={pending || !can(FAQ_PERMISSIONS.status)}
          onChange={() =>
            toggle.mutate(row.id, {
              onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
            })
          }
        />
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (row) => (
        <RowActions
          disabled={pending}
          canView={can(FAQ_PERMISSIONS.detail)}
          canEdit={can(FAQ_PERMISSIONS.update) && can(FAQ_PERMISSIONS.detail)}
          canDelete={can(FAQ_PERMISSIONS.delete)}
          onView={() => onView(row.id)}
          onEdit={() => onEdit(row.id)}
          onDelete={() => deleteSelection([row.id])}
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
        pending={pending}
        onDeleteSelected={can(FAQ_PERMISSIONS.delete) ? deleteSelection : undefined}
      />
    </>
  );
}
