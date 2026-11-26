import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants';
import type { ApiError } from '@/shared/api';
import type { CenterValues, ContentValues, FaqDto, FaqValues, SocialLink } from '../types';
import {
  deleteFaqs,
  saveCenter,
  saveFaq,
  saveSettings,
  toggleFaq,
} from './system-management.commands.api';

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
