import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { useAuthStore } from '@/core/auth';
import { Icon } from '@/shared/ui';
const sections = [
  { key: 'teachers', route: ROUTES.teachers, icon: 'graduationCap' },
  { key: 'subjects', route: ROUTES.subjects, icon: 'bookOpen' },
] as const;
export function DashboardPage(): JSX.Element {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  return (
    <section className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-semibold">
          {t('pages.dashboard.welcome', { name: user?.name })}
        </h1>
        <p className="mt-2 text-sm text-muted">{t('pages.dashboard.intro')}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.key}
            to={section.route}
            className="group rounded-3xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm"
          >
            <span className="mb-5 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon name={section.icon} className="size-6" />
            </span>
            <h2 className="text-lg font-semibold">{t(`nav.${section.key}`)}</h2>
            <p className="mt-2 text-sm text-muted">
              {t(`pages.dashboard.${section.key}Description`)}
            </p>
            <span className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
              {t('pages.dashboard.open')}
              <Icon
                name="arrowRight"
                className="size-4 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
