import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/core/auth';
import { useOnline } from '@/shared/lib';
import { Button, Icon } from '@/shared/ui';
import { useContactFile } from '../contact-us.queries';
import { CONTACT_FILE_ACTION, CONTACT_FILE_NAMES } from '../contact-us.constants';
import { downloadContactFile } from '../contact-us.lib';
import type { ContactFilters } from '../contact-us.types';
export function ContactTools({
  filters,
  onImport,
}: {
  filters: ContactFilters;
  onImport: () => void;
}): JSX.Element | null {
  const { t } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const file = useContactFile();
  const actions = Object.values(CONTACT_FILE_ACTION).filter((kind) =>
    can(PERMISSIONS.contactUs[kind]),
  );
  if (!actions.length && !can(PERMISSIONS.contactUs.import)) return null;
  return (
    <div className="flex flex-wrap justify-end gap-3">
      {actions.map((kind) => (
        <Button
          key={kind}
          variant="ghost"
          className="rounded-xl border border-primary/20 bg-card text-primary"
          disabled={!online || file.isPending}
          loading={file.isPending && file.variables?.kind === kind}
          onClick={() =>
            file.mutate(
              { kind, filters },
              {
                onSuccess: (blob) => downloadContactFile(blob, CONTACT_FILE_NAMES[kind]),
                onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
              },
            )
          }
        >
          <Icon name="download" className="size-4" />
          {t(`contactUs.${kind}`)}
        </Button>
      ))}
      {can(PERMISSIONS.contactUs.import) && (
        <Button className="rounded-xl" onClick={onImport} disabled={!online}>
          <Icon name="upload" className="size-4" />
          {t('contactUs.import')}
        </Button>
      )}
    </div>
  );
}
