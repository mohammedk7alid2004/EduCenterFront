import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/shared/components';
import { TIME_PICKER } from '../appointments.constants';

export function AppointmentTimePicker({
  label,
  value,
  onApply,
  onClose,
}: {
  label: string;
  value: string;
  onApply: (value: string) => void;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const dial = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [initialHour, initialMinute] = value.split(':').map(Number);
  const [hour, setHour] = useState(initialHour % TIME_PICKER.hours || TIME_PICKER.hours);
  const [minute, setMinute] = useState(initialMinute);
  const [period, setPeriod] = useState<string>(
    initialHour >= TIME_PICKER.hours ? TIME_PICKER.periods.pm : TIME_PICKER.periods.am,
  );
  const [mode, setMode] = useState<string>(TIME_PICKER.modes.hour);
  const isHour = mode === TIME_PICKER.modes.hour;
  const number = new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 });
  const selected = isHour ? hour : minute;
  const rotation = (selected / (isHour ? TIME_PICKER.hours : TIME_PICKER.minutes)) * 360;
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  const select = (next: number) => {
    if (isHour) {
      setHour(next);
      setMode(TIME_PICKER.modes.minute);
    } else setMinute(next);
  };
  const pickPoint = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = dial.current?.getBoundingClientRect();
    if (!bounds) return;
    const angle =
      ((Math.atan2(
        event.clientX - bounds.x - bounds.width / 2,
        -(event.clientY - bounds.y - bounds.height / 2),
      ) *
        180) /
        Math.PI +
        360) %
      360;
    const divisions = isHour ? TIME_PICKER.hours : TIME_PICKER.minutes;
    const next = Math.round((angle / 360) * divisions) % divisions;
    if (isHour) setHour(next || TIME_PICKER.hours);
    else setMinute(next);
  };
  return (
    <dialog
      ref={dialog}
      aria-labelledby={id}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[500px] overflow-y-auto rounded-2xl bg-card p-5 text-foreground shadow-xl backdrop:bg-overlay/30"
    >
      <h2 id={id} className="mb-4 text-sm font-medium">
        {t('appointments.timePicker.select', { label })}
      </h2>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
        <div dir="ltr" className="flex items-center gap-2">
          <div>
            <label htmlFor={`${id}-hour`} className="sr-only">
              {t('appointments.timePicker.hour')}
            </label>
            <input
              id={`${id}-hour`}
              type="number"
              min={1}
              max={TIME_PICKER.hours}
              value={hour}
              onFocus={() => setMode(TIME_PICKER.modes.hour)}
              onChange={(event) => {
                const next = event.target.valueAsNumber;
                if (Number.isFinite(next)) setHour(Math.max(1, Math.min(TIME_PICKER.hours, next)));
              }}
              className={`h-16 w-16 rounded-lg border-0 text-center text-3xl text-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${isHour ? 'bg-primary/15 ring-2 ring-primary/20' : 'bg-iconSurface'}`}
            />
          </div>
          <span className="text-3xl text-primary" aria-hidden="true">
            :
          </span>
          <div>
            <label htmlFor={`${id}-minute`} className="sr-only">
              {t('appointments.timePicker.minute')}
            </label>
            <input
              id={`${id}-minute`}
              type="number"
              min={0}
              max={TIME_PICKER.minutes - 1}
              value={String(minute).padStart(2, '0')}
              onFocus={() => setMode(TIME_PICKER.modes.minute)}
              onChange={(event) => {
                const next = event.target.valueAsNumber;
                if (Number.isFinite(next))
                  setMinute(Math.max(0, Math.min(TIME_PICKER.minutes - 1, next)));
              }}
              className={`h-16 w-16 rounded-lg border-0 text-center text-3xl text-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${!isHour ? 'bg-primary/15 ring-2 ring-primary/20' : 'bg-iconSurface'}`}
            />
          </div>
          <div
            role="group"
            aria-label={t('appointments.timePicker.period')}
            className="flex flex-col gap-1"
          >
            {Object.values(TIME_PICKER.periods).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={period === item}
                onClick={() => setPeriod(item)}
                className={`rounded px-2 py-1.5 text-xs ${period === item ? 'bg-primary text-card' : 'bg-iconSurface text-primary'}`}
              >
                {t(`appointments.timePicker.${item}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <p role="status" className="text-center text-xs text-tableHeading">
            {t(
              isHour
                ? 'appointments.timePicker.chooseHour'
                : 'appointments.timePicker.chooseMinute',
            )}
          </p>
          <div
            ref={dial}
            role="group"
            aria-label={t(
              isHour ? 'appointments.timePicker.hourDial' : 'appointments.timePicker.minuteDial',
            )}
            dir="ltr"
            className="relative touch-none select-none rounded-full bg-iconSurface"
            style={{ width: TIME_PICKER.dialSize, height: TIME_PICKER.dialSize }}
            onPointerDown={(event) => {
              event.preventDefault();
              dragging.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              pickPoint(event);
            }}
            onPointerMove={(event) => {
              if (dragging.current) pickPoint(event);
            }}
            onPointerUp={(event) => {
              if (!dragging.current) return;
              dragging.current = false;
              pickPoint(event);
              if (isHour) setMode(TIME_PICKER.modes.minute);
            }}
            onPointerCancel={() => {
              dragging.current = false;
            }}
          >
            <div
              className="pointer-events-none absolute start-1/2 top-1/2 h-0.5 [transform-origin:0_50%] bg-primary"
              style={{ width: TIME_PICKER.dialRadius, transform: `rotate(${rotation - 90}deg)` }}
            />
            <span className="pointer-events-none absolute start-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
            {Array.from({ length: TIME_PICKER.hours }, (_, index) =>
              isHour ? index + 1 : index * TIME_PICKER.minuteStep,
            ).map((item) => {
              const angle =
                (item / (isHour ? TIME_PICKER.hours : TIME_PICKER.minutes)) * Math.PI * 2;
              return (
                <button
                  type="button"
                  key={item}
                  aria-label={t(
                    isHour
                      ? 'appointments.timePicker.hourValue'
                      : 'appointments.timePicker.minuteValue',
                    { count: item },
                  )}
                  aria-pressed={selected === item}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => select(item)}
                  className={`absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${selected === item ? 'bg-primary text-card' : 'text-foreground hover:bg-primary/10'}`}
                  style={{
                    insetInlineStart:
                      TIME_PICKER.dialSize / 2 + Math.sin(angle) * TIME_PICKER.dialRadius,
                    top: TIME_PICKER.dialSize / 2 - Math.cos(angle) * TIME_PICKER.dialRadius,
                  }}
                >
                  {isHour ? item : number.format(item)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="rounded-full border border-primary text-primary"
        >
          {t('common.cancel')}
          <Icon name="close" className="size-3" />
        </Button>
        <Button
          type="button"
          className="rounded-full"
          onClick={() =>
            onApply(
              `${String((hour % TIME_PICKER.hours) + (period === TIME_PICKER.periods.pm ? TIME_PICKER.hours : 0)).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
            )
          }
        >
          {t('appointments.timePicker.apply')}
          <Icon name="check" className="size-3" />
        </Button>
      </div>
    </dialog>
  );
}
