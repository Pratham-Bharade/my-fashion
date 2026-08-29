import { apiClient } from './client';
import { CustomRequest, CustomRequestStatus, PaginatedResponse, ApiResponse } from '../types';

export const customRequestsApi = {
  getMy: async () => {
    const res = await apiClient.get<ApiResponse<CustomRequest[]>>('/custom-requests/my');
    return res.data;
  },

  listAdmin: async (params?: { status?: CustomRequestStatus; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const res = await apiClient.get<PaginatedResponse<CustomRequest>>(`/custom-requests?${searchParams.toString()}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<CustomRequest>>(`/custom-requests/${id}`);
    return res.data;
  },

  create: async (data: {
    design_id?: string;
    garment_type: string;
    description: string;
    phone?: string;
    fabric?: string;
    preferred_color?: string;
    occasion?: string;
    required_date?: string;
    measurement_profile_id?: string;
    image_paths?: string[];
  }) => {
    const res = await apiClient.post<ApiResponse<CustomRequest>>('/custom-requests', data);
    return res.data;
  },

  updateStatus: async (id: string, status: CustomRequestStatus, notes?: string) => {
    const res = await apiClient.patch<ApiResponse<CustomRequest>>(`/custom-requests/${id}/status`, { status, notes });
    return res.data;
  },

  cancel: async (id: string, reason?: string) => {
    const searchParams = new URLSearchParams();
    if (reason) searchParams.append('reason', reason);
    const res = await apiClient.patch<ApiResponse<CustomRequest>>(
      `/custom-requests/${id}/cancel?${searchParams.toString()}`,
      { notes: reason }
    );
    return res.data;
  },

  delete: async (id: string, reason?: string) => {
    const searchParams = new URLSearchParams();
    if (reason) searchParams.append('reason', reason);
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/custom-requests/${id}?${searchParams.toString()}`
    );
    return res.data;
  }
};
