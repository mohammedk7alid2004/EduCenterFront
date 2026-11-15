import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePermission } from '@/core/auth';
import { setServerErrors, useOnline } from '@/shared/lib';
import {
  Button,
  DetailField,
  ErrorState,
  FeedbackDialog,
  Icon,
  Input,
  LoadingState,
  Modal,
} from '@/shared/ui';
import { SOCIAL_ICONS, SOCIAL_PLATFORMS, type SystemTab } from '../system-management.constants';
import type { SocialLink, SocialSettings } from '../system-management.types';
import { useSaveSettings, useSettings } from '../system-management.queries';
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
      <div className="rounded-3xl bg-card p-6 shadow-sm">
        <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {links.map((link) => (
            <div key={link.platformName} className="flex min-w-0 items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-permissionSurface text-primary">
                <Icon name={SOCIAL_ICONS[link.platformName] ?? 'link'} className="size-6" />
              </span>
              <DetailField
                label={t(`systemManagement.platforms.${link.platformName}`, {
                  defaultValue: link.platformName,
                })}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <bdi className="break-all">{link.url || t('common.noValue')}</bdi>
                  {link.url && (
                    <button
                      type="button"
                      onClick={() => void copy(link.url)}
                      aria-label={t('systemManagement.copy', { name: link.platformName })}
                      className="grid size-8 shrink-0 place-items-center rounded-lg bg-permissionSurface text-primary"
                    >
                      <Icon name="copy" className="size-4" />
                    </button>
                  )}
                </span>
              </DetailField>
            </div>
          ))}
        </dl>
        {can(tab.update) && (
          <div className="mt-8 flex justify-end">
            <Button disabled={!online} onClick={() => setEditing(true)} className="rounded-xl">
              <Icon name="pencil" className="size-5" />
              {t('systemManagement.update')}
            </Button>
          </div>
        )}
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
