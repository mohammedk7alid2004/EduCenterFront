import { useEffect, useRef } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { usePermission } from '@/core/auth';
import { useOnline } from '@/shared/lib';
import { Icon } from '@/shared/ui';
import { SYSTEM_TAB_PARAM, SYSTEM_TABS, type SystemTab } from './system-management.constants';
import { CenterPanel } from './components/center-panel';
import { ContentPanel } from './components/content-panel';
import { SocialPanel } from './components/social-panel';
import { FaqPanel } from './components/faq-panel';
export function SystemManagementPage(): JSX.Element {
  const { t } = useTranslation();
  const can = usePermission();
  const online = useOnline();
  const [params, setParams] = useSearchParams();
  const allowed = SYSTEM_TABS.filter((tab) => can(tab.read));
  const active = allowed.find((tab) => tab.key === params.get(SYSTEM_TAB_PARAM)) ?? allowed[0];
  if (!active) return <Navigate to={ROUTES.forbidden} replace />;
  const tabs = (
    <SystemTabs
      tabs={allowed}
      active={active}
      onChange={(tab) => setParams({ [SYSTEM_TAB_PARAM]: tab.key })}
    />
  );
  if (active.key === 'faq') return <FaqPanel tabs={tabs} />;
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-6 pb-6">
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.dashboard}
          aria-label={t('common.back')}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-iconSurface text-primary"
        >
          <Icon name="arrowLeft" className="size-6 rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold leading-9">{t('nav.system')}</h1>
          <p className="text-xs text-muted">{t('systemManagement.description')}</p>
        </div>
      </div>
      {tabs}
      {!online && (
        <p role="status" className="rounded-xl bg-warning/10 p-3 text-sm">
          {t('errors.network')}
        </p>
      )}
      <div key={active.key}>
        {active.key === 'center' ? (
          <CenterPanel tab={active} />
        ) : active.key === 'social' ? (
          <SocialPanel tab={active} />
        ) : (
          <ContentPanel tab={active} />
        )}
      </div>
    </section>
  );
}
function SystemTabs({
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
    <nav
      aria-label={t('nav.system')}
      className="flex max-w-full shrink-0 gap-2 overflow-x-auto rounded-full bg-permissionSurface p-1.5 shadow-sm"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          ref={active.key === tab.key ? current : undefined}
          type="button"
          aria-current={active.key === tab.key ? 'page' : undefined}
          onClick={() => onChange(tab)}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-3 text-sm font-medium transition ${active.key === tab.key ? 'bg-primary text-card' : 'text-primary hover:bg-primary/10'}`}
        >
          <Icon name={tab.icon} className="size-5" />
          {t(`systemManagement.tabs.${tab.key}`)}
        </button>
      ))}
    </nav>
  );
}
