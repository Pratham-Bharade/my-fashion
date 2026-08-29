import { apiClient } from './client';
import { Quotation, Order, ApiResponse, PaginatedResponse } from '../types';

export const quotationsApi = {
  create: async (data: {
    custom_request_id: string;
    base_price: number;
    additional_charges?: number;
    discount?: number;
    advance_amount?: number;
    valid_until: string;
    notes?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Quotation>>('/quotations', data);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Quotation>>(`/quotations/${id}`);
    return res.data;
  },

  listAdmin: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const res = await apiClient.get<PaginatedResponse<Quotation>>(`/quotations?${searchParams.toString()}`);
    return res.data;
  },

  respond: async (id: string, accept: boolean, notes?: string) => {
    const res = await apiClient.patch<ApiResponse<Quotation>>(`/quotations/${id}/respond`, { accept, notes });
    return res.data;
  },

  sendMessage: async (id: string, message: string) => {
    const res = await apiClient.post<ApiResponse<Quotation>>(`/quotations/${id}/message`, { message });
    return res.data;
  },

  convertToOrder: async (id: string) => {
    const res = await apiClient.post<ApiResponse<Order>>(`/quotations/${id}/convert-to-order`);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/quotations/${id}`);
    return res.data;
  }
};
