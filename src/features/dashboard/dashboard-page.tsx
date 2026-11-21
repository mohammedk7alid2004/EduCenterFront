import { DashboardBanner } from './components/dashboard-banner';
import { DashboardStatsGrid } from './components/dashboard-stats-grid';
import { DashboardUpcomingAppointments } from './components/dashboard-upcoming-appointments';
import { DashboardAttendanceSummary } from './components/dashboard-attendance-summary';
import { DashboardGroupsCapacity } from './components/dashboard-groups-capacity';
import { DashboardSectionsNav } from './components/dashboard-sections-nav';

export function DashboardPage(): JSX.Element {
  return (
    <section className="space-y-7 pb-10">
      {/* 1. Header Banner & Welcome */}
      <DashboardBanner />

      {/* 2. Key Metrics & KPI Summary Cards */}
      <DashboardStatsGrid />

      {/* 3. Deep Analytics & Operational Insights */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Side: Upcoming Sessions & Group Occupancy */}
        <div className="space-y-6 lg:col-span-7">
          <DashboardUpcomingAppointments />
          <DashboardGroupsCapacity />
        </div>

        {/* Right Side: Attendance Rate & Recent Activity */}
        <div className="lg:col-span-5">
          <DashboardAttendanceSummary />
        </div>
      </div>

      {/* 4. Refined Management Sections & Quick Navigation */}
      <DashboardSectionsNav />
    </section>
  );
}
