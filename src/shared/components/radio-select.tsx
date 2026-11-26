import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type SelectHTMLAttributes,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icon';

export interface RadioSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  requiredAsterisk?: boolean;
  options: { id: string; name: string }[];
  placeholder?: string;
  clearable?: boolean;
}

export const RadioSelect = forwardRef<HTMLSelectElement, RadioSelectProps>(
  (
    {
      label,
      error,
      requiredAsterisk,
      options,
      placeholder,
      clearable = false,
      id,
      name,
      value = '',
      disabled,
      onChange,
      onBlur,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const root = useRef<HTMLDivElement>(null);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => option.id === String(value));
    const showClear = clearable && Boolean(selected) && !disabled;

    useEffect(() => {
      const handlePointerDown = (event: MouseEvent) => {
        if (!root.current?.contains(event.target as Node)) setOpen(false);
      };
      document.addEventListener('mousedown', handlePointerDown);
      return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    return (
      <div ref={root} className="relative w-full text-start">
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-foreground">
          {label}
          {requiredAsterisk && <span className="ms-1 text-danger">*</span>}
        </label>
        <select
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(event)}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        >
          <option value="" />
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            onBlur={(event) => onBlur?.(event as unknown as FocusEvent<HTMLSelectElement>)}
            onClick={() => setOpen((current) => !current)}
            className={`flex h-10 w-full items-center justify-between rounded-full border bg-card ps-4 ${showClear ? 'pe-14' : 'pe-4'} text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-danger' : 'border-muted/60'}`}
          >
            <span className={selected ? 'truncate text-foreground' : 'text-muted'}>
              {selected?.name ?? placeholder}
            </span>
            <Icon
              name="chevronDown"
              className={`size-4 shrink-0 text-primary transition ${open ? 'rotate-180' : ''}`}
            />
          </button>
          {showClear && (
            <button
              type="button"
              aria-label={t('common.close')}
              onClick={() => {
                onChange?.({
                  target: { value: '', name },
                } as unknown as ChangeEvent<HTMLSelectElement>);
                setOpen(false);
              }}
              className="absolute end-9 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-subtle hover:text-foreground"
            >
              <Icon name="close" className="size-3.5" />
            </button>
          )}
        </div>
        {open && (
          <div
            role="radiogroup"
            aria-label={label}
            className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-lg"
          >
            {options.length > 0 ? (
              options.map((option) => {
                const checked = option.id === String(value);
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${checked ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-subtle'}`}
                  >
                    <input
                      type="radio"
                      name={`${inputId}-radio`}
                      value={option.id}
                      checked={checked}
                      onChange={(event) => {
                        onChange?.(event as unknown as ChangeEvent<HTMLSelectElement>);
                        setOpen(false);
                      }}
                      className="size-4 accent-primary"
                    />
                    <span className="min-w-0 truncate">{option.name}</span>
                  </label>
                );
              })
            ) : (
              <p className="px-3 py-2 text-xs text-muted">{t('common.noOptions')}</p>
            )}
          </div>
        )}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

RadioSelect.displayName = 'RadioSelect';
