import { API_ENDPOINTS } from '@/config'; import { apiClient } from '@/core/api';
export interface TemplateEntity { id: string; }
export async function getTemplateEntity(id: string, signal?: AbortSignal): Promise<TemplateEntity> { const { data } = await apiClient.get<TemplateEntity>(API_ENDPOINTS.template.detail(id), { signal }); return data; }
