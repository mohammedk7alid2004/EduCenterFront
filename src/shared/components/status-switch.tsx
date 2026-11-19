import { useTranslation } from 'react-i18next';
export function StatusSwitch({
  active,
  onChange,
  disabled,
  label,
  readOnly,
  compact = false,
}: {
  active: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
  readOnly?: boolean;
  compact?: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label ?? t(active ? 'common.deactivate' : 'common.activate')}
      disabled={disabled}
      aria-readonly={readOnly || undefined}
      onClick={() => {
        if (!readOnly) onChange();
      }}
      className={`inline-flex ${compact ? 'h-[26px] min-w-[60px] p-[3px]' : 'h-[34px] min-w-[73px] p-1'} items-center justify-between gap-2 rounded-full border text-xs transition disabled:opacity-50 ${active ? 'flex-row border-primary bg-primary text-card' : 'flex-row-reverse border-danger bg-card text-danger'}`}
    >
      <span className="px-1">{t(active ? 'common.on' : 'common.off')}</span>
      <span
        className={`${compact ? 'size-[18px]' : 'size-[23px]'} rounded-full ${active ? 'bg-card' : 'bg-danger'}`}
      />
    </button>
  );
}
