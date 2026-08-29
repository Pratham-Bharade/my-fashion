import { apiClient } from './client';
import { Appointment, AvailableSlot, AppointmentStatus, PaginatedResponse, ApiResponse } from '../types';

export const appointmentsApi = {
  getAvailableSlots: async (dateStr: string) => {
    const res = await apiClient.get<ApiResponse<AvailableSlot[]>>(`/appointments/available-slots?date=${dateStr}`);
    return res.data;
  },

  getMy: async () => {
    const res = await apiClient.get<ApiResponse<Appointment[]>>('/appointments/my');
    return res.data;
  },

  listAdmin: async (params?: { date?: string; status?: AppointmentStatus; customer_id?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.customer_id) searchParams.append('customer_id', params.customer_id);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const res = await apiClient.get<PaginatedResponse<Appointment>>(`/appointments?${searchParams.toString()}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return res.data;
  },

  book: async (data: {
    service_id: string;
    measurement_profile_id?: string | null;
    appointment_date: string;
    start_time: string;
    phone?: string;
    notes?: string;
    reference_image?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Appointment>>('/appointments', data);
    return res.data;
  },

  updateStatus: async (id: string, status: AppointmentStatus, notes?: string) => {
    const res = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status, notes });
    return res.data;
  },

  reschedule: async (id: string, appointment_date: string, start_time: string, notes?: string) => {
    const res = await apiClient.patch<ApiResponse<Appointment>>(`/appointments/${id}/reschedule`, {
      appointment_date,
      start_time,
      notes
    });
    return res.data;
  },

  delete: async (id: string, reason?: string) => {
    const searchParams = new URLSearchParams();
    if (reason) searchParams.append('reason', reason);
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/appointments/${id}?${searchParams.toString()}`
    );
    return res.data;
  }
};
