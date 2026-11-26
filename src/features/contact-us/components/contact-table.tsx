import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import { DataTable, Icon, RowActions, useConfirm, type Column } from '@/shared/components';
import { useDeleteContacts } from '../contact-us.queries';
import { contactDate } from '../contact-us.lib';
import type { ContactMessage } from '../contact-us.types';
export function ContactTable({
  rows,
  startIndex,
  onView,
  onReply,
}: {
  rows: ContactMessage[];
  startIndex?: number;
  onView: (id: string) => void;
  onReply: (row: ContactMessage) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const remove = useDeleteContacts();
  const { confirm, dialog } = useConfirm();
  function deleteSelection(ids: string[]) {
    confirm({
      title: t('contactUs.deleteTitle'),
      description: t('common.deleteSelection', { count: ids.length }),
      onConfirm: () => remove.mutateAsync(ids),
      successTitle: t('contactUs.deleteTitle'),
      successDescription: t('contactUs.deleted'),
    });
  }
  const columns: Column<ContactMessage>[] = [
    {
      id: 'index',
      header: t('common.index'),
      headerClassName: 'w-16',
      cell: (_row, index) => <span className="font-medium text-muted">{index + 1}</span>,
    },
    {
      id: 'name',
      header: t('contactUs.fields.name'),
      headerClassName: 'min-w-44',
      cell: (row) =>
        can(PERMISSIONS.contactUs.detail) ? (
          <button
            className="max-w-52 truncate text-start font-medium hover:text-primary"
            title={row.name}
            onClick={() => onView(row.id)}
          >
            {row.name || t('common.noValue')}
          </button>
        ) : (
          row.name
        ),
    },
    {
      id: 'email',
      header: t('contactUs.fields.email'),
      cell: (row) =>
        row.email ? (
          <a
            href={`mailto:${row.email}`}
            className="block max-w-56 truncate hover:text-primary"
            title={row.email}
          >
            <bdi>{row.email}</bdi>
          </a>
        ) : (
          t('common.noValue')
        ),
    },
    {
      id: 'phone',
      header: t('contactUs.fields.phone'),
      headerClassName: 'min-w-40',
      cell: (row) =>
        row.phone || row.phoneNumber ? (
          <a
            href={`tel:${(row.phone || row.phoneNumber).replace(/[^+\d]/g, '')}`}
            className="hover:text-primary"
          >
            <bdi>{row.phone || `${row.phoneCountryCode} ${row.phoneNumber}`}</bdi>
          </a>
        ) : (
          t('common.noValue')
        ),
    },
    {
      id: 'subject',
      header: t('contactUs.fields.subject'),
      headerClassName: 'min-w-48',
      cell: (row) => (
        <span className="block max-w-56 truncate" title={row.subject}>
          {row.subject || t('common.noValue')}
        </span>
      ),
    },
    {
      id: 'message',
      header: t('contactUs.fields.message'),
      headerClassName: 'min-w-64',
      cell: (row) => (
        <span className="block max-w-72 truncate" title={row.message}>
          {row.message || t('common.noValue')}
        </span>
      ),
    },
    {
      id: 'createdAt',
      header: t('contactUs.receivedAt'),
      headerClassName: 'min-w-44',
      cell: (row) => (
        <time dateTime={row.createdAt}>
          {contactDate(row.createdAt, i18n.language) ?? t('common.noValue')}
        </time>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      headerClassName: 'min-w-36',
      cell: (row) => (
        <RowActions
          onView={() => onView(row.id)}
          onEdit={() => onView(row.id)}
          onDelete={() => deleteSelection([row.id])}
          disabled={!online || remove.isPending}
          canView={can(PERMISSIONS.contactUs.detail)}
          canEdit={false}
          canDelete={can(PERMISSIONS.contactUs.delete)}
          extraAction={
            can(PERMISSIONS.contactUs.sendEmail) ? (
              <button
                type="button"
                onClick={() => onReply(row)}
                disabled={!online || remove.isPending}
                aria-label={t('contactUs.reply.action')}
                title={t('contactUs.reply.action')}
                className="grid size-[38px] place-items-center rounded-lg bg-iconSurface text-primary transition hover:bg-primary/15 disabled:opacity-50"
              >
                <Icon name="mail" className="size-5" />
              </button>
            ) : undefined
          }
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
        startIndex={startIndex}
        pending={!online || remove.isPending}
        onDeleteSelected={can(PERMISSIONS.contactUs.delete) ? deleteSelection : undefined}
      />
    </>
  );
}
