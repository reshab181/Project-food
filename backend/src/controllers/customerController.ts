import { Response } from 'express';
import { OrderModel } from '../models/Order';
import { UserModel } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

export const listCustomers = asyncHandler(async (_req, res: Response) => {
  const customers = await UserModel.find({ role: 'customer' }).lean();
  const orderCounts = await Promise.all(
    customers.map(async (customer) => ({
      customerId: customer._id.toString(),
      orders: await OrderModel.countDocuments({ 'customer._id': customer._id.toString() })
    }))
  );

  res.json({
    data: customers.map((customer) => ({
      ...customer,
      totalOrders: orderCounts.find((item) => item.customerId === customer._id.toString())?.orders ?? 0
    })),
    meta: { total: customers.length, page: 1, pageSize: customers.length }
  });
});
