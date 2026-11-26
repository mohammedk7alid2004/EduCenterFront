import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePermission } from '@/shared/hooks';
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
} from '@/shared/components';
import { SOCIAL_ICONS, SOCIAL_PLATFORMS, type SystemTab } from '../constants';
import type { SocialLink, SocialSettings } from '../types';
import { useSettings } from '../queries';
import { useSaveSettings } from '../commands';
import { SettingsForm } from './settings-form';
export function SocialPanel({ tab }: { tab: SystemTab }): JSX.Element {
  const { t } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const query = useSettings<SocialSettings>(tab.endpoint);
  const [editing, setEditing] = useState(false);

  if (query.isPending) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const links = socialLinks(query.data?.links ?? []);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t('systemManagement.copied'));
    } catch {
      toast.error(t('systemManagement.copyFailed'));
    }
  }

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

        {/* Links Grid */}
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {links.map((link) => {
            const hasUrl = Boolean(link.url?.trim());
            const isEmail = link.platformName.toLowerCase().endsWith('email');
            const href = hasUrl ? (isEmail ? `mailto:${link.url}` : link.url) : undefined;

            return (
              <div
                key={link.platformName}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-subtle/30 p-4 transition hover:border-primary/40 hover:bg-subtle/50"
              >
                <div className="flex min-w-0 items-start gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={SOCIAL_ICONS[link.platformName] ?? 'link'} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {t(`systemManagement.platforms.${link.platformName}`, {
                          defaultValue: link.platformName,
                        })}
                      </p>
                      <span
                        className={`size-1.5 rounded-full ${hasUrl ? 'bg-success' : 'bg-muted'}`}
                      />
                    </div>
                    {hasUrl ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block truncate text-xs text-primary hover:underline"
                        dir="ltr"
                      >
                        {link.url}
                      </a>
                    ) : (
                      <p className="mt-1 text-xs text-muted">
                        {t('systemManagement.notAvailable')}
                      </p>
                    )}
                  </div>
                </div>

                {hasUrl && (
                  <button
                    type="button"
                    onClick={() => void copy(link.url)}
                    aria-label={t('systemManagement.copy', { name: link.platformName })}
                    title={t('systemManagement.copy', { name: link.platformName })}
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-border/80 bg-card text-muted transition hover:border-primary/50 hover:text-primary"
                  >
                    <Icon name="copy" className="size-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {editing && <SocialEditor links={links} tab={tab} onClose={() => setEditing(false)} />}
    </>
  );
}
function socialLinks(links: SocialLink[]): SocialLink[] {
  const known = SOCIAL_PLATFORMS.map((platformName) => ({
    platformName:
      links.find(
        (link) =>
          link.platformName.toLowerCase().replace(/\s/g, '') ===
          platformName.toLowerCase().replace(/\s/g, ''),
      )?.platformName ?? platformName,
    url:
      links.find(
        (link) =>
          link.platformName.toLowerCase().replace(/\s/g, '') ===
          platformName.toLowerCase().replace(/\s/g, ''),
      )?.url ?? '',
  }));
  return [
    ...known,
    ...links.filter(
      (link) =>
        !known.some(
          (item) =>
            item.platformName.toLowerCase().replace(/\s/g, '') ===
            link.platformName.toLowerCase().replace(/\s/g, ''),
        ),
    ),
  ];
}
function SocialEditor({
  links,
  tab,
  onClose,
}: {
  links: SocialLink[];
  tab: SystemTab;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const mutation = useSaveSettings(tab.endpoint);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ links: SocialLink[] }>({ defaultValues: { links } });
  const title = t('systemManagement.editTitle', { section: t('systemManagement.tabs.social') });
  if (success)
    return (
      <FeedbackDialog title={title} description={t('systemManagement.saved')} onClose={onClose} />
    );
  return (
    <Modal title={title} icon="link" size="form" pending={mutation.isPending} onClose={onClose}>
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
        <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
          {links.map((link, index) => (
            <Input
              startIcon={SOCIAL_ICONS[link.platformName] ?? 'link'}
              key={link.platformName}
              label={t(`systemManagement.platforms.${link.platformName}`, {
                defaultValue: link.platformName,
              })}
              dir="ltr"
              {...register(`links.${index}.url`, {
                validate: (value) => {
                  if (!value) return true;
                  if (link.platformName.toLowerCase().endsWith('email'))
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || t('validation.email');
                  try {
                    const url = new URL(value);
                    return (
                      ['https:', 'http:'].includes(url.protocol) || t('systemManagement.invalidUrl')
                    );
                  } catch {
                    return t('systemManagement.invalidUrl');
                  }
                },
              })}
              error={errors.links?.[index]?.url?.message}
            />
          ))}
        </div>
      </SettingsForm>
    </Modal>
  );
}
