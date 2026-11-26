import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PERMISSIONS } from '@/app/config';
import { ROUTES } from '@/shared/constants';
import { SYSTEM_TABS } from '@/features/system-management';
import { LoginPage, PasswordRecoveryPage } from '@/pages';
import { AppLayout } from '@/app/layouts';
import { RouteErrorBoundary } from '../error-boundary';
import { GuestRoute, ProtectedRoute } from './guards';
import { SimplePage } from './simple-page';

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.forgotPassword,
    element: <PasswordRecoveryPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/Login',
    element: <Navigate replace to={ROUTES.login} />,
  },
  {
    path: ROUTES.home,
    element: <Navigate replace to={ROUTES.login} />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: ROUTES.students,
        lazy: async () => {
          const { StudentsPage } = await import('@/pages/students-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.students.read}>
                <StudentsPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.contactUs,
        lazy: async () => {
          const { ContactUsPage } = await import('@/pages/contact-us-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.contactUs.read}>
                <ContactUsPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.appointments,
        lazy: async () => {
          const { AppointmentsPage } = await import('@/pages/appointments-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.appointments.read}>
                <AppointmentsPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.groups,
        lazy: async () => {
          const { GroupsPage } = await import('@/pages/groups-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.groups.read}>
                <GroupsPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.attendance,
        lazy: async () => {
          const { AttendancePage } = await import('@/pages/attendance-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.attendance.read}>
                <AttendancePage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.notifications,
        lazy: async () => {
          const { NotificationsPage } = await import('@/pages/notifications-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.notifications.read}>
                <NotificationsPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.systemManagement,
        lazy: async () => {
          const { SystemManagementPage } = await import('@/pages/system-management-page');
          return {
            Component: () => (
              <ProtectedRoute anyPermissions={SYSTEM_TABS.map((tab) => tab.read)}>
                <SystemManagementPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.classrooms,
        lazy: async () => {
          const { ClassroomsPage } = await import('@/pages/classrooms-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.classrooms.read}>
                <ClassroomsPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.profile,
        lazy: async () => ({ Component: (await import('@/pages/profile-page')).ProfilePage }),
      },
      {
        path: ROUTES.roles,
        lazy: async () => {
          const { RolesPage } = await import('@/pages/roles-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.roles.read}>
                <RolesPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.employees,
        lazy: async () => {
          const { EmployeesPage } = await import('@/pages/employees-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.employees.read}>
                <EmployeesPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.dashboard,
        lazy: async () => {
          const { DashboardPage } = await import('@/pages/dashboard-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.dashboard.read}>
                <DashboardPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.subjects,
        lazy: async () => {
          const { SubjectsPage } = await import('@/pages/subjects-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.subjects.read}>
                <SubjectsPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.teachers,
        lazy: async () => {
          const { TeachersPage } = await import('@/pages/teachers-page');
          return {
            Component: () => (
              <ProtectedRoute permission={PERMISSIONS.teachers.read}>
                <TeachersPage />
              </ProtectedRoute>
            ),
          };
        },
      },
    ],
  },
  { path: ROUTES.forbidden, element: <SimplePage translationKey="pages.forbidden.title" /> },
  { path: '*', element: <Navigate replace to={ROUTES.login} /> },
]);
