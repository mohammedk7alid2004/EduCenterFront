import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { setServerErrors, useOnline } from '@/shared/lib';
import { Button, FeedbackDialog, Icon, Input, Modal } from '@/shared/ui';
import { LOGO_FIELDS, SETTINGS_IMAGE } from '../system-management.constants';
import type { CenterSettings, CenterValues } from '../system-management.types';
import { useSaveCenter } from '../system-management.queries';
import { ContentLanguage } from './content-panel';
import { LogoUpload } from './logo-upload';
import { SettingsForm } from './settings-form';
export function CenterEditor({
  settings,
  onClose,
}: {
  settings?: CenterSettings;
  onClose: () => void;
}): JSX.Element {
  const { t, i18n } = useTranslation();
  const online = useOnline();
  const mutation = useSaveCenter();
  const [success, setSuccess] = useState(false);
  const [language, setLanguage] = useState(i18n.language.startsWith('ar') ? 'ar' : 'en');
  const [phone, setPhone] = useState('');
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CenterValues>({
    defaultValues: {
      centerNameAr: settings?.centerNameAr ?? '',
      centerNameEn: settings?.centerNameEn ?? '',
      workingHoursAr: settings?.workingHoursAr ?? '',
      workingHoursEn: settings?.workingHoursEn ?? '',
      mainPhoneNumber: settings?.mainPhoneNumber ?? '',
      othersPhoneNumbers: settings?.othersPhoneNumbers ?? [],
      locations: settings?.locations?.length
        ? settings.locations
        : [{ location: '', lat: null, long: null }],
    },
  });
  const values = useWatch({ control });
  const title = t('systemManagement.editTitle', { section: t('systemManagement.tabs.center') });
  function addPhone() {
    const next = phone.trim();
    if (!next) return;
    if (!/^\+?[\d\s()-]{5,50}$/.test(next)) {
      setError('othersPhoneNumbers', { message: t('profile.validation.phone') });
      return;
    }
    setValue('othersPhoneNumbers', [...new Set([...(values.othersPhoneNumbers ?? []), next])], {
      shouldDirty: true,
    });
    setPhone('');
    clearErrors('othersPhoneNumbers');
  }
  if (success)
    return (
      <FeedbackDialog title={title} description={t('systemManagement.saved')} onClose={onClose} />
    );
  return (
    <Modal title={title} icon="building" size="form" pending={mutation.isPending} onClose={onClose}>
      <SettingsForm
        pending={mutation.isPending}
        error={mutation.error}
        onClose={onClose}
        onSubmit={handleSubmit((form) => {
          if (phone.trim()) {
            addPhone();
            return;
          }
          const invalidLocation = form.locations.findIndex(
            (item) => (item.lat === null) !== (item.long === null),
          );
          if (invalidLocation !== -1) {
            setError(`locations.${invalidLocation}.lat`, {
              message: t('systemManagement.coordinatePair'),
            });
            return;
          }
          for (const key of LOGO_FIELDS) {
            const file = form[key];
            if (
              file &&
              (!SETTINGS_IMAGE.extensions.test(file.name) ||
                !file.size ||
                file.size > SETTINGS_IMAGE.maxBytes)
            ) {
              setError(key, { message: t('systemManagement.imageHint') });
              return;
            }
          }
          if (online)
            mutation.mutate(
              {
                ...form,
                locations: form.locations.filter(
                  (item) => item.location?.trim() || item.lat !== null || item.long !== null,
                ),
              },
              {
                onSuccess: () => setSuccess(true),
                onError: (error) => setServerErrors(error, setError),
              },
            );
        })}
      >
        <ContentLanguage value={language} onChange={setLanguage} />
        <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
          <Input
            key={`name-${language}`}
            {...register(language === 'ar' ? 'centerNameAr' : 'centerNameEn', {
              maxLength: { value: 200, message: t('validation.maxLength', { count: 200 }) },
            })}
            label={t('systemManagement.centerName')}
            error={(language === 'ar' ? errors.centerNameAr : errors.centerNameEn)?.message}
          />
          <Input
            key={`hours-${language}`}
            {...register(language === 'ar' ? 'workingHoursAr' : 'workingHoursEn', {
              maxLength: { value: 1000, message: t('validation.maxLength', { count: 1000 }) },
            })}
            label={t('systemManagement.workingHours')}
            error={(language === 'ar' ? errors.workingHoursAr : errors.workingHoursEn)?.message}
          />
          <Input
            {...register('mainPhoneNumber', {
              maxLength: { value: 50, message: t('validation.maxLength', { count: 50 }) },
            })}
            type="tel"
            label={t('systemManagement.mainPhoneNumber')}
            error={errors.mainPhoneNumber?.message}
          />
          <div>
            <label htmlFor="other-phone" className="mb-2 block text-sm font-medium">
              {t('systemManagement.otherPhones')}
            </label>
            <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-2xl border border-muted/60 p-2">
              {values.othersPhoneNumbers?.map((item, index) => (
                <span
                  key={item}
                  className="flex items-center gap-1 rounded-full bg-permissionSurface px-2 py-1 text-xs"
                >
                  <bdi>{item}</bdi>
                  <button
                    type="button"
                    aria-label={t('systemManagement.removePhone', { phone: item })}
                    onClick={() =>
                      setValue(
                        'othersPhoneNumbers',
                        values.othersPhoneNumbers?.filter((_, i) => i !== index) as string[],
                      )
                    }
                  >
                    <Icon name="close" className="size-3" />
                  </button>
                </span>
              ))}
              <input
                id="other-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPhone();
                  }
                }}
                className="min-w-16 flex-1 bg-card text-xs outline-none"
              />
              <button
                type="button"
                onClick={addPhone}
                aria-label={t('systemManagement.addPhone')}
                className="text-primary"
              >
                <Icon name="plus" className="size-4" />
              </button>
            </div>
            {errors.othersPhoneNumbers?.message && (
              <p role="alert" className="text-xs text-danger">
                {errors.othersPhoneNumbers.message}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {values.locations?.map((item, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-border p-3">
              <Input
                {...register(`locations.${index}.location`, {
                  maxLength: { value: 1000, message: t('validation.maxLength', { count: 1000 }) },
                })}
                label={t('systemManagement.location')}
                endIcon="mapPin"
                error={errors.locations?.[index]?.location?.message}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register(`locations.${index}.lat`, {
                    setValueAs: (value) => (value === '' ? null : Number(value)),
                    min: { value: -90, message: t('systemManagement.invalidCoordinates') },
                    max: { value: 90, message: t('systemManagement.invalidCoordinates') },
                    validate: (value) =>
                      value === null ||
                      Number.isFinite(value) ||
                      t('systemManagement.invalidCoordinates'),
                  })}
                  type="number"
                  step="any"
                  label={t('systemManagement.latitude')}
                  error={errors.locations?.[index]?.lat?.message}
                />
                <Input
                  {...register(`locations.${index}.long`, {
                    setValueAs: (value) => (value === '' ? null : Number(value)),
                    min: { value: -180, message: t('systemManagement.invalidCoordinates') },
                    max: { value: 180, message: t('systemManagement.invalidCoordinates') },
                    validate: (value) =>
                      value === null ||
                      Number.isFinite(value) ||
                      t('systemManagement.invalidCoordinates'),
                  })}
                  type="number"
                  step="any"
                  label={t('systemManagement.longitude')}
                  error={errors.locations?.[index]?.long?.message}
                />
              </div>
              {typeof item.lat === 'number' &&
                typeof item.long === 'number' &&
                Number.isFinite(item.lat) &&
                Number.isFinite(item.long) && (
                  <iframe
                    title={t('systemManagement.map')}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${item.long - 0.015}%2C${item.lat - 0.01}%2C${item.long + 0.015}%2C${item.lat + 0.01}&layer=mapnik&marker=${item.lat}%2C${item.long}`}
                    className="h-40 w-full rounded-2xl border-0"
                  />
                )}
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setValue(
                    'locations',
                    values.locations
                      ?.filter((_, i) => i !== index)
                      .map((location) => ({
                        location: location.location ?? '',
                        lat: location.lat ?? null,
                        long: location.long ?? null,
                      })) ?? [],
                  )
                }
              >
                <Icon name="trash" className="size-4" />
                {t('systemManagement.removeLocation')}
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setValue('locations', [
                ...(values.locations ?? []).map((location) => ({
                  location: location.location ?? '',
                  lat: location.lat ?? null,
                  long: location.long ?? null,
                })),
                { location: '', lat: null, long: null },
              ])
            }
          >
            <Icon name="plus" className="size-4" />
            {t('systemManagement.addLocation')}
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {LOGO_FIELDS.map((key, index) => (
            <div key={key} className={index === 2 ? 'sm:col-span-2' : ''}>
              <LogoUpload
                label={t(`systemManagement.${key}Url`)}
                currentUrl={settings?.[`${key}Url`]}
                value={values[key]}
                error={errors[key]?.message}
                onChange={(file) => {
                  setValue(key, file, { shouldDirty: true });
                  clearErrors(key);
                }}
              />
            </div>
          ))}
        </div>
      </SettingsForm>
    </Modal>
  );
}
