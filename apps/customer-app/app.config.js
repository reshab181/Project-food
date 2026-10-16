// Dynamic Expo config for the customer app.
// API/socket URLs are read from environment variables at build time so the
// same codebase can target local dev and production without edits:
//   EXPO_PUBLIC_API_URL     e.g. https://bambam-backend.onrender.com/api/v1
//   EXPO_PUBLIC_SOCKET_URL  e.g. https://bambam-backend.onrender.com
// If unset, it falls back to localhost for local development.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:5000';

// Push notifications (Expo + Firebase/FCM). Shares the same Expo project as the
// admin app. Firebase needs a SEPARATE Android app registered for this package
// (com.bambamcakeshop.customer) -> its own google-services.json.
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID ?? '79ef2881-306b-4d0f-a39a-2674817940a9';
const GOOGLE_SERVICES_JSON = process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';

module.exports = {
  expo: {
    name: 'Bam Bam Cake Shop',
    slug: 'bbcs',
    scheme: 'bambamcustomer',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    assetBundlePatterns: ['**/*'],
    plugins: ['expo-notifications'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.bambamcakeshop.customer'
    },
    android: {
      package: 'com.bambamcakeshop.customer',
      googleServicesFile: GOOGLE_SERVICES_JSON,
      useNextNotificationsApi: true,
      permissions: ['NOTIFICATIONS']
    },
    extra: {
      apiUrl: API_URL,
      socketUrl: SOCKET_URL,
      pushProjectId: EAS_PROJECT_ID,
      ...(EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {})
    }
  }
};
