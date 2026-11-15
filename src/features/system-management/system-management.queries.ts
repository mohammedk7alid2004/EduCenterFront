import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/config';
import type { ApiError, ListFilters, PaginatedResult } from '@/core/api';
import {
  deleteFaqs,
  fetchFaqs,
  fetchSettings,
  saveCenter,
  saveFaq,
  saveSettings,
  toggleFaq,
} from './system-management.api';
import { CENTER_BRAND_ENDPOINT, FAQ_ENDPOINTS } from './system-management.constants';
import type {
  CenterValues,
  CenterSettings,
  ContentValues,
  FaqDto,
  FaqValues,
  SocialLink,
} from './system-management.types';
export function useCenterBrand() {
  return useQuery<CenterSettings, ApiError>({
    queryKey: [...QUERY_KEYS.systemManagement, CENTER_BRAND_ENDPOINT],
    queryFn: ({ signal }) => fetchSettings<CenterSettings>(CENTER_BRAND_ENDPOINT, signal),
    retry: false,
    staleTime: 300_000,
  });
}
export function useSettings<T>(endpoint: string) {
  const { i18n } = useTranslation();
  return useQuery<T, ApiError>({
    queryKey: [...QUERY_KEYS.systemManagement, endpoint, i18n.language],
    queryFn: ({ signal }) => fetchSettings<T>(endpoint, signal),
  });
}
function useSettingsMutation<T>(mutationFn: (values: T) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation<unknown, ApiError, T>({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.systemManagement });
    },
  });
}
export function useSaveSettings(endpoint: string) {
  return useSettingsMutation((values: ContentValues | { links: SocialLink[] }) =>
    saveSettings(endpoint, values),
  );
}
export function useSaveCenter() {
  return useSettingsMutation((values: CenterValues) => saveCenter(values));
}
export function useFaqs(filters: ListFilters) {
  const { i18n } = useTranslation();
  return useQuery<PaginatedResult<FaqDto>, ApiError>({
    queryKey: [...QUERY_KEYS.systemManagement, FAQ_ENDPOINTS.base, i18n.language, filters],
    queryFn: ({ signal }) => fetchFaqs(filters, signal),
  });
}
export function useSaveFaq(id?: string) {
  const savedId = useRef(id);
  const client = useQueryClient();
  return useMutation<FaqDto, ApiError, FaqValues>({
    mutationFn: async (values) => {
      const saved = await saveFaq(savedId.current, values);
      savedId.current = saved.id;
      if (saved.isActive !== values.isActive) await toggleFaq(saved.id);
      return { ...saved, isActive: values.isActive };
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.systemManagement });
    },
  });
}
export function useToggleFaq() {
  return useSettingsMutation((id: string) => toggleFaq(id));
}
export function useDeleteFaqs() {
  return useSettingsMutation((ids: string[]) => deleteFaqs(ids));
}
