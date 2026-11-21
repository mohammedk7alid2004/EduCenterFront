import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { Icon } from '@/shared/components';
import { useGroups } from '@/features/groups/groups.queries';
import { groupLocalizedName } from '@/features/groups/groups.lib';

export function DashboardGroupsCapacity(): JSX.Element {
  const { t, i18n } = useTranslation();
  const query = useGroups({ pageNumber: 1, pageSize: 4 });
  const items = query.data?.items ?? [];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-accent/15 text-accent">
            <Icon name="users" className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold">{t('pages.dashboard.groupsCapacity')}</h2>
            <p className="text-xs text-muted">{t('groups.description')}</p>
          </div>
        </div>
        <Link
          to={ROUTES.groups}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <span>{t('pages.dashboard.open')}</span>
          <Icon name="arrowRight" className="size-3.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {query.isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-iconSurface/50" />
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full py-8 text-center text-sm text-muted">
            {t('common.noValue')}
          </div>
        ) : (
          items.map((group) => {
            const students = group.studentsCount ?? 0;
            const max = group.maxCapacity || 1;
            const percent = Math.min(100, Math.round((students / max) * 100));
            const subjectTitle = groupLocalizedName(group.subject, i18n.language);

            const barColor =
              percent >= 90 ? 'bg-danger' : percent >= 70 ? 'bg-accent' : 'bg-primary';

            return (
              <div
                key={group.id}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-subtle/50 p-4 transition hover:border-primary/40 hover:bg-subtle"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {group.groupName}
                    </p>
                    {subjectTitle && (
                      <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary truncate max-w-24">
                        {subjectTitle}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted">
                    <Icon name="teacher" className="size-3.5 shrink-0" />
                    <span className="truncate">{group.teacher}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                    <span className="text-muted">
                      {t('pages.dashboard.capacityStudents', { count: students, max })}
                    </span>
                    <span className="font-bold text-foreground">{percent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
