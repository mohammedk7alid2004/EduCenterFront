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
    <div className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div>
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

        <div className="mt-4 space-y-3.5">
          {query.isPending ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-iconSurface/50" />
            ))
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">{t('common.noValue')}</div>
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
                  className="rounded-2xl border border-border/80 bg-subtle/50 p-3.5 transition hover:border-primary/30"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate max-w-44">
                        {group.groupName}
                      </span>
                      {subjectTitle && (
                        <span className="rounded-md bg-iconSurface px-2 py-0.5 text-[11px] font-medium text-primary">
                          {subjectTitle}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-xs text-muted">
                      {t('pages.dashboard.capacityStudents', { count: students, max })}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-border/40">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="teacher" className="size-3" />
                      {group.teacher}
                    </span>
                    <span className="font-semibold text-foreground">{percent}%</span>
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
