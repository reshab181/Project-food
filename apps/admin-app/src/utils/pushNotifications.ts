import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// How notifications behave while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

// Resolve the Expo projectId from app config (set via EAS_PROJECT_ID at build).
const getProjectId = () =>
  (Constants.expoConfig?.extra as any)?.pushProjectId ??
  (Constants.expoConfig?.extra as any)?.eas?.projectId ??
  (Constants as any)?.easConfig?.projectId;

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  // Android requires a notification channel for heads-up notifications.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Orders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1C7C45'
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.warn('[push] notification permission not granted');
    return null;
  }

  const projectId = getProjectId();
  if (!projectId) {
    // Without a projectId Expo cannot mint a push token. This is expected
    // until EAS_PROJECT_ID + Firebase are configured.
    console.warn('[push] no Expo projectId configured (EAS_PROJECT_ID). Push token not available yet.');
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[push] expo push token:', token.data);
    return token.data;
  } catch (error) {
    console.warn('[push] failed to get push token:', error);
    return null;
  }
};
