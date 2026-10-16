import mongoose, { Schema } from 'mongoose';

const variantSchema = new Schema(
  {
    _id: { type: String },
    label: { type: String, required: true },
    value: { type: String, required: true },
    weightInGrams: Number,
    size: String,
    price: { type: Number, required: true },
    stockQty: { type: Number, required: true, default: 0 },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true }
);

const addOnSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { _id: true }
);

const reviewSchema = new Schema(
  {
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const productSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, enum: ['cakes', 'pizza', 'burger'], required: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: [{ type: String, required: true }],
    imageUrls: [{ type: String }],
    badges: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    veg: { type: Boolean, default: true, immutable: true },
    isBestSeller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    variants: [variantSchema],
    addOns: [addOnSchema],
    stockQty: { type: Number, default: 0 },
    prepTimeMinutes: { type: Number, default: 30 },
    loyaltyPoints: { type: Number, default: 0 },
    reviews: [reviewSchema]
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model('Product', productSchema);
