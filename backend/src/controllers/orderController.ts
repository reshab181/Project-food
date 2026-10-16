import { randomUUID } from 'crypto';
import { Response } from 'express';
import { OrderStatus } from '@bambam/shared';
import { OrderModel } from '../models/Order';
import { UserModel } from '../models/User';
import { notificationService } from '../services/notificationService';
import { invoiceService } from '../services/invoiceService';
import { socketService } from '../services/socketService';
import { AuthenticatedRequest } from '../types/auth';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

const timelineLabels: Record<OrderStatus, { title: string; description: string }> = {
  placed: { title: 'Order placed', description: 'Customer order has been created.' },
  confirmed: { title: 'Order confirmed', description: 'The order has been accepted by the shop.' },
  preparing: { title: 'Preparing', description: 'Kitchen staff is preparing the order.' },
  out_for_delivery: { title: 'Out for delivery', description: 'The delivery partner is on the way.' },
  delivered: { title: 'Delivered', description: 'Order delivered successfully.' },
  rejected: { title: 'Rejected', description: 'Order could not be fulfilled.' }
};

export const listOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = req.auth?.role === 'customer' ? { 'customer._id': req.auth?.userId } : {};
  const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
  res.json({ data: orders, meta: { total: orders.length, page: 1, pageSize: orders.length } });
});

export const getOrderById = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const order = await OrderModel.findById(_req.params.id).lean();
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  res.json(order);
});

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await UserModel.findById(req.auth?.userId);
  if (!user) {
    throw new ApiError(404, 'Customer not found.');
  }

  const orderCount = await OrderModel.countDocuments();
  const order = await OrderModel.create({
    ...req.body,
    // String _id has no auto-default, so generate one for new orders.
    _id: req.body._id ?? `ord_${randomUUID()}`,
    orderNumber: `BB-${1001 + orderCount}`,
    customer: {
      _id: user._id.toString(),
      fullName: user.fullName,
      phone: user.phone
    },
    status: 'placed',
    timeline: [
      {
        status: 'placed',
        ...timelineLabels.placed,
        createdAt: new Date()
      }
    ]
  });

  const adminUsers = await UserModel.find({ role: { $in: ['super_admin', 'staff'] } }).lean();

  await Promise.all(
    adminUsers.map((admin) =>
      notificationService.createInAppNotification(
        admin._id.toString(),
        'New order received',
        `Order ${order.orderNumber} has been placed by ${user.fullName}.`,
        'order',
        order._id.toString()
      )
    )
  );

  await notificationService.sendPushToUsers(
    adminUsers.map((admin) => admin._id.toString()),
    'New Pure Veg order',
    `Order ${order.orderNumber} requires attention.`,
    { orderId: order._id.toString() }
  );

  socketService.emitToAll('orders.created', order.toObject());
  res.status(201).json(order);
});

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body as { status: OrderStatus };
  const order = await OrderModel.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  order.status = status;
  order.timeline.push({
    status,
    ...timelineLabels[status],
    createdAt: new Date()
  } as any);
  await order.save();

  const customerId = order.customer?._id;
  if (!customerId) {
    throw new ApiError(500, 'Order customer information is missing.');
  }

  await notificationService.createInAppNotification(
    customerId,
    'Order update',
    `Your order ${order.orderNumber} is now ${status.replaceAll('_', ' ')}.`,
    'order',
    order._id.toString()
  );

  await notificationService.sendPushToUsers(
    [customerId],
    'Order status updated',
    `Order ${order.orderNumber} is ${status.replaceAll('_', ' ')}.`,
    { orderId: order._id.toString(), status }
  );

  socketService.emitToAll('orders.updated', order.toObject());
  res.json(order);
});

export const assignDelivery = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await OrderModel.findByIdAndUpdate(
    req.params.id,
    { deliveryPartnerName: req.body.deliveryPartnerName },
    { new: true }
  );
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  socketService.emitToAll('orders.updated', order.toObject());
  res.json(order);
});

export const getInvoice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await OrderModel.findById(req.params.id).lean();
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  res.json({ invoiceHtml: invoiceService.buildInvoiceHtml(order as any) });
});
