import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button, Icon, Input, Modal } from '@/shared/components';
import { useOnline } from '@/shared/hooks';
import { setServerErrors } from '@/shared/utils';
import { PROFILE_IMAGE, PROFILE_PHONE_PATTERN } from '../profile.constants';
import type { ProfileDto, ProfileValues } from '../profile.types';
import { useUpdateProfile } from '../profile.queries';
import { ProfileAvatar } from './profile-avatar';

export function ProfileForm({
  profile,
  onClose,
}: {
  profile: ProfileDto;
  onClose: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const online = useOnline();
  const mutation = useUpdateProfile();
  const upload = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();
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
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: profile.fullName, phoneNumber: profile.phone ?? '' },
  });
  const image = useWatch({ control, name: 'image' });
  useEffect(() => {
    if (!image) {
      setPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  return (
    <Modal
      title={t('profile.editTitle')}
      icon="profile"
      size="form"
      pending={mutation.isPending}
      onClose={onClose}
    >
      <form
        noValidate
        onSubmit={handleSubmit((values) => {
          if (online)
            mutation.mutate(values, {
              onSuccess: () => {
                reset({ fullName: values.fullName.trim(), phoneNumber: values.phoneNumber.trim() });
                if (upload.current) upload.current.value = '';
                toast.success(t('profile.saved'));
                onClose();
              },
              onError: (error) => setServerErrors(error, setError),
            });
        })}
      >
        {(!online || mutation.error) && (
          <p role="alert" className="mb-5 rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {!online
              ? t('errors.network')
              : t(mutation.error?.message ?? 'errors.unknown', {
                  defaultValue: mutation.error?.message,
                })}
          </p>
        )}
        <fieldset disabled={mutation.isPending} className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <ProfileAvatar
              name={profile.fullName}
              imageUrl={preview ?? profile.imageUrl}
              className="size-20 text-2xl"
            />
            <div className="min-w-0 flex-1">
              <label htmlFor="profile-image" className="mb-2 block text-sm font-medium">
                {t('profile.image')}
              </label>
              <input
                ref={upload}
                id="profile-image"
                type="file"
                accept={PROFILE_IMAGE.accept}
                aria-invalid={Boolean(errors.image)}
                aria-describedby="profile-image-help"
                onChange={(event) =>
                  setValue('image', event.target.files?.[0], {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className="sr-only"
              />
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => upload.current?.click()}
                  className="rounded-full bg-primary/10 px-3 py-2 text-xs text-primary"
                >
                  {t('profile.chooseImage')}
                </button>
                <span className="min-w-0 truncate text-xs text-muted">
                  {image?.name ?? t('profile.noImageSelected')}
                </span>
              </div>
              <p
                id="profile-image-help"
                className={`mt-2 text-xs ${errors.image ? 'text-danger' : 'text-muted'}`}
              >
                {errors.image?.message ?? t('profile.imageHelp')}
              </p>
            </div>
          </div>
          <Input
            {...register('fullName')}
            label={t('profile.fullName')}
            requiredAsterisk
            autoComplete="name"
            error={errors.fullName?.message}
          />
          <Input
            {...register('phoneNumber')}
            label={t('profile.phone')}
            type="tel"
            autoComplete="tel"
            error={errors.phoneNumber?.message}
          />
          <Input
            id="profile-email"
            label={t('profile.email')}
            value={profile.email}
            readOnly
            type="email"
            helperText={t('profile.emailReadOnly')}
          />
        </fieldset>
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!online}
            className="rounded-xl"
          >
            <Icon name="checkCircle" className="size-5" />
            {t('common.saveChanges')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
