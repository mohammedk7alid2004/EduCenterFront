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
      <div className="rounded-3xl bg-card p-6 shadow-sm">
        <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
          <DetailField label={t('systemManagement.centerName')}>
            {value(ar ? settings?.centerNameAr : settings?.centerNameEn)}
          </DetailField>
          <DetailField label={t('systemManagement.workingHours')}>
            {value(ar ? settings?.workingHoursAr : settings?.workingHoursEn)}
          </DetailField>
          <DetailField label={t('systemManagement.mainPhoneNumber')}>
            <bdi>{value(settings?.mainPhoneNumber)}</bdi>
          </DetailField>
          <DetailField label={t('systemManagement.location')}>
            {settings?.locations?.length
              ? settings.locations.map((item, index) => (
                  <p key={index}>
                    {value(item.location)}
                    {item.lat !== null && item.long !== null && (
                      <bdi className="ms-2 text-xs text-muted">
                        ({item.lat}, {item.long})
                      </bdi>
                    )}
                  </p>
                ))
              : t('common.noValue')}
          </DetailField>
          <DetailField label={t('systemManagement.otherPhones')}>
            {settings?.othersPhoneNumbers?.length
              ? settings.othersPhoneNumbers.map((phone) => (
                  <bdi key={phone} className="me-2 inline-block">
                    {phone}
                  </bdi>
                ))
              : t('common.noValue')}
          </DetailField>
          {(['invoiceLogoUrl', 'navbarLogoUrl', 'footerLogoUrl'] as const).map((key) => (
            <DetailField key={key} label={t(`systemManagement.${key}`)}>
              {settings?.[key] ? (
                <img
                  src={settings[key]}
                  alt={t(`systemManagement.${key}`)}
                  className="mt-1 h-16 max-w-40 rounded-xl bg-permissionSurface p-3 object-contain"
                />
              ) : (
                t('common.noValue')
              )}
            </DetailField>
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
      {editing && <CenterEditor settings={settings} onClose={() => setEditing(false)} />}
    </>
  );
}
