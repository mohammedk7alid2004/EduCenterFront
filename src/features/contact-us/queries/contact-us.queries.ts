import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { PaginatedResult } from '@/shared/types';
import { fetchContacts, fetchContact } from './contact-us.queries.api';
import type { ContactFilters, ContactMessage } from '../types';

export function useContacts(filters: ContactFilters) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<ContactMessage>, ApiError>({
    queryKey: [...QUERY_KEYS.contactUs, i18n.language, filters],
    queryFn: ({ signal }) => fetchContacts(filters, signal),
  });
}

export function useContact(id: string) {
  const { i18n } = useTranslation();
  return useQuery<ContactMessage, ApiError>({
    queryKey: [...QUERY_KEYS.contactUs, QUERY_KEYS.detail, i18n.language, id],
    queryFn: ({ signal }) => fetchContact(id, signal),
  });
}
