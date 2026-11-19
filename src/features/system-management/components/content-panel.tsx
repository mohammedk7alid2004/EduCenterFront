import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import {
  Button,
  EmptyState,
  ErrorState,
  FeedbackDialog,
  Icon,
  LoadingState,
  Modal,
} from '@/shared/components';
import type { SystemTab } from '../system-management.constants';
import type { ContentDto, ContentValues } from '../system-management.types';
import { useSaveSettings, useSettings } from '../system-management.queries';
import { SettingsForm, TextArea } from './settings-form';
export function ContentPanel({ tab }: { tab: SystemTab }): JSX.Element {
  const { t, i18n } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const query = useSettings<ContentDto>(tab.endpoint);
  const [editing, setEditing] = useState(false);
  if (query.isPending) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  const description = query.data?.description?.[i18n.language.startsWith('ar') ? 'ar' : 'en'];
  return (
    <>
      <div className="rounded-3xl bg-card p-6 shadow-sm">
        <p className="mb-2 text-xs text-muted">{t('systemManagement.descriptionLabel')}</p>
        {description ? (
          <p className="whitespace-pre-wrap break-words text-base leading-7">{description}</p>
        ) : (
          <EmptyState />
        )}
        {can(tab.update) && (
          <div className="mt-8 flex justify-end">
            <Button disabled={!online} onClick={() => setEditing(true)} className="rounded-xl px-5">
              <Icon name="pencil" className="size-5" />
              {t('systemManagement.update')}
            </Button>
          </div>
        )}
      </div>
      {editing && (
        <ContentEditor tab={tab} content={query.data} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
function ContentEditor({
  tab,
  content,
  onClose,
}: {
  tab: SystemTab;
  content?: ContentDto;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const online = useOnline();
  const [language, setLanguage] = useState(i18n.language.startsWith('ar') ? 'ar' : 'en');
  const [success, setSuccess] = useState(false);
  const mutation = useSaveSettings(tab.endpoint);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ContentValues>({
    defaultValues: {
      descriptionAr: content?.description?.ar ?? '',
      descriptionEn: content?.description?.en ?? '',
    },
  });
  const field = language === 'ar' ? 'descriptionAr' : 'descriptionEn';
  const title = t('systemManagement.editTitle', { section: t(`systemManagement.tabs.${tab.key}`) });
  if (success)
    return (
      <FeedbackDialog title={title} description={t('systemManagement.saved')} onClose={onClose} />
    );
  return (
    <Modal title={title} icon={tab.icon} size="form" pending={mutation.isPending} onClose={onClose}>
      <SettingsForm
        pending={mutation.isPending}
        error={mutation.error}
        onClose={onClose}
        onSubmit={handleSubmit((values) => {
          if (online)
            mutation.mutate(values, {
              onSuccess: () => setSuccess(true),
              onError: (error) => setServerErrors(error, setError),
            });
        })}
      >
        <ContentLanguage value={language} onChange={setLanguage} />
        <TextArea
          key={field}
          {...register(field, {
            maxLength: { value: 5000, message: t('validation.maxLength', { count: 5000 }) },
          })}
          id="settings-message"
          label={t('systemManagement.message')}
          rows={10}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          error={errors[field]?.message}
        />
      </SettingsForm>
    </Modal>
  );
}
export function ContentLanguage({
  value,
  onChange,
}: {
  value: string;
  onChange: (language: string) => void;
}): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 text-sm">
      <label htmlFor="content-language">{t('systemManagement.contentLanguage')}</label>
      <select
        id="content-language"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-border bg-card px-4 py-2"
      >
        <option value="ar">{t('systemManagement.arabic')}</option>
        <option value="en">{t('systemManagement.english')}</option>
      </select>
    </div>
  );
}
