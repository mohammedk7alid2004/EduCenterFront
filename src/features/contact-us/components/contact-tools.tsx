import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/app/config';
import { usePermission } from '@/shared/hooks';
import { useOnline } from '@/shared/hooks';
import { Button, Icon } from '@/shared/components';
import { useContactFile } from '../commands';
import { CONTACT_FILE_ACTION, CONTACT_FILE_NAMES } from '../constants';
import { downloadContactFile } from '../utils';
import type { ContactFilters } from '../types';
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
