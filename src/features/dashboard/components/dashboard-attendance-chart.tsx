import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAttendance, ATTENDANCE_STATUS, type AttendanceStatus } from '@/features/attendance';
import { DASHBOARD_ATTENDANCE_REFRESH_INTERVAL_MS } from '../constants';

const DASHBOARD_CHART_DAYS = 7;

type ChartStatus = keyof typeof ATTENDANCE_STATUS;

const chartSeries: { key: ChartStatus; color: string }[] = [
  { key: 'present', color: 'bg-success' },
  { key: 'late', color: 'bg-warning' },
  { key: 'excused', color: 'bg-info' },
  { key: 'absent', color: 'bg-danger' },
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
  const query = useAttendance(
    { pageNumber: 1, pageSize: 100 },
    true,
    DASHBOARD_ATTENDANCE_REFRESH_INTERVAL_MS,
  );
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DASHBOARD_CHART_DAYS }, (_, index) => {
      const day = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - (DASHBOARD_CHART_DAYS - 1 - index),
      );
      return { key: dateKey(day), date: day };
    });
  }, []);
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

  const axisValues = [max, Math.ceil((max * 3) / 4), Math.ceil(max / 2), Math.ceil(max / 4), 0];

  return (
    <section className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          {t('pages.dashboard.attendanceToday')}
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-tableHeading sm:text-xs">
          {chartSeries.map((series) => (
            <span key={series.key} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-[2px] ${series.color}`} />
              {t(`pages.dashboard.${series.key}Rate`)}
            </span>
          ))}
        </div>
      </div>
      <div className="relative h-64 ps-8">
        <div className="absolute inset-y-0 start-8 end-0 flex flex-col justify-between">
          {axisValues.map((value, index) => (
            <div key={`${value}-${index}`} className="border-t border-border/70" />
          ))}
        </div>
        <div className="absolute inset-y-0 start-0 flex flex-col justify-between text-[10px] text-muted">
          {axisValues.map((value, index) => (
            <span key={`${value}-${index}`}>{value}</span>
          ))}
        </div>
        <div className="relative flex h-full items-end gap-2 px-2 sm:gap-4">
          {data.map((item) => (
            <div
              key={item.key}
              className="group relative flex min-w-0 flex-1 flex-col items-center justify-end gap-2 self-stretch pt-3"
            >
              <div className="pointer-events-none absolute bottom-[calc(100%-42px)] z-10 w-36 rounded-lg bg-primary px-2.5 py-2 text-[10px] text-card opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                <p className="mb-1 font-semibold">{formatter.format(item.date)}</p>
                {chartSeries.map((series) => (
                  <p key={series.key} className="flex justify-between gap-3">
                    <span>{t(`pages.dashboard.${series.key}Rate`)}</span>
                    <span>{item.counts[series.key]}</span>
                  </p>
                ))}
              </div>
              <div
                className="flex w-full max-w-8 flex-col-reverse overflow-hidden rounded-t-[4px] bg-subtle transition-[height] duration-300 sm:max-w-10"
                style={{ height: `${Math.max(item.total ? 10 : 1, (item.total / max) * 100)}%` }}
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
              <span className="truncate text-[10px] font-medium text-tableHeading sm:text-[11px]">
                {formatter.format(item.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
