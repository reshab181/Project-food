import mongoose, { Schema } from 'mongoose';

// Stores a one-time passcode request for a phone number. The code itself is
// hashed (never stored in plain text). A TTL index auto-deletes expired docs.
const otpSchema = new Schema(
  {
    phone: { type: String, required: true, index: true },
    // bcrypt hash of the numeric code
    codeHash: { type: String, required: true },
    // Optional name captured at request time, used when creating a new user.
    fullName: { type: String },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date }
  },
  { timestamps: true }
);

// Auto-remove documents once `expiresAt` passes (plus a small grace window).
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });

export const OtpModel = mongoose.model('Otp', otpSchema);
