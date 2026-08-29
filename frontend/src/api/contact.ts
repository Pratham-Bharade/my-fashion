import { apiClient } from './client';
import { BusinessSettings, DashboardAnalytics, AdminDashboardStats, PaginatedResponse, ApiResponse } from '../types';

export const contactApi = {
  submit: async (data: { name: string; email: string; phone?: string; message: string }) => {
    const res = await apiClient.post<ApiResponse<any>>('/contact', data);
    return res.data;
  },

  listAdmin: async (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const res = await apiClient.get<PaginatedResponse<any>>(`/contact?${searchParams.toString()}`);
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await apiClient.patch<ApiResponse<any>>(`/contact/${id}/status`, { status });
    return res.data;
  }
};

export const settingsApi = {
  get: async () => {
    const res = await apiClient.get<ApiResponse<BusinessSettings>>('/business-settings');
    return res.data;
  },

  update: async (data: Partial<BusinessSettings>) => {
    const res = await apiClient.put<ApiResponse<BusinessSettings>>('/business-settings', data);
    return res.data;
  }
};

export const businessSettingsApi = settingsApi;

export const dashboardApi = {
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<AdminDashboardStats>>('/dashboard/stats');
    return res.data;
  },

  getAnalytics: async () => {
    const res = await apiClient.get<ApiResponse<DashboardAnalytics>>('/dashboard/analytics');
    return res.data;
  }
};

export const customersApi = {
  list: async (params?: { search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const res = await apiClient.get<PaginatedResponse<any>>(`/customers?${searchParams.toString()}`);
    return res.data;
  },

  getDetails: async (id: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/customers/${id}`);
    return res.data;
  },

  toggleStatus: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; message: string }>(`/customers/${id}/toggle-status`);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/customers/${id}`);
    return res.data;
  }
};

export const aiApi = {
  chat: async (query: string) => {
    const res = await apiClient.post<ApiResponse<{ response: string; suggested_actions: Array<{ label: string; link: string }> }>>('/ai/chat', { query });
    return res.data;
  },

  getRecommendations: async (category?: string, tags?: string) => {
    const searchParams = new URLSearchParams();
    if (category) searchParams.append('category', category);
    if (tags) searchParams.append('tags', tags);
    const res = await apiClient.get<ApiResponse<any[]>>(`/ai/recommendations?${searchParams.toString()}`);
    return res.data;
  }
};

export const uploadApi = {
  uploadImage: async (file: File, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await apiClient.post<ApiResponse<{ url: string; filename: string }>>('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};
