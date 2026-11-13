import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { Icon } from '@/shared/ui';
import { AuthLogo } from '@/features/auth/components/auth-logo';

const NAV_ITEMS = [
  { to: ROUTES.dashboard, labelKey: 'nav.dashboard', icon: 'menu' as const },
  { to: ROUTES.subjects, labelKey: 'nav.subjects', icon: 'bookOpen' as const },
  { to: ROUTES.teachers, labelKey: 'nav.teachers', icon: 'graduationCap' as const },
] as const;

export function AppLayout(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b bg-card p-4 md:border-e md:border-b-0">
        <div className="py-2">
          <AuthLogo variant="dark" size="md" showLeadingDot={true} />
        </div>
        <nav className="mt-5 space-y-1">
          {NAV_ITEMS.map(({ to, labelKey, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary ${
                  isActive ? 'bg-secondary font-medium text-primary' : 'text-foreground'
                }`
              }
            >
              <Icon name={icon} className="size-4 shrink-0" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
