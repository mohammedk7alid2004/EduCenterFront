import { useTranslation } from 'react-i18next';
import { ImportExcelModal } from '@/shared/components';
import { useImportSubjects } from '../commands';

export function ImportSubjectsModal({ onClose }: { onClose: () => void }): JSX.Element {
  const { t } = useTranslation();
  const mutation = useImportSubjects();

  return (
    <ImportExcelModal
      inputId="subjects-import-file"
      hint={t('subjects.importHint')}
      mutation={mutation}
      onClose={onClose}
    />
  );
}
