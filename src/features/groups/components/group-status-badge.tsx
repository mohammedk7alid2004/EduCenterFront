import { useTranslation } from 'react-i18next';
import { GROUP_STATUS } from '../groups.constants';

export function GroupStatusBadge({ status }: { status: number }): JSX.Element {
  const { t } = useTranslation();
  const completed = status === GROUP_STATUS.completed;
  const paused = status === GROUP_STATUS.paused;
  const label = completed
    ? t('groups.completed')
    : paused
      ? t('groups.paused')
      : t('groups.active');

  return (
    <span
      className={`inline-flex rounded-lg border px-3 py-0.5 text-xs ${
        completed || paused
          ? 'border-danger bg-danger/10 text-danger'
          : 'border-success bg-success/10 text-success'
      }`}
    >
      {label}
    </span>
  );
}
