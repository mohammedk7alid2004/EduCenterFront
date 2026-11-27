import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IconName } from '@/app/config';
import { useOnline } from '@/shared/hooks';
import { Button } from './button';
import { Icon } from './icon';

export interface ExcelMenuAction {
  key: string;
  label: string;
  icon: IconName;
  pending: boolean;
  onSelect: () => void;
}

export function ExcelMenu({
  label,
  actions,
}: {
  label?: string;
  actions: ExcelMenuAction[];
}): JSX.Element | null {
  const { t } = useTranslation();
  const online = useOnline();
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

  if (actions.length === 0) return null;

  const busy = actions.some((action) => action.pending);

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
        <span>{label ?? t('excel.label')}</span>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} className="size-4 text-muted" />
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-30 mt-2 min-w-52 rounded-2xl border border-border bg-card p-1.5 shadow-lg"
        >
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              disabled={!online || action.pending}
              onClick={() => {
                setOpen(false);
                action.onSelect();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-foreground transition hover:bg-primary/5 hover:text-primary disabled:opacity-50"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-iconSurface text-primary">
                <Icon
                  name={action.pending ? 'loader' : action.icon}
                  className={`size-4 ${action.pending ? 'animate-spin' : ''}`}
                />
              </span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
