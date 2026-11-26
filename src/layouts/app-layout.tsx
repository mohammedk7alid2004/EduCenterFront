import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './components/dashboard-sidebar';
import { DashboardHeader } from './components/dashboard-header';
export function AppLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-primary text-foreground lg:flex lg:h-dvh lg:overflow-hidden">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1 p-3 lg:flex lg:h-full lg:flex-col lg:py-[33px] lg:pe-6 lg:ps-0">
        <div className="flex min-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[32px] bg-subtle lg:h-full lg:min-h-0">
          <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex min-w-0 flex-1 flex-col px-4 pt-6 sm:px-6 lg:overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
