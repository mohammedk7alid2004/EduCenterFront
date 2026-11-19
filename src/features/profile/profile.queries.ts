import { toast } from 'sonner';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import { useAuthStore } from '@/infrastructure/auth';
import type { ApiError } from '@/infrastructure/api';
import { fetchProfile, updateProfile, changePassword } from './profile.api';
import type { ProfileDto, ProfileValues, ChangePasswordValues } from './profile.types';

export function useProfile() {
  const { i18n } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const setUserName = useAuthStore((state) => state.setUserName);
  const query = useQuery<ProfileDto, ApiError>({
    queryKey: [...QUERY_KEYS.profile, userId, i18n.language],
    queryFn: ({ signal }) => fetchProfile(signal),
    enabled: Boolean(userId),
  });
  const name = query.data?.fullName;
  useEffect(() => {
    if (name) setUserName(name);
  }, [name, setUserName]);
  return query;
}
export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation<void, ApiError, ProfileValues>({
    mutationFn: (values) => updateProfile(values),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.profile });
      void client.invalidateQueries({ queryKey: QUERY_KEYS.employees });
    },
  });
}
export function useChangePassword() {
  const { t } = useTranslation();
  const client = useQueryClient();
  return useMutation<void, ApiError, ChangePasswordValues>({
    mutationFn: (values) => changePassword(values),
    onSuccess: () => {
      toast.success(t('profile.passwordChanged'));
      // The backend revokes refresh tokens after a password change.
      useAuthStore.getState().logout();
      client.clear();
    },
  });
}
