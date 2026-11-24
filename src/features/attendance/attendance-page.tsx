import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LIST_PARAMS, PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { Button, Icon, ManagementList } from '@/shared/components';
import { useListControls, useOnline } from '@/shared/hooks';
import { downloadBlob } from '@/shared/utils';
import { useAttendance, useAttendanceExport } from './attendance.queries';
import { ATTENDANCE_FILTER_PARAMS, ATTENDANCE_FILTER_STATUSES } from './attendance.constants';
import type { AttendanceDto, AttendanceStatus } from './attendance.types';
import { AttendanceFormModal } from './components/attendance-form-modal';
import { AttendanceFilters } from './components/attendance-filters';
import { AttendanceTable } from './components/attendance-table';
import { ViewAttendanceModal } from './components/view-attendance-modal';
export function AttendancePage(): JSX.Element {
  const { t } = useTranslation();
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
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<AttendanceDto | null>(null);

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
            <Button
              type="button"
              variant="ghost"
              className="h-[43px] rounded-xl border border-primary/20 bg-card text-primary"
              disabled={!online || exporter.isPending}
              loading={exporter.isPending}
              onClick={() =>
                exporter.mutate(filters, {
                  onSuccess: (file) => downloadBlob(file, 'StudentAttendance.xlsx'),
                  onError: (error) =>
                    toast.error(t(error.message, { defaultValue: error.message })),
                })
              }
            >
              <Icon name="download" className="size-4" />
              {t('attendance.export')}
            </Button>
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
