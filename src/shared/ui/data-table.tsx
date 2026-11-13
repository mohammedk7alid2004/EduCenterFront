import type { ReactNode } from 'react';
import { EmptyState } from './states';

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
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  className = '',
}: DataTableProps<T>): JSX.Element {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-start text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-wider ${
                    column.headerClassName ?? ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50/60">
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-5 py-4 align-middle ${column.className ?? ''}`}
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
