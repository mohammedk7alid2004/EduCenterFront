import { useTranslation } from 'react-i18next';
export function StatusSwitch({
  active,
  onChange,
  disabled,
}: {
  active: boolean;
  onChange: () => void;
  disabled?: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={t(active ? 'common.deactivate' : 'common.activate')}
      disabled={disabled}
      onClick={onChange}
      className={`inline-flex h-[34px] min-w-[73px] items-center justify-between gap-2 rounded-full border p-1 text-xs transition disabled:opacity-50 ${active ? 'flex-row border-primary bg-primary text-card' : 'flex-row-reverse border-danger bg-card text-danger'}`}
    >
      <span className="px-1">{t(active ? 'common.on' : 'common.off')}</span>
      <span className={`size-[23px] rounded-full ${active ? 'bg-card' : 'bg-danger'}`} />
    </button>
  );
}
