import { apiClient } from './client';
import { MeasurementProfile, ApiResponse } from '../types';

export const measurementsApi = {
  list: async (customerId?: string) => {
    const params = customerId ? `?customer_id=${customerId}` : '';
    const res = await apiClient.get<ApiResponse<MeasurementProfile[]>>(`/measurements${params}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<MeasurementProfile>>(`/measurements/${id}`);
    return res.data;
  },

  create: async (data: Partial<MeasurementProfile>) => {
    const res = await apiClient.post<ApiResponse<MeasurementProfile>>('/measurements', data);
    return res.data;
  },

  update: async (id: string, data: Partial<MeasurementProfile>) => {
    const res = await apiClient.put<ApiResponse<MeasurementProfile>>(`/measurements/${id}`, data);
    return res.data;
  },

  setDefault: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; message: string }>(`/measurements/${id}/default`);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/measurements/${id}`);
    return res.data;
  }
};
