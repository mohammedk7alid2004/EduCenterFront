import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/config';
import { LoginPage, PasswordRecoveryPage } from '@/features/auth';
import { AppLayout } from '../layouts/app-layout';
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
        path: ROUTES.dashboard,
        lazy: async () => ({ Component: (await import('@/features/dashboard')).DashboardPage }),
      },
      {
        path: ROUTES.subjects,
        lazy: async () => ({ Component: (await import('@/features/subjects')).SubjectsPage }),
      },
      {
        path: ROUTES.teachers,
        lazy: async () => ({ Component: (await import('@/features/teachers')).TeachersPage }),
      },
    ],
  },
  { path: ROUTES.forbidden, element: <SimplePage translationKey="pages.forbidden.title" /> },
  { path: '*', element: <Navigate replace to={ROUTES.login} /> },
]);
