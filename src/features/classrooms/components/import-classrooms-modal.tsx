import { useTranslation } from 'react-i18next';
import { ImportExcelModal } from '@/shared/components';
import { useImportClassrooms } from '../commands';

export function ImportClassroomsModal({ onClose }: { onClose: () => void }): JSX.Element {
  const { t } = useTranslation();
  const mutation = useImportClassrooms();

  return (
    <ImportExcelModal
      inputId="classrooms-import-file"
      hint={t('classrooms.importHint')}
      mutation={mutation}
      onClose={onClose}
    />
  );
}
