import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { Icon } from '@/shared/components';
import { useAppointments } from '@/features/appointments/appointments.queries';
import { formatAppointmentTime, localizedName } from '@/features/appointments/appointments.lib';

export function DashboardUpcomingAppointments(): JSX.Element {
  const { t, i18n } = useTranslation();
  const query = useAppointments({ pageNumber: 1, pageSize: 5 }, false);
  const items = query.data?.items ?? [];

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div>
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-info/10 text-info">
              <Icon name="clock" className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold">{t('pages.dashboard.upcomingSessions')}</h2>
              <p className="text-xs text-muted">{t('appointments.description')}</p>
            </div>
          </div>
          <Link
            to={ROUTES.appointments}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <span>{t('pages.dashboard.viewAllAppointments')}</span>
            <Icon name="arrowRight" className="size-3.5 rtl:rotate-180" />
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {query.isPending ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-iconSurface/50" />
            ))
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">
              <Icon name="clock" className="mx-auto size-8 text-muted/60 mb-2" />
              {t('pages.dashboard.noUpcomingSessions')}
            </div>
          ) : (
            items.map((appointment) => {
              const subjectTitle = localizedName(appointment.subject, i18n.language);
              const classroomTitle = localizedName(appointment.classroom, i18n.language);
              const formattedTime = `${formatAppointmentTime(appointment.startTime, i18n.language)} – ${formatAppointmentTime(appointment.endTime, i18n.language)}`;

              return (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-subtle/50 p-3.5 transition hover:border-primary/30 hover:bg-subtle sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-semibold text-xs">
                      <Icon name="bookOpen" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate text-foreground">
                          {appointment.groupName}
                        </p>
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {subjectTitle || t('common.noValue')}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="teacher" className="size-3.5" />
                          {appointment.teacher}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="classroom" className="size-3.5" />
                          {classroomTitle || t('common.noValue')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                      <Icon name="clock" className="size-3 text-muted" />
                      <bdi>{formattedTime}</bdi>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
