// Dynamic Expo config for the admin app.
// API/socket URLs are read from environment variables at build time so the
// same codebase can target local dev and production without edits:
//   EXPO_PUBLIC_API_URL     e.g. https://bambam-backend.onrender.com/api/v1
//   EXPO_PUBLIC_SOCKET_URL  e.g. https://bambam-backend.onrender.com
// If unset, it falls back to localhost for local development.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:5000';

// Push notifications (Expo + Firebase/FCM).
//   EAS_PROJECT_ID              Expo project id (from `eas init` / Expo dashboard).
//   GOOGLE_SERVICES_JSON        Path to the Firebase google-services.json file.
// Both are required for REAL Android push to work. Without them the app still
// runs; it just won't obtain a push token.
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID ?? '79ef2881-306b-4d0f-a39a-2674817940a9';
const GOOGLE_SERVICES_JSON = process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';

module.exports = {
  expo: {
    name: 'Bam Bam Management',
    // Slug must match the Expo project tied to extra.eas.projectId (bbcs).
    slug: 'bbcs',
    scheme: 'bambamadmin',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    assetBundlePatterns: ['**/*'],
    plugins: ['expo-notifications'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.bambamcakeshop.admin'
    },
    android: {
      package: 'com.bambamcakeshop.admin',
      // Firebase config file for FCM. Only applied when the file exists.
      googleServicesFile: GOOGLE_SERVICES_JSON,
      useNextNotificationsApi: true,
      permissions: ['NOTIFICATIONS']
    },
    extra: {
      apiUrl: API_URL,
      socketUrl: SOCKET_URL,
      // Consumed by getExpoPushTokenAsync({ projectId }).
      pushProjectId: EAS_PROJECT_ID,
      ...(EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {})
    }
  }
};
