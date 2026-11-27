import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/app/config';
import { ExcelMenu, type ExcelMenuAction } from '@/shared/components';
import { usePermission } from '@/shared/hooks';
import type { ListFilters } from '@/shared/types';
import { downloadBlob } from '@/shared/utils';
import { useClassroomsExport, useClassroomTemplate } from '../commands';

export function ClassroomExcelMenu({
  filters,
  onImport,
}: {
  filters: ListFilters;
  onImport: () => void;
}): JSX.Element | null {
  const { t } = useTranslation();
  const can = usePermission();
  const exporter = useClassroomsExport();
  const template = useClassroomTemplate();

  const actions: ExcelMenuAction[] = [];
  if (can(PERMISSIONS.classrooms.template)) {
    actions.push({
      key: 'template',
      label: t('excel.template'),
      icon: 'pdfFile',
      pending: template.isPending,
      onSelect: () =>
        template.mutate(undefined, {
          onSuccess: (file) => downloadBlob(file, 'ClassroomsTemplate.xlsx'),
          onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
        }),
    });
  }
  if (can(PERMISSIONS.classrooms.import)) {
    actions.push({
      key: 'import',
      label: t('excel.import'),
      icon: 'upload',
      pending: false,
      onSelect: onImport,
    });
  }
  if (can(PERMISSIONS.classrooms.export)) {
    actions.push({
      key: 'export',
      label: t('excel.export'),
      icon: 'download',
      pending: exporter.isPending,
      onSelect: () =>
        exporter.mutate(filters, {
          onSuccess: (file) => downloadBlob(file, 'Classrooms.xlsx'),
          onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
        }),
    });
  }

  return <ExcelMenu actions={actions} />;
}
