import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/components';
import { WEEK_DAYS } from '../appointments.constants';

interface AppointmentDaysSelectProps {
  value: number[];
  onChange: (days: number[]) => void;
  onBlur: () => void;
  error?: string;
}

export function AppointmentDaysSelect({
  value,
  onChange,
  onBlur,
  error,
}: AppointmentDaysSelectProps): JSX.Element {
  const { t } = useTranslation();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const orderedDays = WEEK_DAYS.filter((day) => value.includes(day));
  const label = orderedDays.length
    ? orderedDays.map((day) => t(`appointments.days.${day}`)).join(' - ')
    : t('appointments.selectDays');

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const toggleDay = (day: number) => {
    onChange(value.includes(day) ? value.filter((item) => item !== day) : [...value, day]);
  };

  return (
    <div ref={root} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onBlur={onBlur}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-10 w-full items-center justify-between rounded-full border bg-card px-4 text-sm text-start outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 ${error ? 'border-danger' : 'border-muted/60'}`}
      >
        <span className={orderedDays.length ? 'truncate text-foreground' : 'text-muted'}>
          {label}
        </span>
        <Icon
          name="chevronDown"
          className={`size-4 shrink-0 text-primary transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg"
        >
          {WEEK_DAYS.map((day) => {
            const selected = value.includes(day);
            return (
              <button
                key={day}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => toggleDay(day)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-start transition ${selected ? 'bg-permissionSurface text-primary' : 'hover:bg-subtle'}`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-4 place-items-center rounded border ${selected ? 'border-primary bg-primary text-card' : 'border-muted/60'}`}
                >
                  {selected && <Icon name="check" className="size-3" />}
                </span>
                {t(`appointments.days.${day}`)}
              </button>
            );
          })}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
