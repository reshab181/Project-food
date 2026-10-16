import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';

const addressSchema = new Schema(
  {
    label: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    landmark: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['customer', 'super_admin', 'staff', 'delivery_partner'], default: 'customer' },
    avatarUrl: String,
    loyaltyPoints: { type: Number, default: 0 },
    permissions: [{ type: String }],
    isPureVegBusinessVerified: { type: Boolean, default: true },
    googleId: String,
    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    expoPushTokens: [{ type: String }]
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.passwordHash ?? '');
};

userSchema.statics.hashPassword = async (password: string) => bcrypt.hash(password, 10);

export const UserModel = mongoose.model('User', userSchema);
