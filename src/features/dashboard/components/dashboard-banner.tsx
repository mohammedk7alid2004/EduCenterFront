import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/shared/constants';
import { useAuthStore } from '@/shared/hooks';
import { Icon } from '@/shared/components';

export function DashboardBanner(): JSX.Element {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -top-24 end-0 size-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 start-1/3 size-64 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              {t('pages.dashboard.centerActive')}
            </span>
            <span className="text-xs text-muted">{formattedDate}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t('pages.dashboard.welcome', { name: user?.name ?? '' })}
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            {t('pages.dashboard.analyticsSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={ROUTES.appointments}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-card shadow-sm transition hover:bg-primary/90"
          >
            <Icon name="calendar" className="size-4" />
            <span>{t('pages.dashboard.todaySchedule')}</span>
          </Link>
          <Link
            to={ROUTES.attendance}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-iconSurface px-4 py-2.5 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-primary/10"
          >
            <Icon name="listChecks" className="size-4" />
            <span>{t('nav.attendance')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
