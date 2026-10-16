import mongoose, { Schema } from 'mongoose';

const couponSchema = new Schema(
  {
    _id: { type: String },
    code: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['flat', 'percentage'], required: true },
    discountValue: { type: Number, required: true },
    minimumOrderValue: { type: Number, required: true, default: 0 },
    maxDiscountValue: Number,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const CouponModel = mongoose.model('Coupon', couponSchema);
