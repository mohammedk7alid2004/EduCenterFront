import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS, ROUTES, SIDEBAR_GROUP, type IconName } from '@/config';
import { usePermission } from '@/infrastructure/auth';
import { SYSTEM_TABS, useCenterBrand } from '@/features/system-management';
import { Icon } from '@/shared/components';
export function DashboardSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const location = useLocation();
  const can = usePermission();
  const brand = useCenterBrand();
  const isSystem =
    location.pathname.startsWith(ROUTES.roles) || location.pathname.startsWith(ROUTES.employees);
  const [openGroup, setOpenGroup] = useState<string | null>(
    isSystem ? SIDEBAR_GROUP.system : SIDEBAR_GROUP.schedule,
  );
  useEffect(() => {
    setOpenGroup(isSystem ? SIDEBAR_GROUP.system : SIDEBAR_GROUP.schedule);
  }, [isSystem]);
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
        <div className="flex h-[125px] shrink-0 items-start justify-center pt-6">
          <img
            src={brand.data?.navbarLogoUrl || '/logo-3m2a.svg'}
            alt={t('app.logo')}
            width={179}
            height={85}
            className="h-[85px] w-[179px] object-contain"
          />
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={onClose}
            className="absolute end-3 top-3 lg:hidden"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <nav
          aria-label={t('common.mainNavigation')}
          className="space-y-[7px] px-[21px] pb-8 text-base"
        >
          <NavLink
            to={ROUTES.dashboard}
            onClick={onClose}
            className="flex h-12 items-center gap-3 rounded-xl px-2 text-card hover:bg-card/5"
          >
            <Icon name="home" className="size-5" />
            {t('nav.dashboard')}
          </NavLink>
          <SidebarSection
            title={t('nav.schedule')}
            icon="schedule"
            expanded={openGroup === SIDEBAR_GROUP.schedule}
            onToggle={() =>
              setOpenGroup(openGroup === SIDEBAR_GROUP.schedule ? null : SIDEBAR_GROUP.schedule)
            }
          >
            {can(PERMISSIONS.appointments.read) && (
              <SidebarLink
                route={ROUTES.appointments}
                icon="clock"
                label={t('nav.appointments')}
                onClick={onClose}
              />
            )}
            <SidebarLink
              route={ROUTES.teachers}
              icon="teacher"
              label={t('nav.teachers')}
              onClick={onClose}
            />
            {can(PERMISSIONS.groups.read) && (
              <SidebarLink
                route={ROUTES.groups}
                icon="users"
                label={t('nav.groups')}
                onClick={onClose}
              />
            )}
            <SidebarLink
              route={ROUTES.subjects}
              icon="graduationCap"
              label={t('nav.subjects')}
              onClick={onClose}
            />
            <SidebarLink
              route={ROUTES.classrooms}
              icon="classroom"
              label={t('nav.classrooms')}
              onClick={onClose}
            />
          </SidebarSection>
          {can(PERMISSIONS.students.read) && (
            <NavLink
              to={ROUTES.students}
              onClick={onClose}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-xl px-2 ${isActive ? 'bg-card text-primary' : 'text-card hover:bg-card/5'}`
              }
            >
              <Icon name="students" className="size-5 shrink-0" />
              {t('nav.students')}
            </NavLink>
          )}
          {can(PERMISSIONS.attendance.read) && (
            <NavLink
              to={ROUTES.attendance}
              onClick={onClose}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-xl px-2 ${isActive ? 'bg-card text-primary' : 'text-card hover:bg-card/5'}`
              }
            >
              <Icon name="schedule" className="size-5 shrink-0" />
              {t('nav.attendance')}
            </NavLink>
          )}

          {(can(PERMISSIONS.roles.read) || can(PERMISSIONS.employees.read)) && (
            <SidebarSection
              title={t('nav.access')}
              icon="system"
              expanded={openGroup === SIDEBAR_GROUP.system}
              onToggle={() =>
                setOpenGroup(openGroup === SIDEBAR_GROUP.system ? null : SIDEBAR_GROUP.system)
              }
            >
              {can(PERMISSIONS.roles.read) && (
                <SidebarLink
                  route={ROUTES.roles}
                  icon="permission"
                  label={t('nav.roles')}
                  onClick={onClose}
                />
              )}
              {can(PERMISSIONS.employees.read) && (
                <SidebarLink
                  route={ROUTES.employees}
                  icon="users"
                  label={t('nav.employees')}
                  onClick={onClose}
                />
              )}
            </SidebarSection>
          )}
          {can(PERMISSIONS.contactUs.read) && (
            <NavLink
              to={ROUTES.contactUs}
              onClick={onClose}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-xl px-2 ${isActive ? 'bg-card text-primary' : 'text-card hover:bg-card/5'}`
              }
            >
              <Icon name="contactUs" className="size-5" />
              {t('nav.contactUs')}
            </NavLink>
          )}
          {SYSTEM_TABS.some((tab) => can(tab.read)) && (
            <NavLink
              to={ROUTES.systemManagement}
              onClick={onClose}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-xl px-2 text-sm ${isActive ? 'bg-subtle text-primary' : 'text-card hover:bg-card/5'}`
              }
            >
              <Icon name="building" className="size-5 shrink-0" />
              {t('nav.system')}
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
}
function SidebarSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: IconName;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <div
      className={`-me-[21px] relative rounded-s-[18px] transition ${expanded ? 'schedule-panel bg-subtle pb-4 text-primary' : 'text-card'}`}
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="flex h-[54px] w-full items-center justify-between gap-2 pe-1 ps-2 text-[15px]"
      >
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Icon name={icon} className="size-5 shrink-0" />
          {title}
        </span>
        <Icon
          name={expanded ? 'chevronDown' : 'chevronRight'}
          className="size-4 shrink-0 rtl:rotate-180"
        />
      </button>
      {expanded && <div className="space-y-1 pe-1 ps-[18px]">{children}</div>}
    </div>
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
      className="flex h-11 items-center gap-3 rounded-xl pe-0 text-sm text-primary"
    >
      {({ isActive }) => (
        <>
          <span
            className={`size-2 shrink-0 rounded-full ${isActive ? 'bg-primary' : 'bg-primary/25'}`}
          />
          <span
            className={`-ms-1 flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 ${isActive ? 'bg-primary text-card' : 'hover:bg-primary/5'}`}
          >
            <Icon name={icon} className="size-5 shrink-0" />
            <span className="truncate" title={label}>
              {label}
            </span>
          </span>
        </>
      )}
    </NavLink>
  );
}
