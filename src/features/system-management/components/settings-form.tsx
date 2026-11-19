import { forwardRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ApiError } from '@/infrastructure/api';
import { useOnline } from '@/shared/hooks';
import { Button, Icon } from '@/shared/components';
export function SettingsForm({
  children,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  children: ReactNode;
  pending: boolean;
  error: ApiError | null;
  onClose: () => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  return (
    <form noValidate onSubmit={onSubmit}>
      {(!online || error) && (
        <p role="alert" className="mb-5 rounded-xl bg-danger/10 p-3 text-sm text-danger">
          {!online
            ? t('errors.network')
            : t(error?.message ?? 'errors.unknown', { defaultValue: error?.message })}
        </p>
      )}
      <fieldset disabled={pending} className="min-w-0 space-y-6">
        {children}
      </fieldset>
      <div className="mt-10 flex flex-wrap justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={pending}
          className="rounded-xl border border-primary text-primary"
        >
          {t('common.cancel')}
          <Icon name="close" className="size-4" />
        </Button>
        <Button type="submit" loading={pending} disabled={!online} className="rounded-xl px-6">
          {t('common.saveChanges')}
          <Icon name="checkCircle" className="size-5" />
        </Button>
      </div>
    </form>
  );
}
export const TextArea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }
>(function TextArea({ label, id, error, ...props }, ref) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        {...props}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full resize-y rounded-2xl border border-muted/60 bg-card p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
