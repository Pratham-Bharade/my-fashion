import { apiClient } from './client';
import { Review, ReviewStatus, PaginatedResponse, ApiResponse } from '../types';

export const reviewsApi = {
  getPublic: async (limit = 10) => {
    const res = await apiClient.get<ApiResponse<Review[]>>(`/reviews?limit=${limit}`);
    return res.data;
  },

  listAdmin: async (params?: { status?: ReviewStatus; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const res = await apiClient.get<PaginatedResponse<Review>>(`/reviews/admin?${searchParams.toString()}`);
    return res.data;
  },

  submit: async (data: { order_id: string; rating: number; comment: string }) => {
    const res = await apiClient.post<ApiResponse<Review>>('/reviews', data);
    return res.data;
  },

  moderateStatus: async (id: string, status: ReviewStatus) => {
    const res = await apiClient.patch<ApiResponse<Review>>(`/reviews/${id}/status`, { status });
    return res.data;
  },

  updateStatus: async (id: string, status: ReviewStatus) => {
    const res = await apiClient.patch<ApiResponse<Review>>(`/reviews/${id}/status`, { status });
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/reviews/${id}`);
    return res.data;
  }
};
