import { useTranslation } from 'react-i18next';
import { DetailField, ErrorState, LoadingState, Modal } from '@/shared/components';
import { useNotification } from '../notifications.queries';
import { notificationLocalizedName } from '../notifications.lib';
import { NOTIFICATION_TYPE } from '../notifications.constants';

export function ViewNotificationModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const query = useNotification(id);
  const row = query.data;

  const typeName = (type: number) => {
    const entry = Object.entries(NOTIFICATION_TYPE).find(([, v]) => v === type);
    return entry ? t(`notifications.types.${entry[0]}`) : '';
  };

  return (
    <Modal title={t('notifications.viewTitle')} icon="bell" onClose={onClose}>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : row ? (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <DetailField label={t('notifications.fields.title')}>{row.title}</DetailField>
          <DetailField label={t('notifications.fields.type')}>{typeName(row.type)}</DetailField>
          <DetailField label={t('notifications.fields.group')}>
            {row.groupName || t('common.noValue')}
          </DetailField>
          <DetailField label={t('notifications.fields.level')}>
            {row.levelName
              ? notificationLocalizedName(row.levelName, i18n.language)
              : t('common.noValue')}
          </DetailField>
          <DetailField label={t('notifications.fields.grade')}>
            {row.gradeName
              ? notificationLocalizedName(row.gradeName, i18n.language)
              : t('common.noValue')}
          </DetailField>
          <div className="sm:col-span-2">
            <DetailField label={t('notifications.fields.message')}>
              {row.message || t('common.noValue')}
            </DetailField>
          </div>
          {row.imageUrl && (
            <div className="sm:col-span-2">
              <DetailField label={t('notifications.fields.image')}>
                <img
                  src={row.imageUrl}
                  alt={row.title}
                  className="mt-1 max-h-48 rounded-xl object-contain"
                />
              </DetailField>
            </div>
          )}
        </dl>
      ) : null}
    </Modal>
  );
}
