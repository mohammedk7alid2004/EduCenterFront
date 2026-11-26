import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LIST_PARAMS } from '@/shared/constants';
import { PERMISSIONS } from '@/app/config';
import { usePermission } from '@/shared/hooks';
import { Button, Icon, ManagementList } from '@/shared/components';
import { useListControls, useOnline } from '@/shared/hooks';
import { downloadBlob } from '@/shared/utils';
import {
  exportAttendancePdf,
  useAttendance,
  useAttendanceExport,
  useAttendancePdfExport,
  ATTENDANCE_FILTER_PARAMS,
  ATTENDANCE_FILTER_STATUSES,
  AttendanceFormModal,
  AttendanceFilters,
  AttendanceTable,
  ViewAttendanceModal,
} from '@/features/attendance';
import type { AttendanceDto, AttendanceStatus } from '@/features/attendance';
export function AttendancePage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const controls = useListControls();
  const can = usePermission();
  const online = useOnline();
  const [params, setParams] = useSearchParams();
  const statusValue = params.get(ATTENDANCE_FILTER_PARAMS.status) ?? '';
  const groupName = params.get(ATTENDANCE_FILTER_PARAMS.groupName) ?? '';
  const attendanceDate = params.get(ATTENDANCE_FILTER_PARAMS.date) ?? '';
  const selectedStatus = Number(statusValue);
  const status = ATTENDANCE_FILTER_STATUSES.includes(
    selectedStatus as (typeof ATTENDANCE_FILTER_STATUSES)[number],
  )
    ? (selectedStatus as AttendanceStatus)
    : undefined;
  const filters = {
    ...controls.filters,
    status,
    groupName: groupName || undefined,
    attendanceDate: attendanceDate || undefined,
  };
  const query = useAttendance(filters);
  const exporter = useAttendanceExport();
  const pdfExporter = useAttendancePdfExport();
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<AttendanceDto | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  function changeFilter(key: 'status' | 'groupName' | 'date', value: string): void {
    const param = ATTENDANCE_FILTER_PARAMS[key];
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(param, value);
      else next.delete(param);
      next.delete(LIST_PARAMS.page);
      return next;
    });
  }

  function clearFilters(): void {
    setParams((current) => {
      const next = new URLSearchParams(current);
      Object.values(ATTENDANCE_FILTER_PARAMS).forEach((param) => next.delete(param));
      next.delete(LIST_PARAMS.page);
      return next;
    });
  }

  async function handlePdfExport(): Promise<void> {
    try {
      const rows = await pdfExporter.mutateAsync(filters);
      await exportAttendancePdf({
        rows,
        language: i18n.language,
        labels: {
          title: t('attendance.pdf.title'),
          generatedAt: t('attendance.pdf.generatedAt'),
          page: t('attendance.pdf.page'),
          noRecords: t('attendance.pdf.noRecords'),
          fullName: t('attendance.fullName'),
          phoneNumber: t('attendance.phoneNumber'),
          group: t('attendance.group'),
          status: t('attendance.status'),
          date: t('attendance.date'),
          records: t('attendance.pdf.records'),
          groups: t('attendance.pdf.groups'),
          period: t('attendance.pdf.period'),
          allDates: t('attendance.pdf.allDates'),
          multipleGroups: t('attendance.pdf.multipleGroups'),
          statuses: {
            1: t('attendance.statuses.present'),
            2: t('attendance.statuses.late'),
            3: t('attendance.statuses.excused'),
            4: t('attendance.statuses.absent'),
          },
        },
      });
      setExportOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'errors.unknown';
      toast.error(t(message, { defaultValue: message }));
    } finally {
      setExportOpen(false);
    }
  }
  return (
    <>
      <ManagementList
        title={t('attendance.title')}
        description={t('attendance.description')}
        createLabel={t('attendance.create')}
        controls={controls}
        canCreate={can(PERMISSIONS.attendance.record)}
        totalCount={query.data?.totalCount ?? 0}
        totalPages={Math.max(1, query.data?.totalPages ?? 1)}
        loading={query.isPending}
        fetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        onCreate={() => setFormOpen(true)}
        statusFilter={false}
        filterContent={
          <AttendanceFilters
            status={statusValue}
            groupName={groupName}
            date={attendanceDate}
            onChange={changeFilter}
            onClear={clearFilters}
          />
        }
        searchActions={
          can(PERMISSIONS.attendance.read) ? (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                className="h-[43px] rounded-xl border border-primary/20 bg-card text-primary"
                disabled={!online || exporter.isPending || pdfExporter.isPending}
                loading={exporter.isPending || pdfExporter.isPending}
                aria-expanded={exportOpen}
                onClick={() => setExportOpen((open) => !open)}
              >
                <Icon name="download" className="size-4" />
                {t('attendance.export')}
                <Icon name="chevronDown" className="size-4" />
              </Button>
              {exportOpen && (
                <div
                  role="menu"
                  className="absolute end-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-primary/10"
                    onClick={() =>
                      exporter.mutate(filters, {
                        onSuccess: (file) => {
                          downloadBlob(file, 'StudentAttendance.xlsx');
                          setExportOpen(false);
                        },
                        onError: (error) =>
                          toast.error(t(error.message, { defaultValue: error.message })),
                      })
                    }
                  >
                    <Icon name="download" className="size-4 text-success" />
                    {t('attendance.exportExcel')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-primary/10"
                    onClick={() => void handlePdfExport()}
                  >
                    <Icon name="pdfFile" className="size-4 text-danger" />
                    {t('attendance.exportPdf')}
                  </button>
                </div>
              )}
            </div>
          ) : undefined
        }
      >
        <AttendanceTable
          rows={query.data?.items ?? []}
          startIndex={(controls.page - 1) * controls.pageSize}
          onView={setViewing}
        />
      </ManagementList>
      {formOpen && <AttendanceFormModal onClose={() => setFormOpen(false)} />}
      {viewing && <ViewAttendanceModal id={viewing.id} onClose={() => setViewing(null)} />}
    </>
  );
}
