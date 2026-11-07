import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/ui';

interface LoginSuccessModalProps {
  open: boolean;
}

export function LoginSuccessModal({ open }: LoginSuccessModalProps): JSX.Element | null {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-in fade-in duration-300"
    >
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Success Icon */}
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon name="check" className="size-8 stroke-[3]" />
        </div>

        {/* Heading */}
        <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">
          {t('auth.login.successTitle')}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-muted">{t('auth.login.successMessage')}</p>

        {/* Loading redirect bar */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
          <Icon name="loader" className="size-3.5 animate-spin text-primary" />
          <span>{t('auth.login.redirecting')}</span>
        </div>
      </div>
    </div>
  );
}
