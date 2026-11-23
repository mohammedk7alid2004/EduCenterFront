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
  loading: boolean;
}

function StatCard({ title, count, subtitle, route, icon, loading }: StatCardProps): JSX.Element {
  return (
    <Link
      to={route}
      className="group flex min-h-36 flex-col justify-between rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon name={icon} className="size-5" />
        </span>
        <Icon name="arrowRight" className="size-4 text-muted rtl:rotate-180" />
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
      loading: classroomsQuery.isPending,
    },
  ];

  const visibleStats = stats.filter((s) => s.visible);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {visibleStats.map(({ key, ...props }) => (
        <StatCard key={key} {...props} />
      ))}
    </div>
  );
}
