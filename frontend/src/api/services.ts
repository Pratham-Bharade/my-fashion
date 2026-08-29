import { apiClient } from './client';
import { Service, ServiceCategory, ApiResponse } from '../types';

export const servicesApi = {
  list: async (category?: ServiceCategory, includeInactive = false) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (includeInactive) params.append('include_inactive', 'true');
    const res = await apiClient.get<ApiResponse<Service[]>>(`/services?${params.toString()}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
    return res.data;
  },

  create: async (data: Partial<Service>) => {
    const res = await apiClient.post<ApiResponse<Service>>('/services', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Service>) => {
    const res = await apiClient.put<ApiResponse<Service>>(`/services/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/services/${id}`);
    return res.data;
  }
};
