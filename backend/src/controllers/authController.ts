import { Response } from 'express';
import { defaultStaffPermissions, superAdminPermissions } from '../constants';
import { UserModel } from '../models/User';
import { signAccessToken, signRefreshToken } from '../services/tokenService';
import { AuthenticatedRequest } from '../types/auth';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { addressInputSchema } from '../validation/auth';

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
  const { fullName, email, phone, password } = req.body;
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
    addresses: [
      {
        label: 'Home',
        line1: 'Bam Bam Demo Address',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452001'
      }
    ]
  });

  res.status(201).json(buildAuthPayload(user));
});

export const login = asyncHandler(async (req, res: Response) => {
  const identifier = String(req.body.identifier ?? '').trim();
  const password = String(req.body.password ?? '');
  if (!identifier || !password) {
    throw new ApiError(400, 'Email or phone and password are required.');
  }
  const user = await UserModel.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }]
  });

  if (!user || !(await (user as any).comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  res.json(buildAuthPayload(user));
});

export const googleLogin = asyncHandler(async (req, res: Response) => {
  throw new ApiError(501, 'Google sign-in is not configured yet.');
  /*
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
  */
});

export const sendOtp = asyncHandler(async (_req, res: Response) => {
  throw new ApiError(501, 'OTP sign-in is not configured yet.');
});

export const verifyOtp = asyncHandler(async (req, res: Response) => {
  throw new ApiError(501, 'OTP sign-in is not configured yet.');
  /*
  const { phone, fullName = 'Pure Veg Customer' } = req.body;
  let user = await UserModel.findOne({ phone });

  if (!user) {
    user = await UserModel.create({
      fullName,
      email: `${String(phone).replace(/\D/g, '')}@otp.local`,
      phone,
      role: 'customer',
      addresses: [
        {
          label: 'Home',
          line1: 'OTP Demo Address',
          city: 'Indore',
          state: 'Madhya Pradesh',
          postalCode: '452001'
        }
      ]
    });
  }

  res.json(buildAuthPayload(user));
  */
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

export const addAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const address = addressInputSchema.parse(req.body);
  const user = await UserModel.findById(req.auth?.userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // The most recently saved address is the default used at checkout.
  user.addresses = [address, ...(user.addresses ?? [])].slice(0, 5) as any;
  await user.save();
  res.status(201).json({ user: buildAuthPayload(user).user });
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
