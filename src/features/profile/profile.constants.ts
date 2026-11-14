export const PROFILE_IMAGE = {
  maxBytes: 10 * 1024 * 1024,
  accept: '.jpg,.jpeg,.png,.webp',
  extensions: /\.(jpe?g|png|webp)$/i,
} as const;
export const PROFILE_PHONE_PATTERN = /^\+?[0-9]{8,15}$/;
export const PASSWORD_SPECIAL_PATTERN = /[!@#$%^&*()[\]{}\-_+=~`|:;"'<>,./?\\]/;

export const PROFILE_DIALOG = { edit: 'edit', password: 'password' } as const;
