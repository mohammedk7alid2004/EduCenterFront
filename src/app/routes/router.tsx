import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/config';
import { DashboardPage } from '@/features/dashboard';
import { LoginPage } from '@/features/auth';
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
    children: [{ path: ROUTES.dashboard, element: <DashboardPage /> }],
  },
  { path: ROUTES.forbidden, element: <SimplePage translationKey="pages.forbidden.title" /> },
  { path: '*', element: <Navigate replace to={ROUTES.login} /> },
]);
