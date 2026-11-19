import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config';
import type { ApiError, PaginatedResult } from '@/infrastructure/api';
import {
  fetchContacts,
  fetchContact,
  deleteContacts,
  fetchContactFile,
  importContacts,
} from './contact-us.api';
import type { ContactFilters, ContactMessage, ContactImportResult } from './contact-us.types';
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
export function useDeleteContacts() {
  const client = useQueryClient();
  return useMutation<void, ApiError, string[]>({
    mutationFn: (ids) => deleteContacts(ids),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contactUs });
    },
  });
}
export function useContactFile() {
  return useMutation<Blob, ApiError, { kind: 'export' | 'template'; filters: ContactFilters }>({
    mutationFn: ({ kind, filters }) => fetchContactFile(kind, filters),
  });
}
export function useImportContacts() {
  const client = useQueryClient();
  return useMutation<ContactImportResult, ApiError, File>({
    mutationFn: (file) => importContacts(file),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contactUs });
    },
  });
}
