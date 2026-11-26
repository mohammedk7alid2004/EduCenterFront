import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/shared/constants';
import { Icon } from '@/shared/components';
import { useAttendance, ATTENDANCE_STATUS, AttendanceStatusBadge } from '@/features/attendance';
import { DASHBOARD_ATTENDANCE_REFRESH_INTERVAL_MS } from '../constants';

export function DashboardAttendanceSummary(): JSX.Element {
  const { t } = useTranslation();
  const query = useAttendance(
    { pageNumber: 1, pageSize: 15 },
    true,
    DASHBOARD_ATTENDANCE_REFRESH_INTERVAL_MS,
  );
  const items = query.data?.items ?? [];

  const presentCount = items.filter((item) => item.status === ATTENDANCE_STATUS.present).length;
  const lateCount = items.filter((item) => item.status === ATTENDANCE_STATUS.late).length;
  const excusedCount = items.filter((item) => item.status === ATTENDANCE_STATUS.excused).length;
  const absentCount = items.filter((item) => item.status === ATTENDANCE_STATUS.absent).length;
  const totalCount = items.length;

  const presentPercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
  const latePercent = totalCount > 0 ? Math.round((lateCount / totalCount) * 100) : 0;
  const excusedPercent = totalCount > 0 ? Math.round((excusedCount / totalCount) * 100) : 0;
  const absentPercent = totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-success/10 text-success">
            <Icon name="listChecks" className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold">{t('pages.dashboard.attendanceRate')}</h2>
            <p className="text-xs text-muted">{t('pages.dashboard.recentAttendance')}</p>
          </div>
        </div>
        <Link
          to={ROUTES.attendance}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <span>{t('pages.dashboard.viewAllAttendance')}</span>
          <Icon name="arrowRight" className="size-3.5 rtl:rotate-180" />
        </Link>
      </div>

      {/* Simple Attendance Stats */}
      <div className="mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-success/20 bg-success/5 p-3 text-center">
            <p className="text-xl font-bold text-success">{presentCount}</p>
            <p className="mt-0.5 text-xs font-medium text-tableHeading">
              {t('attendance.statuses.present')}
            </p>
          </div>
          <div className="rounded-2xl border border-warning/20 bg-warning/5 p-3 text-center">
            <p className="text-xl font-bold text-warning">{lateCount}</p>
            <p className="mt-0.5 text-xs font-medium text-tableHeading">
              {t('pages.dashboard.lateRate')}
            </p>
          </div>
          <div className="rounded-2xl border border-info/20 bg-info/5 p-3 text-center">
            <p className="text-xl font-bold text-info">{excusedCount}</p>
            <p className="mt-0.5 text-xs font-medium text-tableHeading">
              {t('pages.dashboard.excusedRate')}
            </p>
          </div>
          <div className="rounded-2xl border border-danger/20 bg-danger/5 p-3 text-center">
            <p className="text-xl font-bold text-danger">{absentCount}</p>
            <p className="mt-0.5 text-xs font-medium text-tableHeading">
              {t('pages.dashboard.absentRate')}
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/40">
            <div
              style={{ width: `${presentPercent}%` }}
              className="bg-success transition-all duration-500"
              title={`${t('attendance.statuses.present')}: ${presentPercent}%`}
            />
            <div
              style={{ width: `${latePercent}%` }}
              className="bg-warning transition-all duration-500"
              title={`${t('pages.dashboard.lateRate')}: ${latePercent}%`}
            />
            <div
              style={{ width: `${excusedPercent}%` }}
              className="bg-info transition-all duration-500"
              title={`${t('pages.dashboard.excusedRate')}: ${excusedPercent}%`}
            />
            <div
              style={{ width: `${absentPercent}%` }}
              className="bg-danger transition-all duration-500"
              title={`${t('pages.dashboard.absentRate')}: ${absentPercent}%`}
            />
          </div>
        )}
      </div>

      {/* Recent Check-ins */}
      <div className="mt-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          {t('pages.dashboard.recentAttendance')}
        </h3>
        <div className="space-y-2.5">
          {query.isPending ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-iconSurface/50" />
            ))
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">
              {t('pages.dashboard.noRecentAttendance')}
            </p>
          ) : (
            items.slice(0, 4).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-2.5 text-xs transition hover:bg-subtle/50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    {record.fullName.charAt(0) || '—'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{record.fullName}</p>
                    <p className="text-[11px] text-muted truncate">
                      {record.groupName || t('common.noValue')}
                    </p>
                  </div>
                </div>
                <AttendanceStatusBadge status={record.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
