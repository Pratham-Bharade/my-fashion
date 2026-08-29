import { apiClient } from './client';
import { User, ApiResponse } from '../types';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  role: 'CUSTOMER' | 'ADMIN';
  name: string;
  email: string;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<TokenResponse>>('/auth/login', credentials);
    return res.data;
  },

  register: async (data: { name: string; email: string; phone: string; password: string; confirm_password: string }) => {
    const res = await apiClient.post<ApiResponse<TokenResponse>>('/auth/register', data);
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data;
  },

  updateProfile: async (data: Partial<User> & { address?: string; city?: string; pincode?: string; preferences?: any }) => {
    const res = await apiClient.put<ApiResponse<User>>('/users/me', data);
    return res.data;
  },

  changePassword: async (data: { old_password: string; new_password: string; confirm_password: string }) => {
    const res = await apiClient.put<{ success: boolean; message: string }>('/users/me/password', data);
    return res.data;
  }
};
