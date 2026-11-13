import { useTranslation } from 'react-i18next';
import { Icon } from './icon';
export function RowActions({
  onView,
  onEdit,
  onDelete,
  disabled,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onView}
        aria-label={t('common.view')}
        className="grid size-[38px] place-items-center rounded-lg bg-success/10 text-success transition hover:bg-success/20"
      >
        <Icon name="eye" className="size-5" />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onEdit}
        aria-label={t('common.edit')}
        className="grid size-[38px] place-items-center rounded-lg bg-muted/10 text-muted transition hover:bg-muted/20 disabled:opacity-50"
      >
        <Icon name="pencil" className="size-5" />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        aria-label={t('common.delete')}
        className="grid size-[38px] place-items-center rounded-lg bg-danger/10 text-danger transition hover:bg-danger/20 disabled:opacity-50"
      >
        <Icon name="trash" className="size-5" />
      </button>
    </div>
  );
}
