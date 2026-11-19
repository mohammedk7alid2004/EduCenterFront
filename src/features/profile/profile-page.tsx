import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config';
import { Button, DetailField, ErrorState, LoadingState, Icon } from '@/shared/components';
import { useProfile } from './profile.queries';
import { PROFILE_DIALOG } from './profile.constants';
import { ProfileAvatar } from './components/profile-avatar';
import { ProfileForm } from './components/profile-form';
import { ChangePasswordForm } from './components/change-password-form';
export function ProfilePage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useProfile();
  const [dialog, setDialog] = useState<(typeof PROFILE_DIALOG)[keyof typeof PROFILE_DIALOG] | null>(
    null,
  );
  const profile = query.data;
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
        <section className="rounded-3xl border border-border/40 bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <span className="grid size-8 place-items-center rounded-full bg-iconSurface text-primary">
                <Icon name="profile" className="size-5" />
              </span>
              {t('profile.details')}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="ghost"
                className="h-9 rounded-lg border border-primary/50 bg-primary/5 px-4 text-primary"
                onClick={() => setDialog(PROFILE_DIALOG.edit)}
              >
                <Icon name="pencil" className="size-4" />
                {t('common.edit')}
              </Button>
              <Button
                type="button"
                className="h-9 rounded-lg px-4"
                onClick={() => setDialog(PROFILE_DIALOG.password)}
              >
                <Icon name="lock" className="size-4" />
                {t('profile.changePassword')}
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:gap-6">
            <ProfileAvatar
              rounded
              name={profile.fullName}
              imageUrl={profile.imageUrl}
              className="size-40 text-4xl sm:size-44"
            />
            <dl className="grid min-w-0 gap-4">
              <DetailField label={t('profile.fullName')}>
                {profile.fullName || t('common.noValue')}
              </DetailField>
              <DetailField label={t('profile.email')}>
                <bdi>{profile.email || t('common.noValue')}</bdi>
              </DetailField>
              <DetailField label={t('profile.phone')}>
                <bdi>{profile.phone || t('common.noValue')}</bdi>
              </DetailField>
            </dl>
          </div>
        </section>
      ) : null}
      {dialog === PROFILE_DIALOG.edit && profile && (
        <ProfileForm profile={profile} onClose={() => setDialog(null)} />
      )}
      {dialog === PROFILE_DIALOG.password && <ChangePasswordForm onClose={() => setDialog(null)} />}
    </section>
  );
}
