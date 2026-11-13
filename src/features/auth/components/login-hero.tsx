import { useTranslation } from 'react-i18next';

export function LoginHero(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-xl text-start select-none">
      <h1 className="font-semibold text-card text-3xl leading-[1.2] sm:text-4xl xl:text-[48px]">
        {t('auth.hero.titlePart1')},
        <span className="mt-2 block font-semibold text-card">{t('auth.hero.titlePart2')}</span>
      </h1>

      <div className="mt-7 space-y-2 text-card text-base leading-[1.5] sm:text-xl xl:text-[24px] font-normal">
        <p>{t('auth.hero.subtitle')}</p>
        <p>{t('auth.hero.tagline')}</p>
      </div>
    </div>
  );
}
