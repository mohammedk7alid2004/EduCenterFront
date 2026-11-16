import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/shared/ui';
import type { useContactControls } from '../contact-us.controls';
export function ContactFilters({
  state,
}: {
  state: ReturnType<typeof useContactControls>;
}): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="grid items-end gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4">
      <Input
        id="contact-email-filter"
        type="search"
        label={t('contactUs.fields.email')}
        value={state.email}
        onChange={(event) => state.update('email', event.target.value)}
      />
      <Input
        id="contact-phone-filter"
        type="search"
        label={t('contactUs.fields.phone')}
        value={state.phone}
        onChange={(event) => state.update('phone', event.target.value)}
      />
      <Input
        id="contact-subject-filter"
        type="search"
        label={t('contactUs.fields.subject')}
        value={state.subject}
        onChange={(event) => state.update('subject', event.target.value)}
      />
      <Button variant="ghost" onClick={state.clear}>
        {t('common.clearFilters')}
      </Button>
    </div>
  );
}
