import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS, ROUTES, type IconName } from '@/config';
import { SYSTEM_TABS } from '@/features/system-management';
import { usePermission } from '@/infrastructure/auth';
import { Icon } from '@/shared/components';

interface SectionItem {
  key: string;
  route: string;
  icon: IconName;
  permission?: string;
}

const sections: SectionItem[] = [
  {
    key: 'students',
    route: ROUTES.students,
    icon: 'students',
    permission: PERMISSIONS.students.read,
  },
  {
    key: 'groups',
    route: ROUTES.groups,
    icon: 'users',
    permission: PERMISSIONS.groups.read,
  },
  {
    key: 'appointments',
    route: ROUTES.appointments,
    icon: 'clock',
    permission: PERMISSIONS.appointments.read,
  },
  {
    key: 'attendance',
    route: ROUTES.attendance,
    icon: 'listChecks',
    permission: PERMISSIONS.attendance.read,
  },
  {
    key: 'teachers',
    route: ROUTES.teachers,
    icon: 'graduationCap',
  },
  {
    key: 'subjects',
    route: ROUTES.subjects,
    icon: 'bookOpen',
  },
  {
    key: 'classrooms',
    route: ROUTES.classrooms,
    icon: 'classroom',
  },
  {
    key: 'employees',
    route: ROUTES.employees,
    icon: 'users',
    permission: PERMISSIONS.employees.read,
  },
  {
    key: 'roles',
    route: ROUTES.roles,
    icon: 'permission',
    permission: PERMISSIONS.roles.read,
  },
  {
    key: 'contactUs',
    route: ROUTES.contactUs,
    icon: 'contactUs',
    permission: PERMISSIONS.contactUs.read,
  },
  {
    key: 'system',
    route: ROUTES.systemManagement,
    icon: 'building',
  },
];

export function DashboardSectionsNav(): JSX.Element {
  const { t } = useTranslation();
  const can = usePermission();

  const accessibleSections = sections.filter((section) =>
    section.key === 'system'
      ? SYSTEM_TABS.some((tab) => can(tab.read))
      : !section.permission || can(section.permission),
  );

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {t('pages.dashboard.quickSections')}
          </h2>
          <p className="text-xs text-muted">{t('pages.dashboard.sectionsSubtitle')}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {accessibleSections.map((section) => (
          <Link
            key={section.key}
            to={section.route}
            className="group flex items-center gap-3 rounded-2xl border border-border/80 bg-subtle/40 p-3.5 transition duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-xs"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105 group-hover:bg-primary group-hover:text-card">
              <Icon name={section.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition truncate">
                  {t(`nav.${section.key}`)}
                </h3>
                <Icon
                  name="arrowRight"
                  className="size-3 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-0.5 shrink-0"
                />
              </div>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
                {t(`pages.dashboard.${section.key}Description`)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
