export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profile_image?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: CustomerProfile | null;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  address?: string | null;
  city?: string | null;
  pincode?: string | null;
  preferences?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export type ServiceCategory = string;

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description?: string | null;
  price: number;
  estimated_days: number;
  image?: string | null;
  allow_audio?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DesignCategory = string;

export interface Design {
  id: string;
  title: string;
  category: DesignCategory;
  description?: string | null;
  image: string;
  price?: number | null;
  tags?: string[] | null;
  allow_audio?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type GarmentType = 'BLOUSE' | 'KURTI' | 'SALWAR_SUIT' | 'LEHENGA' | 'GOWN' | 'CUSTOM';

export interface MeasurementProfile {
  id: string;
  customer_id: string;
  name: string;
  garment_type: GarmentType;
  measurements: Record<string, number | string>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  customer_id: string;
  service_id: string;
  measurement_profile_id?: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  contact_phone?: string | null;
  notes?: string | null;
  reference_image?: string | null;
  created_at: string;
  updated_at: string;
  customer?: User;
  service?: Service;
  measurement_profile?: MeasurementProfile;
}

export interface AvailableSlot {
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export type CustomRequestStatus = 'SUBMITTED' | 'REVIEWING' | 'QUOTATION_SENT' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'CONVERTED_TO_ORDER';

export interface CustomRequestImage {
  id: string;
  request_id: string;
  file_path: string;
  created_at: string;
}

export interface CustomRequest {
  id: string;
  customer_id: string;
  design_id?: string | null;
  garment_type: string;
  description: string;
  contact_phone?: string | null;
  fabric?: string | null;
  preferred_color?: string | null;
  occasion?: string | null;
  required_date?: string | null;
  measurement_profile_id?: string | null;
  status: CustomRequestStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: User;
  design?: Design;
  measurement_profile?: MeasurementProfile;
  images?: CustomRequestImage[];
  quotations?: Quotation[];
}

export type QuotationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Quotation {
  id: string;
  custom_request_id: string;
  customer_id: string;
  base_price: number;
  additional_charges: number;
  discount: number;
  final_amount: number;
  advance_amount: number;
  valid_until: string;
  status: QuotationStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: User;
  custom_request?: CustomRequest;
}

export type OrderStatus =
  | 'ORDER_RECEIVED'
  | 'MEASUREMENTS_CONFIRMED'
  | 'CUTTING'
  | 'STITCHING'
  | 'QUALITY_CHECK'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes?: string | null;
  changed_by?: string | null;
  created_at: string;
  actor?: User;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  service_id?: string | null;
  design_id?: string | null;
  measurement_profile_id?: string | null;
  custom_request_id?: string | null;
  price: number;
  advance_amount: number;
  remaining_amount: number;
  expected_delivery_date?: string | null;
  status: OrderStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: User;
  service?: Service;
  design?: Design;
  measurement_profile?: MeasurementProfile;
  status_history?: OrderStatusHistory[];
  review?: Review | null;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'ONLINE' | 'CARD' | 'NET_BANKING';
export type PaymentType = 'ADVANCE' | 'REMAINING' | 'FULL' | 'FINAL';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  transaction_reference?: string | null;
  transaction_id?: string | null;
  status: PaymentStatus;
  paid_at: string;
  created_at: string;
  customer?: User;
  order?: Order;
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'HIDDEN';

export interface Review {
  id: string;
  customer_id: string;
  order_id: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
  customer?: User;
  order?: Order;
}

export type NotificationType =
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'QUOTATION_CREATED'
  | 'QUOTATION_ACCEPTED'
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'PAYMENT_RECORDED'
  | 'ORDER_READY'
  | 'GENERAL';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link_url?: string | null;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  logo?: string | null;
  phone: string;
  email: string;
  address: string;
  whatsapp?: string | null;
  working_hours: Record<string, { open: string; close: string; is_closed: boolean }>;
  holidays: string[];
  social_links: Record<string, string>;
  about_text?: string | null;
  slot_duration_minutes?: number;
  max_appointments_per_slot?: number;
  updated_at: string;
}

export interface AdminDashboardStats {
  total_customers: number;
  todays_appointments: number;
  pending_appointments: number;
  active_orders: number;
  ready_orders: number;
  pending_payments_amount: number;
  monthly_revenue: number;
  total_revenue: number;
  new_custom_requests: number;
  total_orders?: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders_count: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  revenue: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DashboardAnalytics {
  stats: AdminDashboardStats;
  monthly_revenue_trend: MonthlyRevenue[];
  order_status_distribution: StatusCount[];
  orders_by_service_category: CategoryStat[];
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    customer: string;
    amount: number;
    date: string;
  }>;
}

export type ContactStatus = 'NEW' | 'REPLIED' | 'ARCHIVED';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
