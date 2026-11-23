import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/components';
import { useAttendance } from '@/features/attendance/attendance.queries';
import { ATTENDANCE_STATUS, type AttendanceStatus } from '@/features/attendance/attendance.types';
import { DASHBOARD_ATTENDANCE_REFRESH_INTERVAL_MS } from '../dashboard.constants';

const CHART_PERIOD = { week: 7, twoWeeks: 14, month: 30 } as const;

type ChartStatus = keyof typeof ATTENDANCE_STATUS;

const chartSeries: { key: ChartStatus; color: string }[] = [
  { key: 'present', color: 'bg-success' },
  { key: 'late', color: 'bg-warning' },
  { key: 'excused', color: 'bg-danger' },
  { key: 'absent', color: 'bg-info' },
];

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function statusKey(status: AttendanceStatus): ChartStatus {
  return (Object.entries(ATTENDANCE_STATUS).find(([, value]) => value === status)?.[0] ??
    'absent') as ChartStatus;
}

export function DashboardAttendanceChart(): JSX.Element {
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState<(typeof CHART_PERIOD)[keyof typeof CHART_PERIOD]>(
    CHART_PERIOD.week,
  );
  const query = useAttendance(
    { pageNumber: 1, pageSize: 100 },
    true,
    DASHBOARD_ATTENDANCE_REFRESH_INTERVAL_MS,
  );
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: period }, (_, index) => {
      const day = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - (period - 1 - index),
      );
      return { key: dateKey(day), date: day };
    });
  }, [period]);
  const data = useMemo(
    () =>
      days.map(({ key, date }) => {
        const counts: Record<ChartStatus, number> = { present: 0, late: 0, excused: 0, absent: 0 };
        for (const item of query.data?.items ?? []) {
          if (item.attendanceDate.slice(0, 10) === key) counts[statusKey(item.status)] += 1;
        }
        return {
          key,
          date,
          counts,
          total: Object.values(counts).reduce((sum, count) => sum + count, 0),
        };
      }),
    [days, query.data?.items],
  );
  const max = Math.max(1, ...data.map((item) => item.total));
  const formatter = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' });

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon name="chart" className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold">{t('pages.dashboard.attendanceToday')}</h2>
            <p className="text-xs text-muted">{t('pages.dashboard.attendanceChartSubtitle')}</p>
          </div>
        </div>
        <select
          value={period}
          onChange={(event) => setPeriod(Number(event.target.value) as typeof period)}
          aria-label={t('pages.dashboard.chartPeriod')}
          className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-medium text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        >
          {Object.entries(CHART_PERIOD).map(([key, value]) => (
            <option key={key} value={value}>
              {t(`pages.dashboard.chartPeriods.${key}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-tableHeading">
        {chartSeries.map((series) => (
          <span key={series.key} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-sm ${series.color}`} />
            {t(`pages.dashboard.${series.key}Rate`)}
          </span>
        ))}
      </div>
      <div className="flex h-64 items-end gap-2 border-b border-border px-1 pt-4 sm:gap-4">
        {data.map((item) => (
          <div
            key={item.key}
            className="flex min-w-0 flex-1 flex-col items-center gap-2 self-stretch"
          >
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                title={chartSeries
                  .map(
                    (series) =>
                      `${t(`pages.dashboard.${series.key}Rate`)}: ${item.counts[series.key]}`,
                  )
                  .join('\n')}
                className="flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-t-md bg-subtle transition-[height] duration-300"
                style={{ height: `${Math.max(item.total ? 10 : 2, (item.total / max) * 100)}%` }}
              >
                {chartSeries.map((series) =>
                  item.counts[series.key] ? (
                    <span
                      key={series.key}
                      className={series.color}
                      style={{ height: `${(item.counts[series.key] / item.total) * 100}%` }}
                    />
                  ) : null,
                )}
              </div>
            </div>
            <span className="truncate text-[11px] font-medium text-tableHeading">
              {formatter.format(item.date)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
