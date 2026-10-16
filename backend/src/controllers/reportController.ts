import { Response } from 'express';
import { OrderModel } from '../models/Order';
import { asyncHandler } from '../utils/asyncHandler';

const groupByRange = (orders: any[], mode: 'daily' | 'weekly' | 'monthly') => {
  const formatter =
    mode === 'daily'
      ? (date: Date) => date.toISOString().slice(0, 10)
      : mode === 'weekly'
        ? (date: Date) => {
            const copy = new Date(date);
            copy.setDate(copy.getDate() - copy.getDay());
            return copy.toISOString().slice(0, 10);
          }
        : (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  return orders.reduce<Record<string, { revenue: number; orders: number }>>((acc, order) => {
    const key = formatter(new Date(order.createdAt));
    acc[key] = acc[key] ?? { revenue: 0, orders: 0 };
    acc[key].revenue += order.pricing.grandTotal;
    acc[key].orders += 1;
    return acc;
  }, {});
};

export const getReports = asyncHandler(async (_req, res: Response) => {
  const orders = await OrderModel.find().lean();
  res.json({
    daily: groupByRange(orders, 'daily'),
    weekly: groupByRange(orders, 'weekly'),
    monthly: groupByRange(orders, 'monthly')
  });
});
