import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/app/config';
import { useOnline, usePermission } from '@/shared/hooks';
import { Button, Icon } from '@/shared/components';
import { useContactFile } from '../commands';
import { CONTACT_FILE_ACTION, CONTACT_FILE_NAMES } from '../constants';
import { downloadContactFile } from '../utils';
import type { ContactFilters } from '../types';

export function ContactTools({ filters }: { filters: ContactFilters }): JSX.Element | null {
  const { t } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const file = useContactFile();

  if (!can(PERMISSIONS.contactUs.export)) return null;

  return (
    <div className="flex flex-wrap justify-end gap-3">
      <Button
        variant="ghost"
        className="rounded-xl border border-primary/20 bg-card text-primary"
        disabled={!online || file.isPending}
        loading={file.isPending}
        onClick={() =>
          file.mutate(
            { kind: CONTACT_FILE_ACTION.export, filters },
            {
              onSuccess: (blob) => downloadContactFile(blob, CONTACT_FILE_NAMES.export),
              onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
            },
          )
        }
      >
        <Icon name="download" className="size-4" />
        {t('contactUs.export')}
      </Button>
    </div>
  );
}
