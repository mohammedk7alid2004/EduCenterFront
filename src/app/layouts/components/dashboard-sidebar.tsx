import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES, type IconName } from '@/config';
import { Icon } from '@/shared/ui';
import { AuthLogo } from '@/features/auth';
export function DashboardSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const [scheduleOpen, setScheduleOpen] = useState(true);
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={t('common.close')}
          onClick={onClose}
          className="fixed inset-0 z-30 bg-overlay/50 lg:hidden"
        />
      )}
      <aside
        className={`${open ? 'flex' : 'hidden'} fixed inset-y-0 start-0 z-40 w-[265px] shrink-0 flex-col overflow-y-auto bg-primary text-card lg:sticky lg:top-0 lg:flex lg:h-dvh`}
      >
        <div className="flex h-[125px] shrink-0 items-center justify-center px-6">
          <AuthLogo variant="white" size="xl" />
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={onClose}
            className="absolute end-3 top-3 lg:hidden"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <nav aria-label={t('common.mainNavigation')} className="space-y-4 px-5 pb-8 text-sm">
          <NavLink
            to={ROUTES.dashboard}
            onClick={onClose}
            className={({ isActive }) =>
              `flex h-12 items-center gap-3 rounded-xl px-2 ${isActive ? 'bg-card/10 text-card' : 'text-card/80 hover:bg-card/5'}`
            }
          >
            <Icon name="home" className="size-5" />
            {t('nav.dashboard')}
          </NavLink>
          <div
            className={`-me-5 rounded-s-[22px] transition ${scheduleOpen ? 'bg-subtle pb-3 text-primary' : 'text-card/80'}`}
          >
            <button
              type="button"
              aria-expanded={scheduleOpen}
              onClick={() => setScheduleOpen(!scheduleOpen)}
              className="flex h-[54px] w-full items-center justify-between gap-2 pe-5 ps-2"
            >
              <span className="flex items-center gap-2">
                <Icon name="calendar" className="size-5" />
                {t('nav.schedule')}
              </span>
              <Icon name={scheduleOpen ? 'chevronDown' : 'chevronUp'} className="size-4" />
            </button>
            {scheduleOpen && (
              <div className="space-y-1 pe-1 ps-4">
                <SidebarLink
                  route={ROUTES.teachers}
                  icon="graduationCap"
                  label={t('nav.teachers')}
                  onClick={onClose}
                />
                <SidebarLink
                  route={ROUTES.subjects}
                  icon="bookOpen"
                  label={t('nav.subjects')}
                  onClick={onClose}
                />
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
function SidebarLink({
  route,
  icon,
  label,
  onClick,
}: {
  route: string;
  icon: IconName;
  label: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <NavLink
      to={route}
      onClick={onClick}
      className={({ isActive }) =>
        `flex h-11 items-center gap-3 rounded-xl pe-3 ${isActive ? 'font-medium text-primary' : 'text-primary/80'}`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`size-2 shrink-0 rounded-full ${isActive ? 'bg-primary' : 'bg-primary/25'}`}
          />
          <span
            className={`-ms-1 flex h-11 flex-1 items-center gap-3 rounded-xl px-3 ${isActive ? 'bg-primary text-card' : 'hover:bg-primary/5'}`}
          >
            <Icon name={icon} className="size-5 shrink-0" />
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
