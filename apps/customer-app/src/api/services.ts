import { Address, ApiListResponse, AuthResponse, NotificationPayload, Order, PaymentMethod, Product } from '@bambam/shared';
import { apiClient } from './client';

export const authApi = {
  login(identifier: string, password: string) {
    return apiClient.post<AuthResponse>('/auth/login', { identifier, password });
  },
  signup(payload: { fullName: string; email: string; phone: string; password: string }) {
    return apiClient.post<AuthResponse>('/auth/signup', payload);
  },
  otp(phone: string, fullName?: string) {
    return apiClient.post<AuthResponse>('/auth/verify-otp', { phone, fullName });
  },
  google(payload: { email: string; fullName: string; googleId: string }) {
    return apiClient.post<AuthResponse>('/auth/google', payload);
  },
  me() {
    return apiClient.get<AuthResponse>('/auth/me');
  },
  addAddress(payload: Address) {
    return apiClient.post<{ user: AuthResponse['user'] }>('/auth/addresses', payload);
  },
  registerPushToken(expoPushToken: string) {
    return apiClient.post('/auth/push-token', { expoPushToken });
  },
  deregisterPushToken(expoPushToken: string) {
    return apiClient.delete('/auth/push-token', { data: { expoPushToken } });
  }
};

export const productApi = {
  list(params?: Record<string, unknown>) {
    return apiClient.get<ApiListResponse<Product>>('/products', { params });
  },
  getById(id: string) {
    return apiClient.get<Product>(`/products/${id}`);
  },
  review(id: string, payload: { customerName: string; rating: number; comment: string }) {
    return apiClient.post(`/products/${id}/reviews`, payload);
  }
};

export const orderApi = {
  list() {
    return apiClient.get<ApiListResponse<Order>>('/orders');
  },
  place(payload: PlaceOrderPayload) {
    return apiClient.post<Order>('/orders', payload);
  },
  getById(id: string) {
    return apiClient.get<Order>(`/orders/${id}`);
  }
};

export interface PlaceOrderPayload {
  items: Array<{ productId: string; variantId: string; quantity: number; addOnIds: string[] }>;
  address: Address;
  paymentMethod: PaymentMethod;
  scheduledFor?: string;
  note?: string;
  couponCode?: string;
}

export const couponApi = {
  list() {
    return apiClient.get('/coupons');
  }
};

export const notificationApi = {
  list() {
    return apiClient.get<ApiListResponse<NotificationPayload>>('/notifications');
  }
};
