import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';
import { ProtectedRoute } from './guards';
import { useAuthStore } from '@/shared/hooks';
import { ROUTES } from '@/shared/constants';
describe('ProtectedRoute', () => {
  beforeEach(() => useAuthStore.setState({ user: null, accessToken: null }));
  it('redirects guests to login', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.dashboard]}>
        <Routes>
          <Route
            path={ROUTES.dashboard}
            element={
              <ProtectedRoute>
                <p>Secret</p>
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.login} element={<p>Login</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
