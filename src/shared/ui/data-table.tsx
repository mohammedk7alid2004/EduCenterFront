import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from './states';
import { Button } from './button';
import { Icon } from './icon';

export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}
interface DataTableProps<T extends { id: string }> {
  columns: readonly Column<T>[];
  rows: readonly T[];
  className?: string;
  onDeleteSelected?: (ids: string[]) => void;
  pending?: boolean;
}
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  className = '',
  onDeleteSelected,
  pending,
}: DataTableProps<T>): JSX.Element {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<string[]>([]);
  const selected = selection.filter((id) => rows.some((row) => row.id === id));
  const allSelected = rows.length > 0 && selected.length === rows.length;
  if (!rows.length) return <EmptyState />;
  return (
    <div className={className}>
      {selected.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-2 text-sm">
          <span>{t('common.selected', { count: selected.length })}</span>
          {onDeleteSelected && (
            <Button variant="danger" disabled={pending} onClick={() => onDeleteSelected(selected)}>
              <Icon name="trash" className="size-4" />
              {t('common.deleteSelected')}
            </Button>
          )}
        </div>
      )}
      <div className="overflow-x-auto rounded-t-[14px] border-x border-b border-border">
        <table className="w-full min-w-[980px] table-auto border-collapse whitespace-nowrap text-start text-sm">
          <thead className="bg-table text-tableHeading">
            <tr>
              <th className="w-12 px-3 py-[18px]">
                <input
                  type="checkbox"
                  aria-label={t('common.selectAll')}
                  checked={allSelected}
                  ref={(element) => {
                    if (element) element.indeterminate = selected.length > 0 && !allSelected;
                  }}
                  onChange={() => setSelection(allSelected ? [] : rows.map((row) => row.id))}
                  className="design-checkbox size-[18px] shrink-0 cursor-pointer appearance-none rounded-[5px] border-2 border-tableHeading/80 bg-transparent checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`h-[60px] px-4 py-[18px] text-start font-semibold ${column.headerClassName ?? ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="h-[66px] transition hover:bg-primary/[0.025]">
                <td className="px-3 py-3.5">
                  <input
                    type="checkbox"
                    aria-label={t('common.selectRow', { id: row.id })}
                    checked={selected.includes(row.id)}
                    onChange={() =>
                      setSelection(
                        selected.includes(row.id)
                          ? selected.filter((id) => id !== row.id)
                          : [...selected, row.id],
                      )
                    }
                    className="design-checkbox size-[18px] shrink-0 cursor-pointer appearance-none rounded-[5px] border-2 border-tableHeading/80 bg-transparent checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </td>
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3.5 align-middle ${column.className ?? ''}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
