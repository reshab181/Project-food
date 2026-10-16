import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    category: { type: String, enum: ['cakes', 'pizza', 'burger'], required: true },
    imageUrl: { type: String, required: true },
    variantLabel: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    addOns: [
      {
        name: String,
        price: Number
      }
    ],
    veg: { type: Boolean, default: true }
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    label: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    landmark: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  { _id: false }
);

const timelineSchema = new Schema(
  {
    status: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    // Orders use string ids (e.g. seeded "ord_1001" and generated "ord_<uuid>")
    // to stay consistent with the rest of the schema. Without this, Mongoose
    // defaults _id to ObjectId and casting a string id throws a 500.
    _id: { type: String },
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      _id: { type: String, required: true },
      fullName: { type: String, required: true },
      phone: { type: String, required: true }
    },
    items: [orderItemSchema],
    address: addressSchema,
    pricing: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, required: true },
      deliveryCharge: { type: Number, required: true },
      discount: { type: Number, required: true },
      grandTotal: { type: Number, required: true }
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'rejected'],
      default: 'placed'
    },
    paymentMethod: { type: String, enum: ['cod', 'upi', 'qr', 'razorpay'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    // Human-readable delivery-time preference sent by the app
    // (e.g. "Today, 7:00 PM"), so this is a free-text string, not a Date.
    scheduledFor: String,
    note: String,
    couponCode: String,
    deliveryPartnerName: String,
    timeline: [timelineSchema]
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model('Order', orderSchema);
