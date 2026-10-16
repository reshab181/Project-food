import { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store, useAppDispatch, useAppSelector } from './store';
import { AppNavigator } from './navigation/AppNavigator';
import { adminTheme } from './theme';
import { adminSocket } from './api/socket';
import { adminAuthApi } from './api/services';
import { fetchAdminOrders, fetchAdminProducts, fetchInventory } from './store/opsSlice';
import { registerForPushNotificationsAsync } from './utils/pushNotifications';

const InnerApp = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.adminAuth.user);

  useEffect(() => {
    if (!user) {
      return;
    }

    void registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          console.log('[push] registering token with backend');
          return adminAuthApi.registerPushToken(token);
        }
        console.warn('[push] no token to register (see earlier logs for why)');
      })
      .catch((error) => console.warn('[push] token registration failed:', error));

    void dispatch(fetchAdminOrders());
    void dispatch(fetchAdminProducts());
    void dispatch(fetchInventory());

    adminSocket.connect();
    adminSocket.emit('join:role', user.role);
    adminSocket.on('orders.created', () => {
      void dispatch(fetchAdminOrders());
    });
    adminSocket.on('orders.updated', () => {
      void dispatch(fetchAdminOrders());
    });
    adminSocket.on('products.updated', () => {
      void dispatch(fetchAdminProducts());
    });

    return () => {
      adminSocket.removeAllListeners();
      adminSocket.disconnect();
    };
  }, [dispatch, user]);

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: adminTheme.colors.background,
          card: '#fff',
          primary: adminTheme.colors.primary,
          text: adminTheme.colors.ink,
          border: adminTheme.colors.border
        }
      }}
    >
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <InnerApp />
      </Provider>
    </SafeAreaProvider>
  );
}
