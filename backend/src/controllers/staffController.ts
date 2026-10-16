import { Response } from 'express';
import { defaultStaffPermissions } from '../constants';
import { UserModel } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const listStaff = asyncHandler(async (_req, res: Response) => {
  const staffMembers = await UserModel.find({ role: { $in: ['super_admin', 'staff'] } }).lean();
  res.json({ data: staffMembers, meta: { total: staffMembers.length, page: 1, pageSize: staffMembers.length } });
});

export const createStaff = asyncHandler(async (req, res: Response) => {
  const { fullName, email, phone, password, permissions = defaultStaffPermissions } = req.body;
  const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw new ApiError(409, 'Staff member already exists.');
  }

  const passwordHash = await (UserModel as any).hashPassword(password);
  const staff = await UserModel.create({
    fullName,
    email,
    phone,
    passwordHash,
    role: 'staff',
    permissions
  });

  res.status(201).json(staff);
});

export const updateStaff = asyncHandler(async (req, res: Response) => {
  const staff = await UserModel.findOneAndUpdate(
    { _id: req.params.id, role: 'staff' },
    { permissions: req.body.permissions },
    { new: true }
  );

  if (!staff) {
    throw new ApiError(404, 'Staff member not found.');
  }

  res.json(staff);
});

export const removeStaff = asyncHandler(async (req, res: Response) => {
  const staff = await UserModel.findOneAndDelete({ _id: req.params.id, role: 'staff' });
  if (!staff) {
    throw new ApiError(404, 'Staff member not found.');
  }
  res.status(204).send();
});
