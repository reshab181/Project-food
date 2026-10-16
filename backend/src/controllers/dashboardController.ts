import { Response } from 'express';
import { InventoryItemModel } from '../models/InventoryItem';
import { OrderModel } from '../models/Order';
import { asyncHandler } from '../utils/asyncHandler';

export const getDashboardSummary = asyncHandler(async (_req, res: Response) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayOrders = await OrderModel.find({ createdAt: { $gte: startOfDay } }).lean();
  const lowStockItems = await InventoryItemModel.countDocuments({
    $expr: { $lte: ['$currentStock', '$reorderLevel'] }
  });

  const topProductMap = new Map<string, { name: string; unitsSold: number }>();
  todayOrders.forEach((order) => {
    order.items.forEach((item) => {
      const current = topProductMap.get(item.productId) ?? { name: item.productName, unitsSold: 0 };
      current.unitsSold += item.quantity;
      topProductMap.set(item.productId, current);
    });
  });

  res.json({
    todayOrders: todayOrders.length,
    todayRevenue: todayOrders.reduce((sum, order) => sum + (order.pricing?.grandTotal ?? 0), 0),
    pendingOrders: todayOrders.filter((order) => ['placed', 'confirmed', 'preparing'].includes(order.status)).length,
    deliveredOrders: todayOrders.filter((order) => order.status === 'delivered').length,
    lowStockItems,
    topProducts: Array.from(topProductMap.entries())
      .map(([productId, value]) => ({ productId, ...value }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5)
  });
});
