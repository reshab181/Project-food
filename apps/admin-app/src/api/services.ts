import { ApiListResponse, AuthResponse, Coupon, DashboardSummary, InventoryItem, Order, Product, UserProfile } from '@bambam/shared';
import { apiClient } from './client';

export const adminAuthApi = {
  login(identifier: string, password: string) {
    return apiClient.post<AuthResponse>('/auth/login', { identifier, password });
  },
  registerPushToken(expoPushToken: string) {
    return apiClient.post('/auth/push-token', { expoPushToken });
  }
};

export const adminOpsApi = {
  dashboard() {
    return apiClient.get<DashboardSummary>('/admin/dashboard');
  },
  orders() {
    return apiClient.get<ApiListResponse<Order>>('/orders');
  },
  updateOrderStatus(id: string, status: string) {
    return apiClient.patch<Order>(`/orders/${id}/status`, { status });
  },
  products() {
    return apiClient.get<ApiListResponse<Product>>('/products');
  },
  createProduct(payload: Partial<Product>) {
    return apiClient.post<Product>('/products', payload);
  },
  updateProduct(id: string, payload: Partial<Product>) {
    return apiClient.patch<Product>(`/products/${id}`, payload);
  },
  inventory() {
    return apiClient.get<ApiListResponse<InventoryItem>>('/inventory');
  },
  staff() {
    return apiClient.get<ApiListResponse<UserProfile>>('/admin/staff');
  },
  createStaff(payload: { fullName: string; email: string; phone: string; password: string; permissions?: string[] }) {
    return apiClient.post<UserProfile>('/admin/staff', payload);
  },
  customers() {
    return apiClient.get<ApiListResponse<UserProfile>>('/admin/customers');
  },
  coupons() {
    return apiClient.get<ApiListResponse<Coupon>>('/coupons');
  },
  createCoupon(payload: Partial<Coupon>) {
    return apiClient.post<Coupon>('/coupons', payload);
  },
  reports() {
    return apiClient.get('/admin/reports');
  }
};
