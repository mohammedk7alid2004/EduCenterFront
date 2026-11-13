import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { useLogout } from '@/features/auth';
import { useAuthStore } from '@/core/auth';
import { setLanguage } from '@/core/i18n';
import { Icon } from '@/shared/ui';
export function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }): JSX.Element {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const [profileOpen, setProfileOpen] = useState(false);
  const arabic = i18n.language.startsWith('ar');
  const section = location.pathname.startsWith(ROUTES.teachers)
    ? 'teachers'
    : location.pathname.startsWith(ROUTES.subjects)
      ? 'subjects'
      : 'dashboard';
  return (
    <header className="dashboard-header relative flex min-h-[77px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <button
          type="button"
          aria-label={t('common.toggleNavigation')}
          onClick={onMenuClick}
          className="text-primary lg:pointer-events-none"
        >
          <Icon name="panel" className="size-6" />
        </button>
        <span className="hidden sm:inline">
          {t(section === 'dashboard' ? 'nav.dashboard' : 'nav.schedule')}
        </span>
        <Icon name="chevronRight" className="size-4 text-primary rtl:rotate-180" />
        <span className="font-semibold text-primary">{t(`nav.${section}`)}</span>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          type="button"
          onClick={() => setLanguage(arabic ? 'en' : 'ar')}
          aria-label={t('common.changeLanguage')}
          className="header-control flex h-10 w-[87px] items-center justify-center gap-3 rounded-[10px] bg-card px-3.5 text-xs"
        >
          <img
            src={arabic ? '/images/dashboard/language-ar.svg' : '/images/dashboard/language-en.png'}
            alt=""
            className="h-5 w-8 rounded-sm object-cover"
          />
          <span>{arabic ? 'AR' : 'EN'}</span>
        </button>
        <span
          title={t('common.notifications')}
          className="header-control -ms-2 flex h-[34px] w-[52px] items-center justify-center rounded-[10px] bg-card"
        >
          <img
            src="/images/dashboard/notification.png"
            alt=""
            className="h-[30px] w-[34px] object-contain"
          />
        </span>
        <div className="relative">
          <button
            type="button"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(!profileOpen)}
            className="header-control flex h-[45px] items-center gap-1.5 rounded-xl bg-card px-3 sm:w-[181px]"
          >
            <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden min-w-0 flex-1 text-start sm:block">
              <span className="block truncate text-xs font-medium">{user?.name}</span>
              <span className="block text-[10px] text-muted">
                {user?.roleName
                  ? t(`roles.${user.roleName.toLowerCase()}`, { defaultValue: user.roleName })
                  : user?.roles
                      .map((role) => t(`roles.${role}`, { defaultValue: role }))
                      .join(', ')}
              </span>
            </span>
            <Icon name="chevronDown" className="size-3" />
          </button>
          {profileOpen && (
            <div className="absolute end-0 top-full z-20 mt-2 min-w-40 rounded-xl border border-border bg-card p-2 shadow-lg">
              <button
                type="button"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-danger hover:bg-danger/10"
              >
                <Icon name="logout" className="size-4" />
                {logout.isPending ? t('common.loading') : t('common.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
