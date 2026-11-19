import { forwardRef, type SelectHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icon';
interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  requiredAsterisk?: boolean;
  options: { id: string; name: string }[];
  placeholder?: string;
}
export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, requiredAsterisk, options, placeholder, id, name, ...props }, ref) => {
    const { t } = useTranslation();
    const inputId = id ?? name;
    return (
      <div>
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium">
          {label}
          {requiredAsterisk && <span className="ms-1 text-danger">*</span>}
        </label>
        <div className="relative">
          <select
            {...props}
            ref={ref}
            name={name}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`h-10 w-full appearance-none rounded-full border bg-card pe-10 ps-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 ${error ? 'border-danger' : 'border-muted/60'}`}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <Icon
            name="chevronDown"
            className="pointer-events-none absolute end-4 top-3 size-4 text-primary"
          />
        </div>
        {options.length === 0 && !props.disabled && (
          <p className="mt-1 text-xs text-muted">{t('common.noOptions')}</p>
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
Select.displayName = 'Select';
