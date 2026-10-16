import { Response } from 'express';
import { CouponModel } from '../models/Coupon';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const listCoupons = asyncHandler(async (_req, res: Response) => {
  const coupons = await CouponModel.find().sort({ createdAt: -1 }).lean();
  res.json({ data: coupons, meta: { total: coupons.length, page: 1, pageSize: coupons.length } });
});

export const createCoupon = asyncHandler(async (req, res: Response) => {
  const coupon = await CouponModel.create({
    ...req.body,
    code: String(req.body.code).toUpperCase()
  });
  res.status(201).json(coupon);
});

export const updateCoupon = asyncHandler(async (req, res: Response) => {
  const coupon = await CouponModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }
  res.json(coupon);
});
