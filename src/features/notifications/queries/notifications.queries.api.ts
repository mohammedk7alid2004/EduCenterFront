import { API_ENDPOINTS } from '@/shared/constants';
import { apiClient, assertApiSuccess, normalizeApiError } from '@/shared/api';
import type { ApiResult, PaginatedResult } from '@/shared/types';
import type {
  NotificationDto,
  NotificationFilters,
  NotificationGroupOption,
  NotificationSelectOption,
} from '../types';

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
