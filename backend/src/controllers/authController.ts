import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { env } from '../config/env';
import { defaultStaffPermissions, superAdminPermissions } from '../constants';
import { OtpModel } from '../models/Otp';
import { UserModel } from '../models/User';
import { smsService } from '../services/smsService';
import { signAccessToken, signRefreshToken } from '../services/tokenService';
import { AuthenticatedRequest } from '../types/auth';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

const demoAddress = (line1: string) => ({
  label: 'Home',
  line1,
  city: 'Indore',
  state: 'Madhya Pradesh',
  postalCode: '452001'
});

// Normalise a phone to a simple comparable form. Accepts "+91..." or 10-digit
// local numbers and keeps a leading +; strips spaces/dashes.
const normalisePhone = (raw: string) => {
  const trimmed = String(raw ?? '').trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
};

const isValidPhone = (phone: string) => /^\+?\d{10,15}$/.test(phone);

const buildAuthPayload = (user: any) => ({
  accessToken: signAccessToken({ userId: user._id.toString(), role: user.role }),
  refreshToken: signRefreshToken({ userId: user._id.toString(), role: user.role }),
  user: {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    loyaltyPoints: user.loyaltyPoints,
    addresses: user.addresses,
    permissions: user.permissions,
    isPureVegBusinessVerified: user.isPureVegBusinessVerified
  }
});

export const signup = asyncHandler(async (req, res: Response) => {
  const fullName = String(req.body.fullName ?? '').trim();
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const phone = normalisePhone(req.body.phone);
  const password = String(req.body.password ?? '');

  if (!fullName) throw new ApiError(400, 'Please enter your full name.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new ApiError(400, 'Please enter a valid email address.');
  if (!isValidPhone(phone)) throw new ApiError(400, 'Please enter a valid phone number.');
  if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters.');

  const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email or phone already exists.');
  }

  const passwordHash = await (UserModel as any).hashPassword(password);
  const user = await UserModel.create({
    fullName,
    email,
    phone,
    passwordHash,
    role: 'customer',
    permissions: [],
    addresses: [demoAddress('Bam Bam Demo Address')]
  });

  res.status(201).json(buildAuthPayload(user));
});

export const login = asyncHandler(async (req, res: Response) => {
  const identifier = String(req.body.identifier ?? '').trim();
  const password = String(req.body.password ?? '');

  if (!identifier || !password) {
    throw new ApiError(400, 'Please enter your email/phone and password.');
  }

  const user = await UserModel.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: normalisePhone(identifier) }, { phone: identifier }]
  });

  if (!user || !(await (user as any).comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  res.json(buildAuthPayload(user));
});

export const googleLogin = asyncHandler(async (req, res: Response) => {
  const { email, fullName, googleId } = req.body;
  let user = await UserModel.findOne({ email });

  if (!user) {
    user = await UserModel.create({
      fullName,
      email,
      phone: `google-${googleId}`,
      googleId,
      role: 'customer',
      addresses: [
        {
          label: 'Home',
          line1: 'Google Demo Address',
          city: 'Indore',
          state: 'Madhya Pradesh',
          postalCode: '452001'
        }
      ]
    });
  }

  res.json(buildAuthPayload(user));
});

// Step 1 of phone auth: generate a one-time code, store its hash, and send it
// over SMS. In dev (no Twilio configured) the code is returned/logged so it can
// be tested without a real SMS provider.
export const requestOtp = asyncHandler(async (req, res: Response) => {
  const phone = normalisePhone(req.body.phone);
  const fullName = req.body.fullName ? String(req.body.fullName).trim() : undefined;

  if (!isValidPhone(phone)) {
    throw new ApiError(400, 'Please enter a valid phone number.');
  }

  // Generate a numeric code of the configured length.
  const max = 10 ** env.OTP_LENGTH;
  const code = String(Math.floor(Math.random() * max)).padStart(env.OTP_LENGTH, '0');
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + env.OTP_TTL_SECONDS * 1000);

  // Replace any previous pending OTP for this phone.
  await OtpModel.deleteMany({ phone });
  await OtpModel.create({ phone, codeHash, fullName, expiresAt, attempts: 0 });

  const message = `Your Bam Bam Cake Shop verification code is ${code}. It expires in ${Math.round(
    env.OTP_TTL_SECONDS / 60
  )} minutes.`;
  const delivered = await smsService.send(phone, message);

  const payload: Record<string, unknown> = {
    success: true,
    message: delivered ? 'OTP sent to your phone.' : 'OTP generated.',
    channel: delivered ? 'sms' : 'dev',
    expiresInSeconds: env.OTP_TTL_SECONDS
  };

  // Expose the code only in dev fallback (no provider) so local testing works.
  if (!delivered && env.NODE_ENV !== 'production' && env.OTP_EXPOSE_IN_DEV) {
    payload.devCode = code;
  }

  res.json(payload);
});

// Step 2 of phone auth: verify the code, then log the user in (creating the
// account on first login).
export const verifyOtp = asyncHandler(async (req, res: Response) => {
  const phone = normalisePhone(req.body.phone);
  const code = String(req.body.code ?? req.body.otp ?? '').trim();

  if (!isValidPhone(phone)) throw new ApiError(400, 'Please enter a valid phone number.');
  if (!code) throw new ApiError(400, 'Please enter the OTP.');

  const record = await OtpModel.findOne({ phone, consumedAt: { $exists: false } }).sort({ createdAt: -1 });
  if (!record) {
    throw new ApiError(400, 'No OTP request found. Please request a new code.');
  }
  if (record.expiresAt.getTime() < Date.now()) {
    await OtpModel.deleteOne({ _id: record._id });
    throw new ApiError(400, 'OTP has expired. Please request a new code.');
  }
  if ((record.attempts ?? 0) >= env.OTP_MAX_ATTEMPTS) {
    await OtpModel.deleteOne({ _id: record._id });
    throw new ApiError(429, 'Too many incorrect attempts. Please request a new code.');
  }

  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    record.attempts = (record.attempts ?? 0) + 1;
    await record.save();
    throw new ApiError(400, 'Incorrect OTP. Please try again.');
  }

  // Code is valid - consume it.
  record.consumedAt = new Date();
  await record.save();
  await OtpModel.deleteMany({ phone });

  // Find or create the customer.
  let user = await UserModel.findOne({ phone });
  if (!user) {
    const fullName = record.fullName?.trim() || 'Pure Veg Customer';
    user = await UserModel.create({
      fullName,
      email: `${phone.replace(/\D/g, '')}@otp.local`,
      phone,
      role: 'customer',
      addresses: [demoAddress('OTP Demo Address')]
    });
  }

  res.json(buildAuthPayload(user));
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await UserModel.findById(req.auth?.userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  res.json(buildAuthPayload(user));
});

export const registerPushToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { expoPushToken } = req.body;
  const user = await UserModel.findById(req.auth?.userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  user.expoPushTokens = Array.from(new Set([...(user.expoPushTokens ?? []), expoPushToken]));
  await user.save();

  res.json({ success: true });
});

export const seedSuperAdmin = asyncHandler(async (_req, res: Response) => {
  const email = 'admin@bambamcakeshop.com';
  let user = await UserModel.findOne({ email });

  if (!user) {
    const passwordHash = await (UserModel as any).hashPassword('Admin@123');
    user = await UserModel.create({
      fullName: 'Bam Bam Owner',
      email,
      phone: '+910000000000',
      passwordHash,
      role: 'super_admin',
      permissions: [...superAdminPermissions]
    });
  }

  if (user.role === 'staff') {
    user.permissions = [...defaultStaffPermissions];
    await user.save();
  }

  res.json({ message: 'Super admin is ready.', credentials: { email, password: 'Admin@123' } });
});
