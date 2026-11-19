import { useId, useState, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/components';
import { formatAppointmentTime } from '../appointments.lib';
import { AppointmentTimePicker } from './appointment-time-picker';
interface Props {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLButtonElement>;
  error?: string;
}
export function AppointmentTimeField({
  name,
  label,
  value,
  onChange,
  onBlur,
  inputRef,
  error,
}: Props): JSX.Element {
  const { i18n } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        <span className="ms-1 text-danger">*</span>
      </label>
      <button
        type="button"
        ref={inputRef}
        id={id}
        name={name}
        onBlur={onBlur}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => setOpen(true)}
        className={`flex h-10 w-full items-center justify-between rounded-full border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? 'border-danger' : 'border-muted/60'}`}
      >
        <bdi>{formatAppointmentTime(value, i18n.language)}</bdi>
        <Icon name="clock" className="size-4 text-muted" />
      </button>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
      {open && (
        <AppointmentTimePicker
          label={label}
          value={value}
          onApply={(next) => {
            onChange(next);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
