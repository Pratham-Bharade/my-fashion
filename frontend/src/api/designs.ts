import { apiClient } from './client';
import { Design, DesignCategory, PaginatedResponse, ApiResponse } from '../types';

export const designsApi = {
  list: async (params?: { category?: DesignCategory; search?: string; tag?: string; page?: number; limit?: number; include_inactive?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.tag) searchParams.append('tag', params.tag);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.include_inactive) searchParams.append('include_inactive', 'true');

    const res = await apiClient.get<PaginatedResponse<Design>>(`/designs?${searchParams.toString()}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Design>>(`/designs/${id}`);
    return res.data;
  },

  create: async (data: Partial<Design>) => {
    const res = await apiClient.post<ApiResponse<Design>>('/designs', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Design>) => {
    const res = await apiClient.put<ApiResponse<Design>>(`/designs/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/designs/${id}`);
    return res.data;
  }
};
