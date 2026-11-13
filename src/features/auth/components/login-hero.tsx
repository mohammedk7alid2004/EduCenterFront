import { useTranslation } from 'react-i18next';

export function LoginHero(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-xl text-start select-none">
      <h1 className="font-semibold text-white text-[48px] leading-[1.2]">
        {t('auth.hero.titlePart1')},
        <span className="mt-2 block font-semibold text-white">{t('auth.hero.titlePart2')}</span>
      </h1>

      <div className="mt-7 space-y-2 text-white text-[24px] leading-[1.5] font-normal">
        <p>{t('auth.hero.subtitle')}</p>
        <p>{t('auth.hero.tagline')}</p>
      </div>
    </div>
  );
}
