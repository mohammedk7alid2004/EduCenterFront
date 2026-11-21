import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { ManagementList } from '@/shared/components';
import { useListControls } from '@/shared/hooks';
import { useAttendance } from './attendance.queries';
import type { AttendanceDto } from './attendance.types';
import { AttendanceFormModal } from './components/attendance-form-modal';
import { AttendanceTable } from './components/attendance-table';
import { ViewAttendanceModal } from './components/view-attendance-modal';
export function AttendancePage(): JSX.Element {
  const { t } = useTranslation();
  const controls = useListControls();
  const can = usePermission();
  const query = useAttendance(controls.filters);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<AttendanceDto | null>(null);
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
