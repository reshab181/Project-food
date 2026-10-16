import type { Expo as ExpoType, ExpoPushMessage } from 'expo-server-sdk';
import { env } from '../config/env';
import { NotificationModel } from '../models/Notification';
import { UserModel } from '../models/User';

// expo-server-sdk is published as an ESM-only package. The backend is bundled
// to CommonJS for production, so we load it lazily via dynamic import() which
// works from a CJS runtime. The instance is cached after first use.
let expoInstance: ExpoType | null = null;
let ExpoClass: typeof import('expo-server-sdk').Expo | null = null;

const getExpo = async () => {
  if (!ExpoClass) {
    const mod = await import('expo-server-sdk');
    ExpoClass = mod.Expo;
  }
  if (!expoInstance) {
    expoInstance = new ExpoClass({ accessToken: env.EXPO_ACCESS_TOKEN });
  }
  return { Expo: ExpoClass, expo: expoInstance };
};

export const notificationService = {
  async createInAppNotification(
    userId: string,
    title: string,
    message: string,
    type: 'order' | 'offer' | 'system',
    orderId?: string
  ) {
    return NotificationModel.create({ userId, title, message, type, orderId });
  },

  async sendPushToUsers(
    userIds: string[],
    title: string,
    body: string,
    data: Record<string, unknown>
  ) {
    const { Expo, expo } = await getExpo();
    const users = await UserModel.find({ _id: { $in: userIds } }).lean();

    const allTokens = users.flatMap((user) => user.expoPushTokens ?? []);
    const validTokens = allTokens.filter((token) => Expo.isExpoPushToken(token));

    if (allTokens.length === 0) {
      console.log(`[push] no device tokens registered for ${userIds.length} target user(s); nothing to send. (title: "${title}")`);
      return;
    }
    if (validTokens.length === 0) {
      console.warn(`[push] ${allTokens.length} token(s) found but none are valid Expo push tokens. (title: "${title}")`);
      return;
    }

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default' as const,
      title,
      body,
      data,
      channelId: 'orders'
    }));

    try {
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        const receipts = await expo.sendPushNotificationsAsync(chunk);
        receipts.forEach((r: any) => {
          if (r.status === 'error') {
            console.warn('[push] send error:', r.message, r.details ?? '');
          }
        });
      }
      console.log(`[push] dispatched "${title}" to ${messages.length} device(s).`);
    } catch (error) {
      console.error('[push] failed to send push notifications:', error);
    }
  }
};
