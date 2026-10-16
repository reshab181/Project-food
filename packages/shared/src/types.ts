export type CategorySlug = 'cakes' | 'pizza' | 'burger';

export type UserRole = 'customer' | 'super_admin' | 'staff' | 'delivery_partner';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected';

export type PaymentMethod = 'cod' | 'upi' | 'qr' | 'razorpay';

export interface Address {
  _id?: string;
  label: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ProductVariant {
  _id?: string;
  label: string;
  value: string;
  weightInGrams?: number;
  size?: string;
  price: number;
  stockQty: number;
  isDefault?: boolean;
}

export interface ProductAddOn {
  _id?: string;
  name: string;
  price: number;
}

export interface ProductReview {
  _id?: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: CategorySlug;
  shortDescription: string;
  description: string;
  ingredients: string[];
  imageUrls: string[];
  badges: string[];
  rating: number;
  reviewCount: number;
  veg: true;
  isBestSeller: boolean;
  isTrending: boolean;
  isRecommended: boolean;
  isAvailable: boolean;
  variants: ProductVariant[];
  addOns: ProductAddOn[];
  stockQty: number;
  prepTimeMinutes: number;
  loyaltyPoints: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  addOns: ProductAddOn[];
  note?: string;
}

export interface Coupon {
  _id?: string;
  code: string;
  title: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minimumOrderValue: number;
  maxDiscountValue?: number;
  isActive: boolean;
}

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  loyaltyPoints: number;
  isPureVegBusinessVerified?: boolean;
  addresses: Address[];
  permissions?: string[];
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  createdAt: string;
}

export interface OrderLineItem {
  productId: string;
  productName: string;
  category: CategorySlug;
  imageUrl: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addOns: ProductAddOn[];
  veg: true;
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: Pick<UserProfile, '_id' | 'fullName' | 'phone'>;
  items: OrderLineItem[];
  address: Address;
  pricing: OrderPricing;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed';
  scheduledFor?: string;
  note?: string;
  couponCode?: string;
  deliveryPartnerName?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  category: 'raw_material' | 'finished_good';
  lastUpdatedAt: string;
}

export interface DashboardSummary {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  lowStockItems: number;
  topProducts: Array<{
    productId: string;
    name: string;
    unitsSold: number;
  }>;
}

export interface NotificationPayload {
  _id?: string;
  title: string;
  message: string;
  type: 'order' | 'offer' | 'system';
  orderId?: string;
  createdAt: string;
  readAt?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}
