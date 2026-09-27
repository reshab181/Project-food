// Web stub for push notifications.
// expo-notifications relies on native APIs (APNs / FCM) that are not
// available in a browser. We expose the same interface as the native
// version so imports don't need to change, but all functions are no-ops.

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  // Expo push tokens are not available on web — return null silently.
  return null;
};
