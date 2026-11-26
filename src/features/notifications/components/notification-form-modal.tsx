import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import {
  Button,
  ErrorState,
  FeedbackDialog,
  Icon,
  Input,
  LoadingState,
  Modal,
  Select,
} from '@/shared/components';
import { NOTIFICATION_TYPE, NOTIFICATION_VALIDATION } from '../notifications.constants';
import { notificationLocalizedName } from '../notifications.lib';
import {
  useNotification,
  useCreateNotification,
  useUpdateNotification,
  useNotificationGroups,
  useNotificationLevels,
  useNotificationGrades,
} from '../notifications.queries';
import type { NotificationDto, NotificationValues } from '../notifications.types';

export function NotificationFormModal({
  notification,
  onClose,
}: {
  notification: NotificationDto | null;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const query = useNotification(notification?.id);
  if (notification && (query.isPending || query.error))
    return (
      <Modal title={t('notifications.form.editTitle')} icon="bell" size="form" onClose={onClose}>
        {query.isPending ? (
          <LoadingState />
        ) : (
          <ErrorState error={query.error!} onRetry={() => void query.refetch()} />
        )}
      </Modal>
    );
  return (
    <NotificationForm notification={notification ? query.data : undefined} onClose={onClose} />
  );
}

function NotificationForm({
  notification,
  onClose,
}: {
  notification?: NotificationDto;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const online = useOnline();
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const messageId = useId();

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const preview = removeImage ? null : (objectUrl ?? notification?.imageUrl ?? null);

  const rules = NOTIFICATION_VALIDATION;
  const required = t('validation.required');

  const schema = z.object({
    title: z.string().trim().min(1, required).max(rules.titleMax),
    type: z.coerce.number().refine((v) => v > 0, { message: required }),
    groupId: z.string().optional().default(''),
    levelId: z.string().optional().default(''),
    gradeId: z.string().optional().default(''),
    message: z.string().trim().min(1, required).max(rules.messageMax),
    image: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(
        (file) => !file || (rules.acceptedImageTypes as readonly string[]).includes(file.type),
        t('notifications.validation.imageType'),
      )
      .refine(
        (file) => !file || file.size <= rules.maxImageSizeMb * 1024 * 1024,
        t('notifications.validation.imageSize', { max: rules.maxImageSizeMb }),
      ),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<NotificationValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: notification?.title ?? '',
      type: notification?.type ?? 0,
      groupId: notification?.groupId ?? '',
      levelId: notification?.levelId ?? '',
      gradeId: notification?.gradeId ?? '',
      message: notification?.message ?? '',
      image: null,
    },
  });

  const groupId = watch('groupId');
  const levelId = watch('levelId');

  const groups = useNotificationGroups();
  const levels = useNotificationLevels();
  const grades = useNotificationGrades(levelId || undefined);

  const selectedGroup = groupId ? groups.data?.find((g) => g.id === groupId) : undefined;
  const hasGroup = Boolean(groupId);

  useEffect(() => {
    if (!groupId || !selectedGroup) return;
    setValue('levelId', selectedGroup.levelId ?? '', { shouldValidate: false });
    setValue('gradeId', selectedGroup.gradeId ?? '', { shouldValidate: false });
  }, [groupId, selectedGroup, levels.data, grades.data, setValue]);

  const createMutation = useCreateNotification();
  const updateMutation = useUpdateNotification(notification?.id ?? '');
  const mutation = notification ? updateMutation : createMutation;

  const handleFile = useCallback(
    (file: File | null) => {
      setValue('image', file, { shouldValidate: true });
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (file) {
        setObjectUrl(URL.createObjectURL(file));
        setRemoveImage(false);
      } else {
        setObjectUrl(null);
      }
    },
    [setValue, objectUrl],
  );

  const title = t(notification ? 'notifications.form.editTitle' : 'notifications.form.createTitle');
  const optionError = groups.error ?? levels.error ?? (levelId ? grades.error : null);

  if (success)
    return (
      <FeedbackDialog
        title={title}
        description={t(
          notification ? 'notifications.feedback.updated' : 'notifications.feedback.created',
        )}
        onClose={onClose}
      />
    );

  return (
    <Modal title={title} icon="bell" size="form" onClose={onClose} pending={mutation.isPending}>
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          if (online && !optionError)
            mutation.mutate(
              {
                ...values,
                levelId: selectedGroup?.levelId ?? values.levelId,
                gradeId: selectedGroup?.gradeId ?? values.gradeId,
                removeImage: removeImage && !values.image,
              },
              {
                onSuccess: () => setSuccess(true),
                onError: (error) => setServerErrors(error, setError, {}),
              },
            );
        })}
      >
        {optionError && (
          <div className="mb-5">
            <ErrorState
              error={optionError}
              onRetry={() => {
                void groups.refetch();
                void levels.refetch();
                if (levelId) void grades.refetch();
              }}
            />
          </div>
        )}
        {(!online || mutation.error) && (
          <p role="alert" className="mb-5 rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {!online
              ? t('errors.network')
              : t(mutation.error?.message ?? 'errors.unknown', {
                  defaultValue: mutation.error?.message,
                })}
          </p>
        )}
        <fieldset
          disabled={mutation.isPending}
          className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2"
        >
          <Input
            {...register('title')}
            label={t('notifications.fields.title')}
            placeholder={t('notifications.form.titlePlaceholder')}
            requiredAsterisk
            error={errors.title?.message}
            maxLength={rules.titleMax}
          />
          <Select
            {...register('type')}
            label={t('notifications.fields.type')}
            requiredAsterisk
            error={errors.type?.message}
            options={Object.entries(NOTIFICATION_TYPE).map(([key, value]) => ({
              id: String(value),
              name: t(`notifications.types.${key}`),
            }))}
            placeholder={t('notifications.form.typePlaceholder')}
          />
          <div className="sm:col-span-2">
            <Select
              {...register('groupId', {
                onChange: (event) => {
                  const nextId = event.target.value;
                  const match = groups.data?.find((g) => g.id === nextId);
                  setValue('levelId', nextId && match?.levelId ? match.levelId : '', {
                    shouldValidate: false,
                  });
                  setValue('gradeId', nextId && match?.gradeId ? match.gradeId : '', {
                    shouldValidate: false,
                  });
                },
              })}
              label={t('notifications.fields.group')}
              error={errors.groupId?.message}
              options={(groups.data ?? []).map((g) => ({ id: g.id, name: g.name }))}
              placeholder={t(
                groups.isPending ? 'common.loading' : 'notifications.form.groupPlaceholder',
              )}
              disabled={groups.isPending || Boolean(groups.error)}
            />
          </div>
          <Select
            {...register('levelId', {
              onChange: () => setValue('gradeId', '', { shouldValidate: false }),
            })}
            label={t('notifications.fields.level')}
            error={errors.levelId?.message}
            options={(levels.data ?? []).map((l) => ({
              id: l.id,
              name: notificationLocalizedName(l.name, i18n.language),
            }))}
            placeholder={t(
              levels.isPending ? 'common.loading' : 'notifications.form.levelPlaceholder',
            )}
            disabled={hasGroup || levels.isPending || Boolean(levels.error)}
          />
          <Select
            {...register('gradeId')}
            label={t('notifications.fields.grade')}
            error={errors.gradeId?.message}
            options={(grades.data ?? []).map((g) => ({
              id: g.id,
              name: notificationLocalizedName(g.name, i18n.language),
            }))}
            placeholder={t(
              !levelId
                ? 'notifications.form.selectLevelFirst'
                : grades.isPending
                  ? 'common.loading'
                  : 'notifications.form.gradePlaceholder',
            )}
            disabled={hasGroup || !levelId || grades.isPending || Boolean(grades.error)}
          />
          <div className="sm:col-span-2">
            <label htmlFor={messageId} className="mb-1 block text-sm font-medium text-foreground">
              {t('notifications.fields.message')} <span className="text-danger">*</span>
            </label>
            <textarea
              id={messageId}
              {...register('message')}
              rows={4}
              maxLength={rules.messageMax}
              placeholder={t('notifications.form.messagePlaceholder')}
              className="w-full rounded-xl border border-muted/60 bg-card px-4 py-3 text-sm outline-none transition placeholder:text-muted focus:border-primary"
            />
            {errors.message?.message && (
              <p className="mt-1 text-xs text-danger">{errors.message.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-foreground">
              {t('notifications.form.uploadFile')}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept={rules.acceptedImageTypes.join(',')}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt={t('notifications.fields.image')}
                  className="max-h-32 rounded-xl border border-border object-contain"
                />
                <button
                  type="button"
                  aria-label={t('common.delete')}
                  onClick={() => {
                    handleFile(null);
                    setRemoveImage(true);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full bg-danger text-card shadow"
                >
                  <Icon name="close" className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const droppedFile = e.dataTransfer.files?.[0] ?? null;
                  if (droppedFile) handleFile(droppedFile);
                }}
                className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-sm text-muted transition hover:border-primary hover:text-primary ${
                  dragging ? 'border-primary bg-primary/5 text-primary' : 'border-muted/40'
                }`}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-iconSurface text-primary">
                  <Icon name="upload" className="size-5" />
                </span>
                <span className="font-medium text-foreground">
                  {t('notifications.form.dragDrop')}
                </span>
                <span className="text-xs">{t('notifications.form.dragDropHint')}</span>
              </button>
            )}
            {errors.image?.message && (
              <p className="mt-1 text-xs text-danger">{errors.image.message}</p>
            )}
          </div>
        </fieldset>
        <div className="mt-10 flex justify-end gap-4">
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
            disabled={!online || Boolean(optionError)}
            className="rounded-xl px-6"
          >
            {t(notification ? 'common.saveChanges' : 'notifications.form.send')}
            <Icon name="checkCircle" className="size-5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
