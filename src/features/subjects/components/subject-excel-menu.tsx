import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/app/config';
import { ExcelMenu, type ExcelMenuAction } from '@/shared/components';
import { usePermission } from '@/shared/hooks';
import { downloadBlob } from '@/shared/utils';
import { useSubjectsExport, useSubjectTemplate } from '../commands';
import type { SubjectFilters } from '../types';

export function SubjectExcelMenu({
  filters,
  onImport,
}: {
  filters: SubjectFilters;
  onImport: () => void;
}): JSX.Element | null {
  const { t } = useTranslation();
  const can = usePermission();
  const exporter = useSubjectsExport();
  const template = useSubjectTemplate();

  const actions: ExcelMenuAction[] = [];
  if (can(PERMISSIONS.subjects.template)) {
    actions.push({
      key: 'template',
      label: t('excel.template'),
      icon: 'pdfFile',
      pending: template.isPending,
      onSelect: () =>
        template.mutate(undefined, {
          onSuccess: (file) => downloadBlob(file, 'SubjectsTemplate.xlsx'),
          onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
        }),
    });
  }
  if (can(PERMISSIONS.subjects.import)) {
    actions.push({
      key: 'import',
      label: t('excel.import'),
      icon: 'upload',
      pending: false,
      onSelect: onImport,
    });
  }
  if (can(PERMISSIONS.subjects.export)) {
    actions.push({
      key: 'export',
      label: t('excel.export'),
      icon: 'download',
      pending: exporter.isPending,
      onSelect: () =>
        exporter.mutate(filters, {
          onSuccess: (file) => downloadBlob(file, 'Subjects.xlsx'),
          onError: (error) => toast.error(t(error.message, { defaultValue: error.message })),
        }),
    });
  }

  return <ExcelMenu actions={actions} />;
}
