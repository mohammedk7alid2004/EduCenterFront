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
  tone: 'primary' | 'purple' | 'amber' | 'blue' | 'emerald' | 'rose';
}

const sections: SectionItem[] = [
  {
    key: 'students',
    route: ROUTES.students,
    icon: 'students',
    permission: PERMISSIONS.students.read,
    tone: 'primary',
  },
  {
    key: 'groups',
    route: ROUTES.groups,
    icon: 'users',
    permission: PERMISSIONS.groups.read,
    tone: 'amber',
  },
  {
    key: 'appointments',
    route: ROUTES.appointments,
    icon: 'clock',
    permission: PERMISSIONS.appointments.read,
    tone: 'blue',
  },
  {
    key: 'attendance',
    route: ROUTES.attendance,
    icon: 'listChecks',
    permission: PERMISSIONS.attendance.read,
    tone: 'emerald',
  },
  {
    key: 'teachers',
    route: ROUTES.teachers,
    icon: 'graduationCap',
    tone: 'purple',
  },
  {
    key: 'subjects',
    route: ROUTES.subjects,
    icon: 'bookOpen',
    tone: 'primary',
  },
  {
    key: 'classrooms',
    route: ROUTES.classrooms,
    icon: 'classroom',
    tone: 'rose',
  },
  {
    key: 'employees',
    route: ROUTES.employees,
    icon: 'users',
    permission: PERMISSIONS.employees.read,
    tone: 'blue',
  },
  {
    key: 'roles',
    route: ROUTES.roles,
    icon: 'permission',
    permission: PERMISSIONS.roles.read,
    tone: 'purple',
  },
  {
    key: 'contactUs',
    route: ROUTES.contactUs,
    icon: 'contactUs',
    permission: PERMISSIONS.contactUs.read,
    tone: 'amber',
  },
  {
    key: 'system',
    route: ROUTES.systemManagement,
    icon: 'building',
    tone: 'primary',
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{t('pages.dashboard.quickSections')}</h2>
          <p className="text-xs text-muted">{t('pages.dashboard.sectionsSubtitle')}</p>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {accessibleSections.map((section) => (
          <Link
            key={section.key}
            to={section.route}
            className="group flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105 group-hover:bg-primary group-hover:text-card">
              <Icon name={section.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition truncate">
                  {t(`nav.${section.key}`)}
                </h3>
                <Icon
                  name="arrowRight"
                  className="size-3.5 text-muted transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1 shrink-0"
                />
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                {t(`pages.dashboard.${section.key}Description`)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
