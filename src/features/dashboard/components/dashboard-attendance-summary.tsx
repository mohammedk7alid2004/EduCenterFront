import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { Icon } from '@/shared/components';
import { useAttendance } from '@/features/attendance/attendance.queries';
import { ATTENDANCE_STATUS } from '@/features/attendance/attendance.types';
import { AttendanceStatusBadge } from '@/features/attendance/components/attendance-status-badge';

export function DashboardAttendanceSummary(): JSX.Element {
  const { t } = useTranslation();
  const query = useAttendance({ pageNumber: 1, pageSize: 15 });
  const items = query.data?.items ?? [];

  const presentCount = items.filter((item) => item.status === ATTENDANCE_STATUS.present).length;
  const lateCount = items.filter((item) => item.status === ATTENDANCE_STATUS.late).length;
  const excusedCount = items.filter((item) => item.status === ATTENDANCE_STATUS.excused).length;
  const totalCount = items.length;

  const presentPercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
  const latePercent = totalCount > 0 ? Math.round((lateCount / totalCount) * 100) : 0;
  const excusedPercent = totalCount > 0 ? Math.round((excusedCount / totalCount) * 100) : 0;

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div>
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

        {/* Progress Breakdown Bar */}
        <div className="mt-5 rounded-2xl border border-border/80 bg-subtle/50 p-4">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted">{t('pages.dashboard.statsOverview')}</span>
            <span className="font-bold text-success">
              {presentPercent}% {t('pages.dashboard.presentRate')}
            </span>
          </div>

          {/* Segmented Progress */}
          <div className="mt-2.5 flex h-3 w-full overflow-hidden rounded-full bg-border/40">
            {totalCount > 0 ? (
              <>
                <div
                  style={{ width: `${presentPercent}%` }}
                  className="bg-success transition-all duration-500"
                  title={`${t('pages.dashboard.presentRate')}: ${presentPercent}%`}
                />
                <div
                  style={{ width: `${latePercent}%` }}
                  className="bg-danger transition-all duration-500"
                  title={`${t('pages.dashboard.lateRate')}: ${latePercent}%`}
                />
                <div
                  style={{ width: `${excusedPercent}%` }}
                  className="bg-info transition-all duration-500"
                  title={`${t('pages.dashboard.excusedRate')}: ${excusedPercent}%`}
                />
              </>
            ) : (
              <div className="w-full bg-muted/20" />
            )}
          </div>

          {/* Breakdown Pills */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-success/10 p-2 text-success">
              <p className="font-bold text-sm">{presentCount}</p>
              <p className="text-[11px] font-medium">{t('pages.dashboard.presentRate')}</p>
            </div>
            <div className="rounded-xl bg-danger/10 p-2 text-danger">
              <p className="font-bold text-sm">{lateCount}</p>
              <p className="text-[11px] font-medium">{t('pages.dashboard.lateRate')}</p>
            </div>
            <div className="rounded-xl bg-info/10 p-2 text-info">
              <p className="font-bold text-sm">{excusedCount}</p>
              <p className="text-[11px] font-medium">{t('pages.dashboard.excusedRate')}</p>
            </div>
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="mt-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            {t('pages.dashboard.recentAttendance')}
          </h3>
          <div className="space-y-2.5">
            {query.isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
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
    </div>
  );
}
