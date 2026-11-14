import { useTranslation } from 'react-i18next';
import type { AuditFields } from '@/core/api';
import type { Column } from './data-table';

export function useAuditColumns<T extends AuditFields>(): Column<T>[] {
  const { t, i18n } = useTranslation();
  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const dateCell = (value?: string | null) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? (
      <time dateTime={value ?? undefined} title={value ?? undefined}>
        {formatter.format(date)}
      </time>
    ) : (
      t('common.noValue')
    );
  };
  return [
    {
      id: 'createdBy',
      header: t('audit.createdBy'),
      cell: (row) => row.createdBy || t('common.noValue'),
    },
    {
      id: 'updatedBy',
      header: t('audit.updatedBy'),
      cell: (row) => row.updatedBy || t('common.noValue'),
    },
    { id: 'createdAt', header: t('audit.createdAt'), cell: (row) => dateCell(row.createdAt) },
    { id: 'updatedAt', header: t('audit.updatedAt'), cell: (row) => dateCell(row.updatedAt) },
  ];
}
