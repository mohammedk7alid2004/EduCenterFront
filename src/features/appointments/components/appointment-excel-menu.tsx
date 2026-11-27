import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/app/config';
import { ExcelMenu, type ExcelMenuAction } from '@/shared/components';
import { usePermission } from '@/shared/hooks';
import { downloadBlob } from '@/shared/utils';
import { useAppointmentsExport, useAppointmentTemplate } from '../commands';
import type { AppointmentFilters } from '../types';

export function AppointmentExcelMenu({
  filters,
  onImport,
}: {
  filters: AppointmentFilters;
  onImport: () => void;
}): JSX.Element | null {
  const { t } = useTranslation();
  const can = usePermission();
  const exporter = useAppointmentsExport();
  const template = useAppointmentTemplate();

  const actions: ExcelMenuAction[] = [];
  if (can(PERMISSIONS.appointments.template)) {
    actions.push({
      key: 'template',
      label: t('excel.template'),
      icon: 'pdfFile',
      pending: template.isPending,
      onSelect: () =>
        template.mutate(undefined, {
          onSuccess: (file) => downloadBlob(file, 'AppointmentsImportTemplate.xlsx'),
          onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
        }),
    });
  }
  if (can(PERMISSIONS.appointments.import)) {
    actions.push({
      key: 'import',
      label: t('excel.import'),
      icon: 'upload',
      pending: false,
      onSelect: onImport,
    });
  }
  if (can(PERMISSIONS.appointments.export)) {
    actions.push({
      key: 'export',
      label: t('excel.export'),
      icon: 'download',
      pending: exporter.isPending,
      onSelect: () =>
        exporter.mutate(filters, {
          onSuccess: (file) => downloadBlob(file, 'Appointments.xlsx'),
          onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
        }),
    });
  }

  return <ExcelMenu actions={actions} />;
}
