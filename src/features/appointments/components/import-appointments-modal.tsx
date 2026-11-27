import { useTranslation } from 'react-i18next';
import { ImportExcelModal } from '@/shared/components';
import { useImportAppointments } from '../commands';

export function ImportAppointmentsModal({ onClose }: { onClose: () => void }): JSX.Element {
  const { t } = useTranslation();
  const mutation = useImportAppointments();

  return (
    <ImportExcelModal
      inputId="appointments-import-file"
      hint={t('appointments.importHint')}
      mutation={mutation}
      onClose={onClose}
    />
  );
}
