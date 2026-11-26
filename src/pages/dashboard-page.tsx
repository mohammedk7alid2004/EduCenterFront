import {
  DashboardBanner,
  DashboardStatsGrid,
  DashboardUpcomingAppointments,
  DashboardAttendanceSummary,
  DashboardGroupsCapacity,
  DashboardSectionsNav,
} from '@/features/dashboard';

export function DashboardPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* 1. Header Banner & Welcome */}
      <DashboardBanner />

      {/* 2. Key Metrics & KPI Summary Cards */}
      <DashboardStatsGrid />

      {/* 3. Operational Insights: Schedule & Attendance Side-by-Side */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <DashboardUpcomingAppointments />
        <DashboardAttendanceSummary />
      </div>

      {/* 4. Groups Capacity Overview */}
      <DashboardGroupsCapacity />

      {/* 5. Refined Management Sections & Quick Navigation */}
      <DashboardSectionsNav />
    </div>
  );
}
