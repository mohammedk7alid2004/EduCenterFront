import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/app/config';
import { ExcelMenu, type ExcelMenuAction } from '@/shared/components';
import { usePermission } from '@/shared/hooks';
import { downloadBlob } from '@/shared/utils';
import { useTeachersExport, useTeacherTemplate } from '../commands';
import type { TeacherFilters } from '../types';

export function TeacherExcelMenu({
  filters,
  onImport,
}: {
  filters: TeacherFilters;
  onImport: () => void;
}): JSX.Element | null {
  const { t } = useTranslation();
  const can = usePermission();
  const exporter = useTeachersExport();
  const template = useTeacherTemplate();

  const actions: ExcelMenuAction[] = [];
  if (can(PERMISSIONS.teachers.template)) {
    actions.push({
      key: 'template',
      label: t('excel.template'),
      icon: 'pdfFile',
      pending: template.isPending,
      onSelect: () =>
        template.mutate(undefined, {
          onSuccess: (file) => downloadBlob(file, 'TeachersImportTemplate.xlsx'),
          onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
        }),
    });
  }
  if (can(PERMISSIONS.teachers.import)) {
    actions.push({
      key: 'import',
      label: t('excel.import'),
      icon: 'upload',
      pending: false,
      onSelect: onImport,
    });
  }
  if (can(PERMISSIONS.teachers.read)) {
    actions.push({
      key: 'export',
      label: t('excel.export'),
      icon: 'download',
      pending: exporter.isPending,
      onSelect: () =>
        exporter.mutate(filters, {
          onSuccess: (file) => downloadBlob(file, 'Teachers.xlsx'),
          onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
        }),
    });
  }

  return <ExcelMenu actions={actions} />;
}
