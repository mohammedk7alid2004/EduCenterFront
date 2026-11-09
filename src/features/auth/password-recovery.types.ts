export const PASSWORD_RECOVERY_STEPS = ['email', 'code', 'password', 'success'] as const;
export type PasswordRecoveryStep = (typeof PASSWORD_RECOVERY_STEPS)[number];

export interface EmailFormValues {
  email: string;
}
export interface CodeFormValues {
  code: string;
}
export interface NewPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}
export interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}
