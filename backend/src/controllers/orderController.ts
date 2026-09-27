import { Response } from 'express';
import { OrderStatus } from '@bambam/shared';
import { OrderModel } from '../models/Order';
import { CouponModel } from '../models/Coupon';
import { ProductModel } from '../models/Product';
import { UserModel } from '../models/User';
import { notificationService } from '../services/notificationService';
import { invoiceService } from '../services/invoiceService';
import { socketService } from '../services/socketService';
import { AuthenticatedRequest } from '../types/auth';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { createOrderSchema } from '../validation/order';

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

export const getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = req.auth?.role === 'customer'
    ? { _id: req.params.id, 'customer._id': req.auth.userId }
    : { _id: req.params.id };
  const order = await OrderModel.findOne(query).lean();
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  res.json(order);
});

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = createOrderSchema.parse(req.body);
  const user = await UserModel.findById(req.auth?.userId);
  if (!user) {
    throw new ApiError(404, 'Customer not found.');
  }

  const resolvedItems = [] as Array<Record<string, unknown>>;
  let subtotal = 0;

  for (const item of input.items) {
    const product = await ProductModel.findOne({ _id: item.productId, isAvailable: true }).lean();
    if (!product) {
      throw new ApiError(409, 'One or more items are no longer available. Please refresh your cart.');
    }

    const variant = product.variants.find(
      (candidate: any) => String(candidate._id) === item.variantId || candidate.value === item.variantId
    );
    if (!variant) {
      throw new ApiError(409, `${product.name} is no longer available in the selected variant.`);
    }

    const addOns = product.addOns.filter((addOn: any) => item.addOnIds.includes(String(addOn._id)));
    if (addOns.length !== new Set(item.addOnIds).size) {
      throw new ApiError(400, `An invalid add-on was selected for ${product.name}.`);
    }

    const addOnTotal = addOns.reduce((sum: number, addOn: any) => sum + addOn.price, 0);
    const totalPrice = (variant.price + addOnTotal) * item.quantity;
    subtotal += totalPrice;
    resolvedItems.push({
      productId: String(product._id), productName: product.name, category: product.category,
      imageUrl: product.imageUrls[0] ?? '', variantLabel: variant.label, quantity: item.quantity,
      unitPrice: variant.price, totalPrice, addOns: addOns.map((addOn: any) => ({ name: addOn.name, price: addOn.price })), veg: true
    });
  }

  let discount = 0;
  let couponCode: string | undefined;
  if (input.couponCode) {
    const coupon = await CouponModel.findOne({ code: input.couponCode.toUpperCase(), isActive: true }).lean();
    if (!coupon || subtotal < coupon.minimumOrderValue) {
      throw new ApiError(409, 'This coupon is no longer valid for your order.');
    }
    const rawDiscount = coupon.discountType === 'percentage' ? subtotal * (coupon.discountValue / 100) : coupon.discountValue;
    discount = Math.min(rawDiscount, coupon.maxDiscountValue ?? rawDiscount, subtotal);
    couponCode = coupon.code;
  }

  const tax = Number((subtotal * 0.05).toFixed(2));
  const deliveryCharge = subtotal > 499 ? 0 : 40;
  const pricing = { subtotal, tax, deliveryCharge, discount, grandTotal: Number((subtotal + tax + deliveryCharge - discount).toFixed(2)) };

  const decrementedItems: Array<{ productId: string; variantId: string; quantity: number }> = [];
  try {
    for (const item of input.items) {
      const product = await ProductModel.findOne({ _id: item.productId }).lean();
      const variant = product?.variants.find((candidate: any) => String(candidate._id) === item.variantId || candidate.value === item.variantId);
      const stockVariantQuery = variant?._id
        ? { _id: variant._id, stockQty: { $gte: item.quantity } }
        : { value: item.variantId, stockQty: { $gte: item.quantity } };
      const updated = await ProductModel.findOneAndUpdate(
        { _id: item.productId, isAvailable: true, variants: { $elemMatch: stockVariantQuery } },
        { $inc: { 'variants.$.stockQty': -item.quantity } },
        { new: true }
      );
      if (!updated) {
        throw new ApiError(409, 'An item has insufficient stock. Please refresh your cart.');
      }
      decrementedItems.push({ productId: item.productId, variantId: String(variant?._id ?? item.variantId), quantity: item.quantity });
    }

    const order = await OrderModel.create({
    orderNumber: `BB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    customer: {
      _id: user._id.toString(),
      fullName: user.fullName,
      phone: user.phone
    },
    items: resolvedItems,
    address: input.address,
    pricing,
    paymentMethod: input.paymentMethod,
    // A payment is only marked paid after a verified gateway callback. Selecting
    // UPI or QR in the app is not proof that funds were received.
    paymentStatus: 'pending',
    scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
    note: input.note,
    couponCode,
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

    try {
      await Promise.all(
        adminUsers.map((admin) =>
          notificationService.createInAppNotification(
            admin._id.toString(), 'New order received', `Order ${order.orderNumber} has been placed by ${user.fullName}.`, 'order', order._id.toString()
          )
        )
      );
      await notificationService.sendPushToUsers(adminUsers.map((admin) => admin._id.toString()), 'New Pure Veg order', `Order ${order.orderNumber} requires attention.`, { orderId: order._id.toString() });
    } catch (notificationError) {
      console.error('Order notification failed', notificationError);
    }

    socketService.emitToAll('orders.created', order.toObject());
    res.status(201).json(order);
  } catch (error) {
    for (const item of decrementedItems) {
      await ProductModel.updateOne({ _id: item.productId, 'variants._id': item.variantId }, { $inc: { 'variants.$.stockQty': item.quantity } });
    }
    throw error;
  }
});

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body as { status: OrderStatus };
  if (!Object.prototype.hasOwnProperty.call(timelineLabels, status)) {
    throw new ApiError(400, 'Invalid order status.');
  }
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

  try {
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
  } catch (notificationError) {
    console.error('Order-status notification failed', notificationError);
  }

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
