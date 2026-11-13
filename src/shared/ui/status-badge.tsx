import { useTranslation } from 'react-i18next';

export function StatusBadge({ active }: { active: boolean }): JSX.Element {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex rounded-lg border px-3 py-0.5 text-xs ${active ? 'border-success bg-success/10 text-success' : 'border-muted/40 bg-muted/10 text-muted'}`}
    >
      {t(active ? 'common.active' : 'common.inactive')}
    </span>
  );
}
