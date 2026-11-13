import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/config';
import { DashboardPage } from '@/features/dashboard';
import { LoginPage, PasswordRecoveryPage } from '@/features/auth';
import { SubjectsPage } from '@/features/subjects';
import { TeachersPage } from '@/features/teachers';
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
      { path: ROUTES.dashboard, element: <DashboardPage /> },
      { path: ROUTES.subjects, element: <SubjectsPage /> },
      { path: ROUTES.teachers, element: <TeachersPage /> },
    ],
  },
  { path: ROUTES.forbidden, element: <SimplePage translationKey="pages.forbidden.title" /> },
  { path: '*', element: <Navigate replace to={ROUTES.login} /> },
]);
