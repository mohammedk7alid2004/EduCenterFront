import { useEffect, useId, useRef, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import type { IconName } from '@/config';
import { Icon } from './icon';

interface ModalProps {
  title: string;
  icon: IconName;
  onClose: () => void;
  pending?: boolean;
  variant?: 'default' | 'feedback' | 'danger';
}

export function Modal({
  title,
  icon,
  onClose,
  pending,
  variant = 'default',
  children,
}: PropsWithChildren<ModalProps>): JSX.Element {
  const { t } = useTranslation();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
      className={`relative m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl bg-card p-6 text-foreground shadow-xl backdrop:bg-overlay/50 ${variant !== 'default' ? 'max-w-[556px] py-7' : 'max-w-[635px]'}`}
    >
      {variant !== 'default' ? (
        <div className="mb-3 flex flex-col items-center gap-5 pt-1 text-center">
          <span
            className={`grid size-20 place-items-center rounded-[22px] ${variant === 'danger' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}
          >
            <Icon name={icon} className="size-10" />
          </span>
          <h2 id={id} className="text-2xl font-medium">
            {title}
          </h2>
          <button
            type="button"
            aria-label={t('common.close')}
            disabled={pending}
            onClick={onClose}
            className="absolute end-4 top-4 text-muted disabled:opacity-50"
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>
      ) : (
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon name={icon} className="size-5" />
            </span>
            <h2 id={id} className="text-xl font-semibold">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label={t('common.close')}
            className="grid size-[34px] place-items-center rounded-xl border border-border text-muted transition hover:bg-subtle disabled:opacity-50"
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>
      )}
      {children}
    </dialog>
  );
}
