import { useId, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui';

interface Props {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLSelectElement>;
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
  const { t, i18n } = useTranslation();
  const id = useId();
  const [hours, minutes] = value.split(':').map(Number);
  const hour = hours % 12 || 12;
  const period = hours >= 12 ? 'pm' : 'am';
  const number = new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 });
  const update = (nextHour: number, nextMinute: number, nextPeriod: string) =>
    onChange(
      `${String((nextHour % 12) + (nextPeriod === 'pm' ? 12 : 0)).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`,
    );
  const selectClass =
    'h-9 min-w-0 flex-1 cursor-pointer rounded-full bg-transparent px-1 text-center text-sm outline-none focus:bg-primary/10 focus:ring-2 focus:ring-primary/20';
  return (
    <div>
      <span id={`${id}-label`} className="mb-2 block text-sm font-medium">
        {label}
        <span className="ms-1 text-danger">*</span>
      </span>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? `${id}-error` : undefined}
        dir="ltr"
        className={`flex h-10 items-center gap-1 rounded-full border bg-card px-3 ${error ? 'border-danger' : 'border-muted/60'}`}
      >
        <Icon name="clock" className="size-4 shrink-0 text-muted" />
        <select
          ref={inputRef}
          name={name}
          value={hour}
          onBlur={onBlur}
          onChange={(event) => update(Number(event.target.value), minutes, period)}
          aria-label={`${label} — ${t('appointments.timePicker.hour')}`}
          aria-invalid={Boolean(error)}
          className={selectClass}
        >
          {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
            <option key={item} value={item}>
              {number.format(item)}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className="text-muted">
          :
        </span>
        <select
          value={minutes}
          onBlur={onBlur}
          onChange={(event) => update(hour, Number(event.target.value), period)}
          aria-label={`${label} — ${t('appointments.timePicker.minute')}`}
          className={selectClass}
        >
          {Array.from({ length: 60 }, (_, index) => index).map((item) => (
            <option key={item} value={item}>
              {number.format(item)}
            </option>
          ))}
        </select>
        <select
          value={period}
          onBlur={onBlur}
          onChange={(event) => update(hour, minutes, event.target.value)}
          aria-label={`${label} — ${t('appointments.timePicker.period')}`}
          className={selectClass}
        >
          <option value="am">{t('appointments.timePicker.am')}</option>
          <option value="pm">{t('appointments.timePicker.pm')}</option>
        </select>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
