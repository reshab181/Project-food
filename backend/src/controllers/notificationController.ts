import { Response } from 'express';
import { NotificationModel } from '../models/Notification';
import { AuthenticatedRequest } from '../types/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const listNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notifications = await NotificationModel.find({ userId: req.auth?.userId }).sort({ createdAt: -1 }).lean();
  res.json({
    data: notifications,
    meta: { total: notifications.length, page: 1, pageSize: notifications.length }
  });
});

export const markNotificationRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.auth?.userId },
    { readAt: new Date() },
    { new: true }
  );
  res.json(notification);
});
