import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/infrastructure/api';
import { useOnline } from '@/shared/hooks';
import { Button } from './button';
import { Modal } from './modal';
import { FeedbackDialog } from './feedback-dialog';
export interface ConfirmOptions {
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  successTitle?: string;
  successDescription?: string;
}
export function useConfirm(): {
  confirm: (options: ConfirmOptions) => void;
  dialog: JSX.Element | null;
} {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();
  const online = useOnline();
  function close() {
    setOptions(null);
    setError(null);
    setSuccess(false);
  }
  async function submit() {
    if (!options || !online) return;
    setPending(true);
    setError(null);
    try {
      await options.onConfirm();
      if (options.successTitle) setSuccess(true);
      else close();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'errors.unknown');
    } finally {
      setPending(false);
    }
  }
  return {
    confirm: (value) => {
      setError(null);
      setSuccess(false);
      setOptions(value);
    },
    dialog: options ? (
      success ? (
        <FeedbackDialog
          title={options.successTitle ?? options.title}
          description={options.successDescription ?? ''}
          onClose={close}
        />
      ) : (
        <Modal
          title={options.title}
          icon="trash"
          onClose={close}
          pending={pending}
          variant="danger"
        >
          {options.description && (
            <p className="mb-7 text-center text-muted">{options.description}</p>
          )}
          {(!online || error) && (
            <p role="alert" className="mb-4 text-sm text-danger">
              {t(!online ? 'errors.network' : (error ?? 'errors.unknown'), {
                defaultValue: error ?? undefined,
              })}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="ghost"
              className="border border-danger text-danger"
              onClick={close}
              disabled={pending}
            >
              {t('common.no')}
            </Button>
            <Button
              variant="danger"
              loading={pending}
              disabled={!online}
              onClick={() => void submit()}
            >
              {t('common.yes')}
            </Button>
          </div>
        </Modal>
      )
    ) : null,
  };
}
