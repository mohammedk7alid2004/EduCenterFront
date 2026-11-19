import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermission } from '@/infrastructure/auth';
import { useOnline } from '@/shared/hooks';
import { Button, DetailField, ErrorState, Icon, LoadingState } from '@/shared/components';
import type { SystemTab } from '../system-management.constants';
import type { CenterSettings } from '../system-management.types';
import { useSettings } from '../system-management.queries';
import { CenterEditor } from './center-editor';
export function CenterPanel({ tab }: { tab: SystemTab }): JSX.Element {
  const { t, i18n } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const query = useSettings<CenterSettings>(tab.endpoint);
  const [editing, setEditing] = useState(false);

  if (query.isPending) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const settings = query.data;
  const ar = i18n.language.startsWith('ar');
  const value = (text?: string | null) => text || t('common.noValue');

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Main Card */}
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

          <div className="grid gap-6 p-6 md:grid-cols-2">
            {/* 1. Basic Info */}
            <div className="rounded-xl border border-border/70 bg-subtle/30 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon name="building" className="size-4 text-primary" />
                {t('systemManagement.identitySection')}
              </h3>
              <dl className="grid gap-4">
                <DetailField label={t('systemManagement.centerName')}>
                  <span className="font-medium text-foreground">
                    {value(ar ? settings?.centerNameAr : settings?.centerNameEn)}
                  </span>
                  {(settings?.centerNameAr || settings?.centerNameEn) && (
                    <span className="ms-2 text-xs text-muted">
                      ({ar ? settings?.centerNameEn : settings?.centerNameAr})
                    </span>
                  )}
                </DetailField>
                <DetailField label={t('systemManagement.workingHours')}>
                  <span>{value(ar ? settings?.workingHoursAr : settings?.workingHoursEn)}</span>
                </DetailField>
              </dl>
            </div>

            {/* 2. Contact Phone Numbers */}
            <div className="rounded-xl border border-border/70 bg-subtle/30 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon name="phone" className="size-4 text-primary" />
                {t('systemManagement.phonesSection')}
              </h3>
              <dl className="grid gap-4">
                <DetailField label={t('systemManagement.mainPhoneNumber')}>
                  {settings?.mainPhoneNumber ? (
                    <a
                      href={`tel:${settings.mainPhoneNumber}`}
                      className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                    >
                      <bdi>{settings.mainPhoneNumber}</bdi>
                    </a>
                  ) : (
                    <span>{t('common.noValue')}</span>
                  )}
                </DetailField>
                <DetailField label={t('systemManagement.otherPhones')}>
                  {settings?.othersPhoneNumbers?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {settings.othersPhoneNumbers.map((phone) => (
                        <span
                          key={phone}
                          className="inline-flex items-center rounded-lg bg-card border border-border px-2.5 py-1 text-xs"
                        >
                          <bdi>{phone}</bdi>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span>{t('common.noValue')}</span>
                  )}
                </DetailField>
              </dl>
            </div>

            {/* 3. Locations */}
            <div className="rounded-xl border border-border/70 bg-subtle/30 p-5 md:col-span-2">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon name="mapPin" className="size-4 text-primary" />
                {t('systemManagement.locationsSection')}
              </h3>
              {settings?.locations?.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {settings.locations.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border border-border/80 bg-card p-3.5 shadow-2xs"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon name="mapPin" className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{item.location}</p>
                        {item.lat !== null && item.long !== null && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                            <bdi>
                              ({item.lat}, {item.long})
                            </bdi>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">{t('common.noValue')}</p>
              )}
            </div>

            {/* 4. Logos */}
            <div className="rounded-xl border border-border/70 bg-subtle/30 p-5 md:col-span-2">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon name="imageFile" className="size-4 text-primary" />
                {t('systemManagement.logosSection')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {(['invoiceLogoUrl', 'navbarLogoUrl', 'footerLogoUrl'] as const).map((key) => (
                  <div
                    key={key}
                    className="flex flex-col items-center justify-between rounded-xl border border-border/80 bg-card p-4 text-center"
                  >
                    <span className="mb-3 text-xs font-medium text-muted">
                      {t(`systemManagement.${key}`)}
                    </span>
                    <div className="flex h-20 w-full items-center justify-center rounded-lg bg-subtle/60 p-2">
                      {settings?.[key] ? (
                        <img
                          src={settings[key]}
                          alt={t(`systemManagement.${key}`)}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-muted">{t('common.noValue')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {editing && <CenterEditor settings={settings} onClose={() => setEditing(false)} />}
    </>
  );
}
