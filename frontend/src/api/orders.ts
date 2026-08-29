import { apiClient } from './client';
import { Order, OrderStatus, PaginatedResponse, ApiResponse } from '../types';

export const ordersApi = {
  getMy: async () => {
    const res = await apiClient.get<ApiResponse<Order[]>>('/orders/my');
    return res.data;
  },

  listAdmin: async (params?: { status?: OrderStatus; search?: string; customer_id?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.customer_id) searchParams.append('customer_id', params.customer_id);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const res = await apiClient.get<PaginatedResponse<Order>>(`/orders?${searchParams.toString()}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data;
  },

  create: async (data: {
    customer_id: string;
    service_id?: string;
    design_id?: string;
    measurement_profile_id?: string;
    price: number;
    advance_amount?: number;
    expected_delivery_date?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return res.data;
  },

  updateStatus: async (id: string, status: OrderStatus, notes?: string) => {
    const res = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status, notes });
    return res.data;
  },

  cancel: async (id: string, reason?: string) => {
    const searchParams = new URLSearchParams();
    if (reason) searchParams.append('reason', reason);
    const res = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${id}/cancel?${searchParams.toString()}`,
      { reason, notes: reason }
    );
    return res.data;
  },

  delete: async (id: string, reason?: string) => {
    const searchParams = new URLSearchParams();
    if (reason) searchParams.append('reason', reason);
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/orders/${id}?${searchParams.toString()}`
    );
    return res.data;
  }
};
