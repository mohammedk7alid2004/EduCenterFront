export interface ProfileDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  imageUrl: string | null;
  createdAt: string;
}
export interface ProfileValues {
  fullName: string;
  phoneNumber: string;
  gender: string;
  image?: File;
}
export interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
