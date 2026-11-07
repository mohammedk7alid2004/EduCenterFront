import { useQuery } from '@tanstack/react-query'; import { getTemplateEntity } from './_template.api';
export const templateQueryKeys = { detail: (id: string) => ['template', id] as const };
export function useTemplateEntity(id: string) { return useQuery({ queryKey: templateQueryKeys.detail(id), queryFn: ({ signal }) => getTemplateEntity(id, signal), enabled: Boolean(id) }); }
