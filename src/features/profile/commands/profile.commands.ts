import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import { useAuthStore } from '@/shared/hooks';
import type { ApiError } from '@/shared/api';
import type { ProfileValues, ChangePasswordValues } from '../types';
import { updateProfile, changePassword } from './profile.commands.api';

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
