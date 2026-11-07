import { useTranslation } from 'react-i18next';

export function SimplePage({ translationKey }: { translationKey: string }): JSX.Element {
  const { t } = useTranslation();
  return (
    <main className="grid min-h-screen place-items-center">
      <h1 className="text-2xl font-bold">{t(translationKey)}</h1>
    </main>
  );
}
