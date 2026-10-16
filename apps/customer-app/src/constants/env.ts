import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const customerEnv = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? 'http://localhost:5000/api/v1',
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? extra.socketUrl ?? 'http://localhost:5000'
};
