import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/shared/ui';

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({
  open,
  onClose,
}: ForgotPasswordModalProps): JSX.Element | null {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent/20 text-accent">
          <Icon name="lock" className="size-6" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-foreground">
          {t('auth.forgotPasswordModal.title')}
        </h3>
        <p className="mb-6 text-xs leading-relaxed text-muted sm:text-sm">
          {t('auth.forgotPasswordModal.description')}
        </p>
        <Button variant="secondary" onClick={onClose} className="w-full rounded-xl">
          {t('auth.forgotPasswordModal.close')}
        </Button>
      </div>
    </div>
  );
}
