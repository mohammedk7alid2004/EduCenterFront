import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { ErrorState, Icon, LoadingState } from '@/shared/components';
import { useProfile } from './profile.queries';
import { PROFILE_GENDER_OPTIONS, PROFILE_TAB } from './profile.constants';
import { ProfileAvatar } from './components/profile-avatar';
import { ProfileForm } from './components/profile-form';
import { ChangePasswordForm } from './components/change-password-form';

export function ProfilePage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useProfile();
  const [tab, setTab] = useState<(typeof PROFILE_TAB)[keyof typeof PROFILE_TAB]>(PROFILE_TAB.info);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [imageError, setImageError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePreviewChange = useCallback((url: string | undefined, error?: string) => {
    setPreviewUrl(url);
    setImageError(error);
  }, []);

  const profile = query.data;
  const genderOption = profile
    ? PROFILE_GENDER_OPTIONS.find(
        (option) => option.id.toLowerCase() === profile.gender.toLowerCase(),
      )
    : undefined;

  return (
    <section className="flex flex-1 flex-col gap-6 pb-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={t('common.back')}
          onClick={() => navigate(ROUTES.dashboard)}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-iconSurface text-primary transition hover:bg-primary/15"
        >
          <Icon name="arrowLeft" className="size-6 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold leading-9">{t('profile.title')}</h1>
          <p className="mt-0.5 text-xs leading-[18px] text-muted">{t('profile.description')}</p>
        </div>
      </div>

      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : profile ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[290px_1fr]">
          {/* Summary Sidebar Card */}
          <aside className="rounded-3xl border border-border/40 bg-card p-6 text-center shadow-sm">
            <div className="relative mx-auto w-fit rounded-3xl border-t-4 border-primary bg-subtle p-3">
              <ProfileAvatar
                rounded
                name={profile.fullName}
                imageUrl={previewUrl ?? profile.imageUrl}
                className="size-44 text-5xl"
              />
              {tab === PROFILE_TAB.info && (
                <button
                  type="button"
                  aria-label={t('profile.chooseImage')}
                  title={t('profile.chooseImage')}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -end-2 grid size-9 place-items-center rounded-full border border-border bg-card text-primary shadow-md transition hover:bg-primary hover:text-card"
                >
                  <Icon name="pencil" className="size-4" />
                </button>
              )}
            </div>
            {imageError && <p className="mt-3 text-xs text-danger">{imageError}</p>}

            <h2 className="mt-5 truncate text-lg font-semibold text-foreground">
              {profile.fullName || t('common.noValue')}
            </h2>

            {profile.role && (
              <span className="mt-2.5 inline-flex items-center rounded-lg border border-primary/25 bg-permissionSurface px-4 py-1 text-xs font-semibold text-primary">
                {t(`roles.${profile.role.toLowerCase()}`, { defaultValue: profile.role })}
              </span>
            )}

            <p className="mt-3 text-sm text-muted">
              {genderOption
                ? t(genderOption.translationKey)
                : profile.gender || t('common.noValue')}
            </p>
          </aside>

          {/* Main Tabbed Details / Password Card */}
          <section className="rounded-3xl border border-border/40 bg-card p-5 shadow-sm sm:p-7">
            <div
              role="tablist"
              aria-label={t('profile.details')}
              className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-subtle p-1.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === PROFILE_TAB.info}
                onClick={() => setTab(PROFILE_TAB.info)}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                  tab === PROFILE_TAB.info
                    ? 'bg-primary text-card shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Icon name="profile" className="size-4 shrink-0" />
                {t('profile.personalInfo')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === PROFILE_TAB.password}
                onClick={() => setTab(PROFILE_TAB.password)}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                  tab === PROFILE_TAB.password
                    ? 'bg-primary text-card shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Icon name="lock" className="size-4 shrink-0" />
                {t('profile.changePassword')}
              </button>
            </div>

            {tab === PROFILE_TAB.info ? (
              <ProfileForm
                profile={profile}
                fileInputRef={fileInputRef}
                onPreviewChange={handlePreviewChange}
                onBack={() => navigate(ROUTES.dashboard)}
              />
            ) : (
              <ChangePasswordForm onBack={() => setTab(PROFILE_TAB.info)} />
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
