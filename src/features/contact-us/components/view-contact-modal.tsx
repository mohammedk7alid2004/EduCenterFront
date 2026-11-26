import { useTranslation } from 'react-i18next';
import { DetailField, ErrorState, LoadingState, Modal } from '@/shared/components';
import { useContact } from '../queries';
import { contactDate } from '../utils';
export function ViewContactModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const query = useContact(id);
  const row = query.data;
  return (
    <Modal title={t('contactUs.viewTitle')} icon="contactUs" onClose={onClose}>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : row ? (
        <dl className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <DetailField label={t('contactUs.fields.name')}>
            {row.name || t('common.noValue')}
          </DetailField>
          <DetailField label={t('contactUs.receivedAt')}>
            {contactDate(row.createdAt, i18n.language) ?? t('common.noValue')}
          </DetailField>
          <DetailField label={t('contactUs.fields.email')}>
            {row.email ? (
              <a className="break-all text-primary hover:underline" href={`mailto:${row.email}`}>
                <bdi>{row.email}</bdi>
              </a>
            ) : (
              t('common.noValue')
            )}
          </DetailField>
          <DetailField label={t('contactUs.fields.phone')}>
            {row.phone || row.phoneNumber ? (
              <a
                className="text-primary hover:underline"
                href={`tel:${(row.phone || row.phoneNumber).replace(/[^+\d]/g, '')}`}
              >
                <bdi>{row.phone || `${row.phoneCountryCode} ${row.phoneNumber}`}</bdi>
              </a>
            ) : (
              t('common.noValue')
            )}
          </DetailField>
          <div className="min-w-0 sm:col-span-2">
            <DetailField label={t('contactUs.fields.subject')}>
              <span className="break-words">{row.subject || t('common.noValue')}</span>
            </DetailField>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <DetailField label={t('contactUs.fields.message')}>
              <p className="whitespace-pre-wrap break-words rounded-2xl bg-subtle p-4 text-sm leading-7">
                {row.message || t('common.noValue')}
              </p>
            </DetailField>
          </div>
        </dl>
      ) : null}
    </Modal>
  );
}
