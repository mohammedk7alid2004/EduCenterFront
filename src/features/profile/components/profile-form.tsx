import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, Icon, Input, Select } from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import { PROFILE_GENDER_OPTIONS, PROFILE_IMAGE, PROFILE_PHONE_PATTERN } from '../profile.constants';
import type { ProfileDto, ProfileValues } from '../profile.types';
import { useUpdateProfile } from '../profile.queries';

export function ProfileForm({
  profile,
  fileInputRef,
  onPreviewChange,
  onBack,
}: {
  profile: ProfileDto;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onPreviewChange: (url: string | undefined, error?: string) => void;
  onBack: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const mutation = useUpdateProfile();

  const schema = z.object({
    fullName: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .max(150, t('validation.maxLength', { count: 150 })),
    phoneNumber: z
      .string()
      .trim()
      .refine((value) => !value || PROFILE_PHONE_PATTERN.test(value), t('profile.validation.phone'))
      .refine((value) => !profile.phone || Boolean(value), t('validation.required')),
    gender: z.string().min(1, t('validation.required')),
    image: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => !file || (file.size > 0 && file.size <= PROFILE_IMAGE.maxBytes),
        t('profile.validation.imageSize'),
      )
      .refine(
        (file) => !file || PROFILE_IMAGE.extensions.test(file.name),
        t('profile.validation.imageType'),
      ),
  });

  const {
    register,
    control,
    setValue,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile.fullName,
      phoneNumber: profile.phone ?? '',
      gender: profile.gender,
    },
  });

  const image = useWatch({ control, name: 'image' });

  useEffect(() => {
    if (!image) {
      onPreviewChange(undefined, errors.image?.message);
      return;
    }
    const url = URL.createObjectURL(image);
    onPreviewChange(url, errors.image?.message);
    return () => URL.revokeObjectURL(url);
  }, [image, errors.image?.message, onPreviewChange]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        if (!online) return;
        mutation.mutate(values, {
          onSuccess: () => {
            reset({
              fullName: values.fullName.trim(),
              phoneNumber: values.phoneNumber.trim(),
              gender: values.gender,
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            onPreviewChange(undefined);
            toast.success(t('profile.saved'));
          },
          onError: (error) => setServerErrors(error, setError),
        });
      })}
    >
      <input
        ref={fileInputRef}
        id="profile-image"
        type="file"
        accept={PROFILE_IMAGE.accept}
        aria-invalid={Boolean(errors.image)}
        onChange={(event) =>
          setValue('image', event.target.files?.[0], {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        className="sr-only"
      />

      {(!online || mutation.error) && (
        <p role="alert" className="mb-5 rounded-xl bg-danger/10 p-3 text-sm text-danger">
          {!online
            ? t('errors.network')
            : t(mutation.error?.message ?? 'errors.unknown', {
                defaultValue: mutation.error?.message,
              })}
        </p>
      )}

      <fieldset disabled={mutation.isPending} className="min-w-0 space-y-5">
        <Input
          {...register('fullName')}
          label={t('profile.fullName')}
          requiredAsterisk
          autoComplete="name"
          error={errors.fullName?.message}
        />
        <Input
          id="profile-email"
          label={t('profile.email')}
          value={profile.email}
          readOnly
          type="email"
          helperText={t('profile.emailReadOnly')}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            {...register('phoneNumber')}
            label={t('profile.phone')}
            type="tel"
            autoComplete="tel"
            error={errors.phoneNumber?.message}
          />
          <Select
            {...register('gender')}
            label={t('profile.gender')}
            requiredAsterisk
            options={PROFILE_GENDER_OPTIONS.map((option) => ({
              id: option.id,
              name: t(option.translationKey),
            }))}
            error={errors.gender?.message}
          />
        </div>
      </fieldset>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          type="submit"
          loading={mutation.isPending}
          disabled={!online || !isDirty}
          className="h-11 rounded-xl"
        >
          <Icon name="checkCircle" className="size-5" />
          {t('common.saveChanges')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={mutation.isPending}
          onClick={() => {
            if (isDirty) {
              reset({
                fullName: profile.fullName,
                phoneNumber: profile.phone ?? '',
                gender: profile.gender,
              });
              if (fileInputRef.current) fileInputRef.current.value = '';
              onPreviewChange(undefined);
            } else {
              onBack();
            }
          }}
          className="h-11 rounded-xl border border-border bg-subtle text-foreground hover:bg-muted/15"
        >
          {t(isDirty ? 'common.cancel' : 'common.back')}
          <Icon name="chevronLeft" className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </form>
  );
}
