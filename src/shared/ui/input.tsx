import { forwardRef, type InputHTMLAttributes } from 'react';
import { Icon } from './icon';
import type { IconName } from '@/config';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  requiredAsterisk?: boolean;
  startIcon?: IconName;
  endIcon?: IconName;
  onEndIconClick?: () => void;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      requiredAsterisk,
      startIcon,
      endIcon,
      onEndIconClick,
      helperText,
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;

    return (
      <div className="w-full text-start">
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-foreground">
            {label}
            {requiredAsterisk && <span className="ms-1 font-semibold text-danger">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="pointer-events-none absolute start-3.5 flex items-center text-muted">
              <Icon name={startIcon} className="size-5" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-2xl border bg-card py-3 text-sm text-foreground transition placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${
              startIcon ? 'ps-11' : 'ps-4'
            } ${endIcon ? 'pe-11' : 'pe-4'} ${
              error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'
            } ${className}`}
            {...props}
          />
          {endIcon && (
            <button
              type="button"
              tabIndex={onEndIconClick ? 0 : -1}
              onClick={onEndIconClick}
              className={`absolute end-3.5 flex items-center text-muted transition hover:text-foreground ${
                onEndIconClick ? 'cursor-pointer' : 'pointer-events-none'
              }`}
            >
              <Icon name={endIcon} className="size-5" />
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-danger">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
