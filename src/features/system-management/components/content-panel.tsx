import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import { Button, ErrorState, FeedbackDialog, Icon, LoadingState, Modal } from '@/shared/components';
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
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>(
    i18n.language.startsWith('ar') ? 'ar' : 'en',
  );

  if (query.isPending) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const arText = query.data?.description?.ar?.trim() ?? '';
  const enText = query.data?.description?.en?.trim() ?? '';
  const activeText = previewLang === 'ar' ? arText : enText;
  const hasAr = arText.length > 0;
  const hasEn = enText.length > 0;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-subtle/50 p-5 sm:p-6">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon name={tab.icon} className="size-6" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t(`systemManagement.tabs.${tab.key}`)}
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                {t(`systemManagement.subtitles.${tab.key}`, {
                  defaultValue: t('systemManagement.description'),
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switcher */}
            <div
              role="group"
              aria-label={t('systemManagement.contentLanguage')}
              className="inline-flex rounded-xl bg-permissionSurface p-1 text-xs"
            >
              <button
                type="button"
                onClick={() => setPreviewLang('ar')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                  previewLang === 'ar'
                    ? 'bg-card text-primary shadow-xs'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <span className={`size-1.5 rounded-full ${hasAr ? 'bg-success' : 'bg-muted'}`} />
                {t('systemManagement.arabic')}
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                  previewLang === 'en'
                    ? 'bg-card text-primary shadow-xs'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <span className={`size-1.5 rounded-full ${hasEn ? 'bg-success' : 'bg-muted'}`} />
                {t('systemManagement.english')}
              </button>
            </div>

            {can(tab.update) && (
              <Button
                disabled={!online}
                onClick={() => setEditing(true)}
                className="h-9 rounded-xl px-4 text-xs font-medium"
              >
                <Icon name="pencil" className="size-4" />
                {t('systemManagement.update')}
              </Button>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {activeText ? (
            <div
              dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
              className="rounded-xl border border-border/60 bg-subtle/30 p-6"
            >
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground sm:text-base sm:leading-8">
                {activeText}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-permissionSurface text-muted">
                <Icon name="bookOpen" className="size-6" />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">
                {t('systemManagement.emptyPolicy', {
                  lang:
                    previewLang === 'ar'
                      ? t('systemManagement.arabic')
                      : t('systemManagement.english'),
                })}
              </p>
              <p className="mt-1 text-xs text-muted">{t('systemManagement.emptyPolicyAction')}</p>
              {can(tab.update) && (
                <Button
                  variant="ghost"
                  disabled={!online}
                  onClick={() => setEditing(true)}
                  className="mt-4 h-8 rounded-lg border border-border text-xs"
                >
                  <Icon name="pencil" className="size-3.5" />
                  {t('systemManagement.update')}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-subtle/20 px-6 py-3.5 text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${hasAr ? 'bg-success' : 'bg-warning'}`} />
              {t('systemManagement.arabic')}:{' '}
              <strong className={hasAr ? 'text-foreground' : 'text-muted'}>
                {hasAr ? t('systemManagement.available') : t('systemManagement.notAvailable')}
              </strong>
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${hasEn ? 'bg-success' : 'bg-warning'}`} />
              {t('systemManagement.english')}:{' '}
              <strong className={hasEn ? 'text-foreground' : 'text-muted'}>
                {hasEn ? t('systemManagement.available') : t('systemManagement.notAvailable')}
              </strong>
            </span>
          </div>

          {activeText && (
            <span>{t('systemManagement.characters', { count: activeText.length })}</span>
          )}
        </div>
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
