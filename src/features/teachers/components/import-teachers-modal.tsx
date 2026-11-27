import { useTranslation } from 'react-i18next';
import { ImportExcelModal } from '@/shared/components';
import { useImportTeachers } from '../commands';

export function ImportTeachersModal({ onClose }: { onClose: () => void }): JSX.Element {
  const { t } = useTranslation();
  const mutation = useImportTeachers();

  return (
    <ImportExcelModal
      inputId="teachers-import-file"
      hint={t('teachers.importHint')}
      mutation={mutation}
      onClose={onClose}
    />
  );
}
