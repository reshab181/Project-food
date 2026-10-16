import { OrderStatus, UserRole } from '@bambam/shared';

export const userRoles: UserRole[] = ['customer', 'super_admin', 'staff', 'delivery_partner'];

export const orderStatuses: OrderStatus[] = [
  'placed',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'rejected'
];

export const defaultStaffPermissions = [
  'view_orders',
  'view_products',
  'view_inventory',
  'view_customers'
];

export const superAdminPermissions = [
  'manage_orders',
  'manage_products',
  'manage_inventory',
  'manage_staff',
  'manage_offers',
  'manage_reports',
  'manage_notifications'
];
