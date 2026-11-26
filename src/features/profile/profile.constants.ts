export const PROFILE_IMAGE = {
  maxBytes: 10 * 1024 * 1024,
  accept: '.jpg,.jpeg,.png,.webp',
  extensions: /\.(jpe?g|png|webp)$/i,
} as const;
export const PROFILE_PHONE_PATTERN = /^\+?[0-9]{8,15}$/;
export const PASSWORD_SPECIAL_PATTERN = /[!@#$%^&*()[\]{}\-_+=~`|:;"'<>,./?\\]/;

export const PROFILE_TAB = { info: 'info', password: 'password' } as const;

export const PROFILE_GENDER = {
  male: 'Male',
  female: 'Female',
} as const;

export const PROFILE_GENDER_OPTIONS = [
  { id: PROFILE_GENDER.male, translationKey: 'profile.genders.male' },
  { id: PROFILE_GENDER.female, translationKey: 'profile.genders.female' },
] as const;
