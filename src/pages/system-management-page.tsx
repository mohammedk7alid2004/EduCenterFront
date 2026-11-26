import { useEffect, useRef } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/shared/constants';
import { usePermission } from '@/shared/hooks';
import { useOnline } from '@/shared/hooks';
import { Icon } from '@/shared/components';
import {
  SYSTEM_TAB_GROUPS,
  SYSTEM_TAB_PARAM,
  SYSTEM_TABS,
  CenterPanel,
  ContentPanel,
  SocialPanel,
  FaqPanel,
} from '@/features/system-management';
import type { SystemTab } from '@/features/system-management';

export function SystemManagementPage(): JSX.Element {
  const { t } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const [params, setParams] = useSearchParams();
  const allowed = SYSTEM_TABS.filter((tab) => can(tab.read));
  const active = allowed.find((tab) => tab.key === params.get(SYSTEM_TAB_PARAM)) ?? allowed[0];

  if (!active) return <Navigate to={ROUTES.forbidden} replace />;

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6 pb-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            to={ROUTES.dashboard}
            aria-label={t('common.back')}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-iconSurface text-primary transition hover:bg-primary/15"
          >
            <Icon name="arrowLeft" className="size-6 rtl:rotate-180" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold leading-9 text-foreground">
                {t('nav.system')}
              </h1>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {t(`systemManagement.tabs.${active.key}`)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{t('systemManagement.description')}</p>
          </div>
        </div>
      </div>

      {!online && (
        <p role="status" className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm">
          {t('errors.network')}
        </p>
      )}

      {/* Settings Master-Detail Layout */}
      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-72">
          <SystemNav
            tabs={allowed}
            active={active}
            onChange={(tab) => setParams({ [SYSTEM_TAB_PARAM]: tab.key })}
          />
        </aside>

        <main className="w-full min-w-0 flex-1" key={active.key}>
          {active.key === 'center' ? (
            <CenterPanel tab={active} />
          ) : active.key === 'social' ? (
            <SocialPanel tab={active} />
          ) : active.key === 'faq' ? (
            <FaqPanel />
          ) : (
            <ContentPanel tab={active} />
          )}
        </main>
      </div>
    </section>
  );
}

function SystemNav({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly SystemTab[];
  active: SystemTab;
  onChange: (tab: SystemTab) => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const current = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    current.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [active.key, i18n.language]);

  return (
    <>
      {/* Mobile Horizontal Tabs */}
      <nav
        aria-label={t('nav.system')}
        className="flex max-w-full shrink-0 gap-2 overflow-x-auto rounded-2xl border border-border/80 bg-card p-2 shadow-2xs lg:hidden"
      >
        {tabs.map((tab) => {
          const isActive = active.key === tab.key;
          return (
            <button
              key={tab.key}
              ref={isActive ? current : undefined}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onChange(tab)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                isActive
                  ? 'bg-primary text-card shadow-xs'
                  : 'text-muted hover:bg-subtle hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} className="size-4" />
              {t(`systemManagement.tabs.${tab.key}`)}
            </button>
          );
        })}
      </nav>

      {/* Desktop Vertical Sidebar */}
      <nav
        aria-label={t('nav.system')}
        className="hidden w-full flex-col gap-5 rounded-2xl border border-border/80 bg-card p-3 shadow-xs lg:flex"
      >
        {SYSTEM_TAB_GROUPS.map((group) => {
          const groupTabs = tabs.filter((tab) =>
            (group.tabKeys as readonly string[]).includes(tab.key),
          );
          if (groupTabs.length === 0) return null;

          return (
            <div key={group.key} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {t(`systemManagement.groups.${group.key}`)}
              </p>
              {groupTabs.map((tab) => {
                const isActive = active.key === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onChange(tab)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-primary text-card shadow-xs'
                        : 'text-foreground/80 hover:bg-subtle hover:text-primary'
                    }`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-lg transition ${
                        isActive ? 'bg-card/20 text-card' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Icon name={tab.icon} className="size-4" />
                    </span>
                    <span className="truncate">{t(`systemManagement.tabs.${tab.key}`)}</span>
                    {isActive && (
                      <Icon
                        name="chevronRight"
                        className="ms-auto size-3.5 text-card/80 rtl:rotate-180"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
    </>
  );
}
