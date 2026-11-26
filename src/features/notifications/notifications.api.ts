import { API_ENDPOINTS } from '@/config';
import {
  apiClient,
  assertApiSuccess,
  normalizeApiError,
  type ApiResult,
  type PaginatedResult,
} from '@/infrastructure/api';
import type {
  NotificationDto,
  NotificationFilters,
  NotificationValues,
  NotificationGroupOption,
  NotificationSelectOption,
} from './notifications.types';

const endpoints = API_ENDPOINTS.notifications;

export async function fetchNotifications(
  filters: NotificationFilters,
  signal?: AbortSignal,
): Promise<PaginatedResult<NotificationDto>> {
  try {
    const { data } = await apiClient.get<ApiResult<PaginatedResult<NotificationDto>>>(
      endpoints.getAll,
      {
        signal,
        params: {
          Search: filters.name,
          PageNumber: filters.pageNumber,
          PageSize: filters.pageSize,
          IsActive: filters.isActive,
          Type: filters.type,
          GroupId: filters.groupId,
          LevelId: filters.levelId,
          GradeId: filters.gradeId,
        },
      },
    );
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchNotification(
  id: string,
  signal?: AbortSignal,
): Promise<NotificationDto> {
  try {
    const { data } = await apiClient.get<ApiResult<NotificationDto>>(endpoints.detail(id), {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

function buildFormData(values: NotificationValues): FormData {
  const fd = new FormData();
  fd.append('title', values.title);
  fd.append('type', String(values.type));
  if (values.groupId) fd.append('groupId', values.groupId);
  if (values.levelId) fd.append('levelId', values.levelId);
  if (values.gradeId) fd.append('gradeId', values.gradeId);
  fd.append('message', values.message);
  if (values.image) fd.append('image', values.image);
  if (values.removeImage) fd.append('removeImage', 'true');
  return fd;
}

export async function createNotification(
  values: NotificationValues,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const { data } = await apiClient.post<ApiResult<string>>(
      endpoints.create,
      buildFormData(values),
      { signal, headers: { 'Content-Type': 'multipart/form-data' } },
    );
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateNotification(
  id: string,
  values: NotificationValues,
  signal?: AbortSignal,
): Promise<void> {
  const fd = buildFormData(values);
  fd.append('id', id);
  try {
    const { data } = await apiClient.put<ApiResult<boolean>>(endpoints.update, fd, {
      signal,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteNotifications(ids: string[], signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.delete<ApiResult<boolean>>(endpoints.delete, {
      data: { ids },
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function resendNotification(id: string, signal?: AbortSignal): Promise<void> {
  try {
    const { data } = await apiClient.post<ApiResult<boolean>>(endpoints.resend(id), null, {
      signal,
    });
    assertApiSuccess(data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchNotificationGroups(
  signal?: AbortSignal,
): Promise<NotificationGroupOption[]> {
  try {
    const { data } = await apiClient.get<ApiResult<NotificationGroupOption[]>>(endpoints.groups, {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchNotificationLevels(
  signal?: AbortSignal,
): Promise<NotificationSelectOption[]> {
  try {
    const { data } = await apiClient.get<ApiResult<NotificationSelectOption[]>>(endpoints.levels, {
      signal,
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchNotificationGrades(
  levelId?: string,
  signal?: AbortSignal,
): Promise<NotificationSelectOption[]> {
  try {
    const { data } = await apiClient.get<ApiResult<NotificationSelectOption[]>>(endpoints.grades, {
      signal,
      params: { parentId: levelId },
    });
    assertApiSuccess(data);
    return data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
