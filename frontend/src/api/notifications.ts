import { apiClient } from './client';
import { Notification, ApiResponse } from '../types';

export const notificationsApi = {
  list: async () => {
    const res = await apiClient.get<ApiResponse<{ unread_count: number; notifications: Notification[] }>>('/notifications');
    return res.data;
  },

  markRead: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; message: string }>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async () => {
    const res = await apiClient.patch<{ success: boolean; message: string }>('/notifications/read-all');
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/notifications/${id}`);
    return res.data;
  },

  clearAll: async () => {
    const res = await apiClient.delete<{ success: boolean; message: string }>('/notifications');
    return res.data;
  },

  send: async (data: { user_id?: string; title: string; message: string; type?: string; link_url?: string }) => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/notifications/send', data);
    return res.data;
  },
};
