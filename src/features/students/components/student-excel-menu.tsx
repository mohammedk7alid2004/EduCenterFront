import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/config';
import type { IconName } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { Button, Icon } from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import { downloadBlob } from '@/shared/utils';
import { STUDENT_FILE_NAMES } from '../students.constants';
import { useStudentsExport, useStudentTemplate } from '../students.queries';
import type { StudentFilters } from '../students.types';

interface ExcelMenuItem {
  key: string;
  label: string;
  icon: IconName;
  pending: boolean;
  onSelect: () => void;
}

export function StudentExcelMenu({
  filters,
  onImport,
}: {
  filters: StudentFilters;
  onImport: () => void;
}): JSX.Element | null {
  const { t } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const exporter = useStudentsExport();
  const template = useStudentTemplate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node))
        setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const items: ExcelMenuItem[] = [];
  if (can(PERMISSIONS.students.template)) {
    items.push({
      key: 'template',
      label: t('students.template'),
      icon: 'pdfFile',
      pending: template.isPending,
      onSelect: () =>
        template.mutate(undefined, {
          onSuccess: (file) => downloadBlob(file, STUDENT_FILE_NAMES.template),
          onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
        }),
    });
  }
  if (can(PERMISSIONS.students.import)) {
    items.push({
      key: 'import',
      label: t('students.import'),
      icon: 'upload',
      pending: false,
      onSelect: onImport,
    });
  }
  if (can(PERMISSIONS.students.read)) {
    items.push({
      key: 'export',
      label: t('students.export'),
      icon: 'download',
      pending: exporter.isPending,
      onSelect: () =>
        exporter.mutate(filters, {
          onSuccess: (file) => downloadBlob(file, STUDENT_FILE_NAMES.export),
          onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
        }),
    });
  }

  if (items.length === 0) return null;

  const busy = exporter.isPending || template.isPending;

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={!online}
        onClick={() => setOpen((prev) => !prev)}
        className="h-[43px] rounded-xl border border-primary/25 bg-card px-4 text-primary hover:bg-primary/5"
      >
        <Icon name={busy ? 'loader' : 'excel'} className={`size-4 ${busy ? 'animate-spin' : ''}`} />
        <span>{t('students.excel')}</span>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} className="size-4 text-muted" />
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-30 mt-2 min-w-52 rounded-2xl border border-border bg-card p-1.5 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={!online || item.pending}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-foreground transition hover:bg-primary/5 hover:text-primary disabled:opacity-50"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-iconSurface text-primary">
                <Icon
                  name={item.pending ? 'loader' : item.icon}
                  className={`size-4 ${item.pending ? 'animate-spin' : ''}`}
                />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
