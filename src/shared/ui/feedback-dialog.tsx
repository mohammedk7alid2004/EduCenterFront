import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Modal } from './modal';
export function FeedbackDialog({
  title,
  description,
  onClose,
  destructive = false,
}: {
  title: string;
  description: string;
  onClose: () => void;
  destructive?: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  return (
    <Modal
      title={title}
      icon={destructive ? 'trash' : 'check'}
      onClose={onClose}
      variant={destructive ? 'danger' : 'feedback'}
    >
      <p className="mb-6 text-center text-muted">{description}</p>
      <Button onClick={onClose} className="w-full">
        {t('common.close')}
      </Button>
    </Modal>
  );
}
