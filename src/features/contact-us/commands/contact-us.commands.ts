import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { ContactFilters, ContactImportResult, SendContactEmailValues } from '../types';
import {
  deleteContacts,
  fetchContactFile,
  importContacts,
  sendContactEmail,
} from './contact-us.commands.api';

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

export function useSendContactEmail() {
  return useMutation<void, ApiError, SendContactEmailValues>({
    mutationFn: (values) => sendContactEmail(values),
  });
}
