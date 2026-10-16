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

// Hard fallback so the token can always be minted even if the dynamic config
// value doesn't resolve at runtime in the dev client.
const FALLBACK_PROJECT_ID = '79ef2881-306b-4d0f-a39a-2674817940a9';

const getProjectId = () =>
  (Constants.expoConfig?.extra as any)?.pushProjectId ??
  (Constants.expoConfig?.extra as any)?.eas?.projectId ??
  (Constants as any)?.easConfig?.projectId ??
  (Constants as any)?.manifest2?.extra?.eas?.projectId ??
  FALLBACK_PROJECT_ID;

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order updates',
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
