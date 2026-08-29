import { apiClient } from './client';
import { Payment, PaymentMethod, PaymentType, PaginatedResponse, ApiResponse } from '../types';

export const paymentsApi = {
  getMy: async () => {
    const res = await apiClient.get<ApiResponse<Payment[]>>('/payments/my');
    return res.data;
  },

  listAdmin: async (params?: { order_id?: string; customer_id?: string; payment_method?: PaymentMethod; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.order_id) searchParams.append('order_id', params.order_id);
    if (params?.customer_id) searchParams.append('customer_id', params.customer_id);
    if (params?.payment_method) searchParams.append('payment_method', params.payment_method);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const res = await apiClient.get<PaginatedResponse<Payment>>(`/payments?${searchParams.toString()}`);
    return res.data;
  },

  record: async (data: {
    order_id: string;
    amount: number;
    payment_type?: PaymentType;
    payment_method: PaymentMethod;
    transaction_id?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return res.data;
  },

  create: async (data: {
    order_id: string;
    amount: number;
    payment_type?: PaymentType;
    payment_method: PaymentMethod;
    transaction_id?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return res.data;
  }
};
