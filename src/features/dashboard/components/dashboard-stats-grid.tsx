import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS, ROUTES, type IconName } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { Icon } from '@/shared/components';
import { useStudents } from '@/features/students/students.queries';
import { useTeachers } from '@/features/teachers/teachers.queries';
import { useGroups } from '@/features/groups/groups.queries';
import { useAppointments } from '@/features/appointments/appointments.queries';
import { useAttendance } from '@/features/attendance/attendance.queries';
import { useClassrooms } from '@/features/classrooms/classrooms.queries';
import { DASHBOARD_ATTENDANCE_REFRESH_INTERVAL_MS } from '../dashboard.constants';

interface StatCardProps {
  title: string;
  count: number | undefined;
  subtitle: string;
  route: string;
  icon: IconName;
  colorScheme: 'teal' | 'purple' | 'amber' | 'blue' | 'emerald' | 'rose';
  loading: boolean;
}

const colorStyles = {
  teal: {
    iconBg: 'bg-primary/10 text-primary border-primary/20',
    badgeBg: 'bg-primary/5 text-primary border-primary/10',
    hoverBorder: 'hover:border-primary/50',
    topGlow: 'bg-primary/5',
  },
  purple: {
    iconBg: 'bg-calendarPurple/10 text-calendarPurple border-calendarPurple/20',
    badgeBg: 'bg-calendarPurple/5 text-calendarPurple border-calendarPurple/10',
    hoverBorder: 'hover:border-calendarPurple/50',
    topGlow: 'bg-calendarPurple/5',
  },
  amber: {
    iconBg: 'bg-accent/10 text-accent border-accent/20',
    badgeBg: 'bg-accent/5 text-accent border-accent/10',
    hoverBorder: 'hover:border-accent/50',
    topGlow: 'bg-accent/5',
  },
  blue: {
    iconBg: 'bg-info/10 text-info border-info/20',
    badgeBg: 'bg-info/5 text-info border-info/10',
    hoverBorder: 'hover:border-info/50',
    topGlow: 'bg-info/5',
  },
  emerald: {
    iconBg: 'bg-success/10 text-success border-success/20',
    badgeBg: 'bg-success/5 text-success border-success/10',
    hoverBorder: 'hover:border-success/50',
    topGlow: 'bg-success/5',
  },
  rose: {
    iconBg: 'bg-terracotta/10 text-terracotta border-terracotta/20',
    badgeBg: 'bg-terracotta/5 text-terracotta border-terracotta/10',
    hoverBorder: 'hover:border-terracotta/50',
    topGlow: 'bg-terracotta/5',
  },
};

function StatCard({
  title,
  count,
  subtitle,
  route,
  icon,
  colorScheme,
  loading,
}: StatCardProps): JSX.Element {
  const { t } = useTranslation();
  const styles = colorStyles[colorScheme];

  return (
    <Link
      to={route}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${styles.hoverBorder}`}
    >
      <div
        className={`pointer-events-none absolute -top-12 end-0 size-28 rounded-full blur-2xl ${styles.topGlow}`}
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-xl border transition group-hover:scale-105 ${styles.iconBg}`}
        >
          <Icon name={icon} className="size-6" />
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${styles.badgeBg}`}
        >
          <span>{t('pages.dashboard.open')}</span>
          <Icon
            name="arrowRight"
            className="size-3 transition group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          />
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-muted">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-iconSurface" />
          ) : (
            <span className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {count ?? 0}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted truncate">{subtitle}</p>
      </div>
    </Link>
  );
}

export function DashboardStatsGrid(): JSX.Element {
  const { t } = useTranslation();
  const can = usePermission();

  const canStudents = can(PERMISSIONS.students.read);
  const canTeachers = true;
  const canGroups = can(PERMISSIONS.groups.read);
  const canAppointments = can(PERMISSIONS.appointments.read);
  const canAttendance = can(PERMISSIONS.attendance.read);
  const canClassrooms = true;

  const studentsQuery = useStudents({ pageNumber: 1, pageSize: 1 }, canStudents);
  const teachersQuery = useTeachers({ pageNumber: 1, pageSize: 1 }, canTeachers);
  const groupsQuery = useGroups({ pageNumber: 1, pageSize: 1 }, canGroups);
  const appointmentsQuery = useAppointments({ pageNumber: 1, pageSize: 1 }, false, canAppointments);
  const attendanceQuery = useAttendance(
    { pageNumber: 1, pageSize: 1 },
    canAttendance,
    DASHBOARD_ATTENDANCE_REFRESH_INTERVAL_MS,
  );
  const classroomsQuery = useClassrooms({ pageNumber: 1, pageSize: 1 }, canClassrooms);

  const stats: (StatCardProps & { key: string; visible: boolean })[] = [
    {
      key: 'students',
      visible: canStudents,
      title: t('pages.dashboard.totalStudents'),
      count: studentsQuery.data?.totalCount,
      subtitle: t('pages.dashboard.activeStudents'),
      route: ROUTES.students,
      icon: 'students',
      colorScheme: 'teal',
      loading: studentsQuery.isPending,
    },
    {
      key: 'teachers',
      visible: canTeachers,
      title: t('pages.dashboard.totalTeachers'),
      count: teachersQuery.data?.totalCount,
      subtitle: t('pages.dashboard.activeTeachers'),
      route: ROUTES.teachers,
      icon: 'graduationCap',
      colorScheme: 'purple',
      loading: teachersQuery.isPending,
    },
    {
      key: 'groups',
      visible: canGroups,
      title: t('pages.dashboard.totalGroups'),
      count: groupsQuery.data?.totalCount,
      subtitle: t('pages.dashboard.activeGroups'),
      route: ROUTES.groups,
      icon: 'users',
      colorScheme: 'amber',
      loading: groupsQuery.isPending,
    },
    {
      key: 'appointments',
      visible: canAppointments,
      title: t('pages.dashboard.totalAppointments'),
      count: appointmentsQuery.data?.totalCount,
      subtitle: t('pages.dashboard.scheduledAppointments'),
      route: ROUTES.appointments,
      icon: 'clock',
      colorScheme: 'blue',
      loading: appointmentsQuery.isPending,
    },
    {
      key: 'attendance',
      visible: canAttendance,
      title: t('pages.dashboard.totalAttendance'),
      count: attendanceQuery.data?.totalCount,
      subtitle: t('pages.dashboard.recordedAttendance'),
      route: ROUTES.attendance,
      icon: 'listChecks',
      colorScheme: 'emerald',
      loading: attendanceQuery.isPending,
    },
    {
      key: 'classrooms',
      visible: canClassrooms,
      title: t('pages.dashboard.totalClassrooms'),
      count: classroomsQuery.data?.totalCount,
      subtitle: t('pages.dashboard.availableClassrooms'),
      route: ROUTES.classrooms,
      icon: 'classroom',
      colorScheme: 'rose',
      loading: classroomsQuery.isPending,
    },
  ];

  const visibleStats = stats.filter((s) => s.visible);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {visibleStats.map(({ key, ...props }) => (
        <StatCard key={key} {...props} />
      ))}
    </div>
  );
}
