import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import { useAuthStore } from '@/shared/hooks';
import type { ApiError } from '@/shared/api';
import { fetchProfile } from './profile.queries.api';
import type { ProfileDto } from '../types';

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
