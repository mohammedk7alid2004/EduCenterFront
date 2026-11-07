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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 transition-all duration-300"
    >
      <div className="w-full max-w-sm rounded-[32px] border border-white/20 bg-white p-8 text-center shadow-2xl animate-card-entrance">
        {/* Animated Checkmark Circle */}
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-lg shadow-emerald-500/20 animate-checkmark-pop">
          <Icon name="check" className="size-8 stroke-[3]" />
        </div>

        {/* Heading */}
        <h3 className="mb-2 text-xl font-bold tracking-tight text-[#1E293B]">
          {t('auth.login.successTitle')}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-[#64748B]">{t('auth.login.successMessage')}</p>

        {/* Loading redirect indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-[#0F3D3A]">
          <Icon name="loader" className="size-3.5 animate-spin" />
          <span>{t('auth.login.redirecting')}</span>
        </div>
      </div>
    </div>
  );
}
