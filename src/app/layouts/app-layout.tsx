import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { Icon } from '@/shared/ui';
import { AuthLogo } from '@/features/auth/components/auth-logo';
import { useAuthStore } from '@/core/auth/auth-store';

export function AppLayout(): JSX.Element {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [scheduleOpen, setScheduleOpen] = useState(true);

  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';

  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    void i18n.changeLanguage(nextLang);
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  // Determine current breadcrumb
  const isTeachers = location.pathname.startsWith(ROUTES.teachers);
  const isSubjects = location.pathname.startsWith(ROUTES.subjects);
  const isDashboard = location.pathname === ROUTES.dashboard;

  const currentSectionName = isTeachers
    ? t('nav.teachers')
    : isSubjects
      ? t('nav.subjects')
      : isDashboard
        ? t('nav.dashboard')
        : 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[#0A2624] text-slate-800 font-sans">
      {/* Sidebar - Exact Figma Dark Emerald Style */}
      <aside className="w-72 shrink-0 flex flex-col bg-[#0F3D3A] text-white select-none">
        {/* Logo at Top Left - Exact Figma 3M2A Vector */}
        <div className="px-6 pt-7 pb-6">
          <AuthLogo variant="white" size="lg" showLeadingDot={true} />
        </div>

        {/* Navigation List with Figma Scroll Styling */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 text-[13px] font-medium text-white/80 scrollbar-thin">
          {/* Dashboard */}
          <NavLink
            to={ROUTES.dashboard}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition ${
                isActive
                  ? 'bg-white/15 text-white font-semibold'
                  : 'hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon name="dashboard" className="size-4 shrink-0 text-white/90" />
            <span>{t('nav.dashboard')}</span>
          </NavLink>

          {/* Schedule Management (Collapsible with Figma submenu box) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setScheduleOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-white/90 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <Icon name="menu" className="size-4 shrink-0 text-white/90" />
                <span className="font-semibold text-white">
                  {lang === 'ar' ? 'إدارة الجدول' : 'Schedule Management'}
                </span>
              </div>
              <Icon
                name={scheduleOpen ? 'chevronUp' : 'chevronDown'}
                className="size-4 text-white/60"
              />
            </button>

            {/* Submenu white container card matching Figma exactly */}
            {scheduleOpen && (
              <div className="mt-2 mx-1 rounded-2xl bg-[#EBE4DB] p-2 space-y-1 text-slate-700 shadow-inner">
                {/* Appointments (Placeholder) */}
                <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 rounded-xl hover:bg-black/5 cursor-pointer">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  <Icon name="menu" className="size-3.5 text-slate-500" />
                  <span>{lang === 'ar' ? 'المواعيد' : 'Appointments'}</span>
                </div>

                {/* Teachers */}
                <NavLink
                  to={ROUTES.teachers}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition ${
                      isActive
                        ? 'bg-[#0F3D3A] text-white font-semibold shadow-sm'
                        : 'text-slate-700 hover:bg-black/5'
                    }`
                  }
                >
                  <span
                    className={`size-1.5 rounded-full ${isTeachers ? 'bg-accent' : 'bg-slate-400'}`}
                  />
                  <Icon name="graduationCap" className="size-3.5" />
                  <span>{t('nav.teachers')}</span>
                </NavLink>

                {/* Groups (Placeholder) */}
                <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 rounded-xl hover:bg-black/5 cursor-pointer">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  <Icon name="users" className="size-3.5 text-slate-500" />
                  <span>{lang === 'ar' ? 'المجموعات' : 'Groups'}</span>
                </div>

                {/* Subjects */}
                <NavLink
                  to={ROUTES.subjects}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition ${
                      isActive
                        ? 'bg-[#0F3D3A] text-white font-semibold shadow-sm'
                        : 'text-slate-700 hover:bg-black/5'
                    }`
                  }
                >
                  <span
                    className={`size-1.5 rounded-full ${isSubjects ? 'bg-accent' : 'bg-slate-400'}`}
                  />
                  <Icon name="bookOpen" className="size-3.5" />
                  <span>{t('nav.subjects')}</span>
                </NavLink>

                {/* Classrooms (Placeholder) */}
                <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 rounded-xl hover:bg-black/5 cursor-pointer">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  <Icon name="menu" className="size-3.5 text-slate-500" />
                  <span>{lang === 'ar' ? 'الفصول والقاعات' : 'Classrooms'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Decorative Navigation Items matching Figma Sidebar */}
          <div className="pt-3 space-y-1">
            {[
              { labelAr: 'إدارة المصروفات', labelEn: 'Expenses Management' },
              { labelAr: 'إدارة المشتريات', labelEn: 'Purchases Management' },
              { labelAr: 'إدارة المقالات', labelEn: 'Blogs Management' },
              { labelAr: 'البيانات الجغرافية', labelEn: 'Geographic Data' },
              { labelAr: 'العملات', labelEn: 'Currency' },
              { labelAr: 'الخدمات', labelEn: 'Services' },
              { labelAr: 'اتصل بنا', labelEn: 'Contact Us' },
              { labelAr: 'الإعدادات العامة', labelEn: 'General Setting' },
              { labelAr: 'الصلاحيات', labelEn: 'Permission' },
              { labelAr: 'إدارة الطلبات', labelEn: 'Orders Management' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer text-xs"
              >
                <span className="size-1.5 rounded-full bg-white/40" />
                <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <Icon name="logout" className="size-4 shrink-0" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - In Figma: An Elegant White Card with Rounded Corners */}
      <div className="flex-1 flex flex-col p-3 sm:p-5 overflow-x-hidden">
        <div className="flex-1 rounded-[28px] bg-white shadow-2xl flex flex-col overflow-hidden border border-slate-200/60">
          {/* Top Header - Matching Figma Frame 223:19367 Exactly */}
          <header className="h-18 px-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            {/* Breadcrumb matching Figma */}
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
              <Icon name="menu" className="size-4 text-slate-400" />
              <span>{lang === 'ar' ? 'إدارة الجدول' : 'Schedule Management'}</span>
              <span>&gt;</span>
              <span className="text-[#0F3D3A] font-semibold">{currentSectionName}</span>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-4">
              {/* Language Switcher Pill */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              >
                <Icon name="globe" className="size-3.5 text-slate-500" />
                <span className="uppercase">{lang === 'ar' ? 'English' : 'عربي'}</span>
              </button>

              {/* 3D Golden Bell Notification Icon with Badge 20 */}
              <div className="relative flex size-9 items-center justify-center rounded-full bg-[#0F3D3A] text-accent shadow-xs cursor-pointer">
                <Icon name="bell" className="size-4 text-[#F4B13B]" />
                <span className="absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-[#E0745E] text-[9px] font-bold text-white shadow-xs">
                  20
                </span>
              </div>

              {/* User Profile matching Figma Mahmoud Alaa Super Admin */}
              <div className="flex items-center gap-2.5 ps-2 border-s border-slate-100">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#0F3D3A]/10 border border-[#0F3D3A]/20 text-xs font-bold text-[#0F3D3A]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="hidden sm:block text-start leading-tight">
                  <p className="text-xs font-bold text-slate-800">{user?.name || 'Mahmoud Alaa'}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Super Admin</p>
                </div>
                <Icon name="chevronDown" className="size-3 text-slate-400" />
              </div>
            </div>
          </header>

          {/* Page Content View */}
          <main className="flex-1 p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
