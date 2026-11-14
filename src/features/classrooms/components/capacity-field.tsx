import { useTranslation } from 'react-i18next';
import { Icon, Input } from '@/shared/ui';
import { CLASSROOM_CAPACITY } from '../classrooms.constants';
export function CapacityField({
  value,
  onChange,
  onBlur,
  inputRef,
  error,
  disabled,
  required,
}: {
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  inputRef: (instance: HTMLInputElement | null) => void;
  error?: string;
  disabled: boolean;
  required: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  function step(direction: number) {
    onChange(
      Math.max(
        CLASSROOM_CAPACITY.minimum,
        Math.min(
          CLASSROOM_CAPACITY.maximum,
          Number.isFinite(value)
            ? value + direction * CLASSROOM_CAPACITY.step
            : CLASSROOM_CAPACITY.minimum,
        ),
      ),
    );
  }
  return (
    <div>
      <label htmlFor="classroom-capacity" className="mb-2 block text-sm font-medium">
        {t('classrooms.form.capacity')}
        {required && <span className="ms-1 text-danger">*</span>}
      </label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="classroom-capacity"
          type="number"
          min={CLASSROOM_CAPACITY.minimum}
          max={CLASSROOM_CAPACITY.maximum}
          step={CLASSROOM_CAPACITY.step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(event) => onChange(event.target.valueAsNumber)}
          onBlur={onBlur}
          error={error}
          disabled={disabled}
          className="pe-12 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <div className="absolute end-0 top-0 flex h-10 w-8 flex-col overflow-hidden rounded-e-xl border border-muted/60 bg-iconSurface text-primary">
          <button
            type="button"
            aria-label={t('classrooms.form.increaseCapacity')}
            disabled={disabled || value >= CLASSROOM_CAPACITY.maximum}
            onClick={() => step(1)}
            className="grid min-h-0 flex-1 place-items-center border-b border-muted/60 disabled:opacity-50"
          >
            <Icon name="chevronUp" className="size-4" />
          </button>
          <button
            type="button"
            aria-label={t('classrooms.form.decreaseCapacity')}
            disabled={disabled || value <= CLASSROOM_CAPACITY.minimum}
            onClick={() => step(-1)}
            className="grid min-h-0 flex-1 place-items-center disabled:opacity-50"
          >
            <Icon name="chevronDown" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
