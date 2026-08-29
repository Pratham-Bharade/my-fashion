import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import { ScrollToTop } from './components/common/ScrollToTop';
import { PublicLayout } from './components/layout/PublicLayout';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Customer Pages
import { DashboardPage } from './pages/customer/DashboardPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { MeasurementsPage } from './pages/customer/MeasurementsPage';
import { BookAppointmentPage } from './pages/customer/BookAppointmentPage';
import { AppointmentsPage } from './pages/customer/AppointmentsPage';
import { CustomRequestsPage } from './pages/customer/CustomRequestsPage';
import { CreateCustomRequestPage } from './pages/customer/CreateCustomRequestPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { CustomerPaymentsPage } from './pages/customer/CustomerPaymentsPage';
import { NotificationsPage } from './pages/customer/NotificationsPage';
import { CancellationsPage } from './pages/customer/CancellationsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminCustomerDetailPage } from './pages/admin/AdminCustomerDetailPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminDesignsPage } from './pages/admin/AdminDesignsPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminCustomRequestsPage } from './pages/admin/AdminCustomRequestsPage';
import { AdminQuotationsPage } from './pages/admin/AdminQuotationsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminContactInquiriesPage } from './pages/admin/AdminContactInquiriesPage';

// Protected Customer Route Guard with Clean 1-Line Message
const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const fullPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(fullPath)}&msg=${encodeURIComponent('Please sign in or create an account to continue.')}`}
        replace
      />
    );
  }

  return <>{children}</>;
};

// Protected Admin Route Guard with Clean 1-Line Message
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const fullPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(fullPath)}&msg=${encodeURIComponent('Please sign in as admin to access the atelier studio.')}`}
        replace
      />
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* 1. Public Storefront Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/designs" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Booking & Custom Request flows with redirect & 1-line message */}
        <Route
          path="/appointments/book"
          element={
            <CustomerRoute>
              <BookAppointmentPage />
            </CustomerRoute>
          }
        />
        <Route
          path="/custom-requests/create"
          element={
            <CustomerRoute>
              <CreateCustomRequestPage />
            </CustomerRoute>
          }
        />
      </Route>

      {/* 2. Customer Portal Routes */}
      <Route
        element={
          <CustomerRoute>
            <CustomerLayout />
          </CustomerRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/measurements" element={<MeasurementsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/custom-requests" element={<CustomRequestsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/bookings" element={<OrdersPage />} />
        <Route path="/bookings/:id" element={<OrderDetailPage />} />
        <Route path="/cancellations" element={<CancellationsPage />} />
        <Route path="/payments" element={<CustomerPaymentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* 3. Admin Atelier Studio Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="designs" element={<AdminDesignsPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="custom-requests" element={<AdminCustomRequestsPage />} />
        <Route path="quotations" element={<AdminQuotationsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="contact" element={<AdminContactInquiriesPage />} />
      </Route>

      {/* 4. Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
};
