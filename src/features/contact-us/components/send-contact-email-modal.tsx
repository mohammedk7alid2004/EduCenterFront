import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import { Button, FeedbackDialog, Icon, Input, Modal } from '@/shared/components';
import { CONTACT_EMAIL_VALIDATION } from '../constants';
import { useSendContactEmail } from '../commands';
import { createContactEmailSchema } from '../schemas';
import type { ContactMessage, SendContactEmailValues } from '../types';

export function SendContactEmailModal({
  contact,
  onClose,
}: {
  contact: ContactMessage;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const mutation = useSendContactEmail();
  const [success, setSuccess] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const emailId = useId();
  const messageId = useId();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const rules = CONTACT_EMAIL_VALIDATION;
  const schema = createContactEmailSchema(t);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<SendContactEmailValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: contact.email ?? '',
      subject: '',
      message: '',
      file: null,
    },
  });

  const selectedFile = watch('file');

  const handleFile = useCallback(
    (file: File | null) => {
      setValue('file', file, { shouldValidate: true });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (file && file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    },
    [setValue, previewUrl],
  );

  const title = t('contactUs.reply.title', { name: contact.name || contact.email });

  if (success) {
    return (
      <FeedbackDialog
        title={title}
        description={t('contactUs.reply.feedback.sent')}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      title={title}
      icon="contactUs"
      size="form"
      onClose={onClose}
      pending={mutation.isPending}
    >
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          if (!online) return;
          mutation.mutate(values, {
            onSuccess: () => setSuccess(true),
            onError: (error) => setServerErrors(error, setError, {}),
          });
        })}
      >
        {(!online || mutation.error) && (
          <p role="alert" className="mb-5 rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {!online
              ? t('errors.network')
              : t(mutation.error?.message ?? 'errors.unknown', {
                  defaultValue: mutation.error?.message,
                })}
          </p>
        )}

        <fieldset disabled={mutation.isPending} className="space-y-5">
          <div>
            <label htmlFor={emailId} className="mb-1.5 block text-xs font-medium text-foreground">
              {t('contactUs.fields.email')} <span className="text-danger">*</span>
            </label>
            <div className="flex items-center gap-2.5">
              <input
                id={emailId}
                type="email"
                readOnly={!editingEmail}
                {...register('email')}
                placeholder={t('contactUs.reply.emailPlaceholder')}
                className={`h-[43px] min-w-0 flex-1 rounded-full border px-4 text-sm outline-none transition placeholder:text-muted ${
                  editingEmail
                    ? 'border-primary bg-card focus:ring-2 focus:ring-primary/15'
                    : 'border-border bg-subtle text-foreground/90'
                } ${errors.email?.message ? 'border-danger' : ''}`}
              />
              <button
                type="button"
                aria-label={t('contactUs.reply.editEmail')}
                title={t('contactUs.reply.editEmail')}
                onClick={() => {
                  const next = !editingEmail;
                  setEditingEmail(next);
                  if (next) setTimeout(() => setFocus('email'), 0);
                }}
                className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
                  editingEmail
                    ? 'bg-primary text-card ring-2 ring-primary/20'
                    : 'bg-primary text-card hover:bg-primary/90'
                }`}
              >
                <Icon name="pencil" className="size-4" />
              </button>
            </div>
            {errors.email?.message && (
              <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          <Input
            {...register('subject')}
            label={t('contactUs.fields.subject')}
            placeholder={t('contactUs.reply.subjectPlaceholder')}
            requiredAsterisk
            error={errors.subject?.message}
            maxLength={rules.subjectMax}
          />

          <div>
            <label htmlFor={messageId} className="mb-1.5 block text-xs font-medium text-foreground">
              {t('contactUs.fields.message')} <span className="text-danger">*</span>
            </label>
            <textarea
              id={messageId}
              {...register('message')}
              rows={4}
              maxLength={rules.messageMax}
              placeholder={t('contactUs.reply.messagePlaceholder')}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition placeholder:text-muted focus:border-primary"
            />
            {errors.message?.message && (
              <p className="mt-1 text-xs text-danger">{errors.message.message}</p>
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-foreground">
              {t('contactUs.reply.uploadFile')}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept={rules.accept}
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
            {selectedFile ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-subtle px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={selectedFile.name}
                      className="size-11 shrink-0 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-iconSurface text-primary">
                      <Icon name="pdfFile" className="size-5" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={t('common.delete')}
                  onClick={() => {
                    handleFile(null);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-danger/10 text-danger transition hover:bg-danger/20"
                >
                  <Icon name="close" className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  const droppedFile = event.dataTransfer.files?.[0] ?? null;
                  if (droppedFile) handleFile(droppedFile);
                }}
                className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-sm text-muted transition hover:border-primary hover:text-primary ${
                  dragging ? 'border-primary bg-primary/5 text-primary' : 'border-border'
                }`}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-iconSurface text-primary">
                  <Icon name="upload" className="size-5" />
                </span>
                <span className="font-medium text-foreground">{t('contactUs.reply.dragDrop')}</span>
                <span className="text-xs">{t('contactUs.reply.dragDropHint')}</span>
              </button>
            )}
            {errors.file?.message && (
              <p className="mt-1 text-xs text-danger">{errors.file.message}</p>
            )}
          </div>
        </fieldset>

        <div className="mt-8 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl border border-primary text-primary"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            {t('common.cancel')}
            <Icon name="close" className="size-4" />
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!online}
            className="rounded-xl px-6"
          >
            {t('contactUs.reply.send')}
            <Icon name="send" className="size-4 rtl:-scale-x-100" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
