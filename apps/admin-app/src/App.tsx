import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { store, useAppDispatch, useAppSelector } from './store';
import { bootstrapAdminAuth } from './store/authSlice';
import { AppNavigator } from './navigation/AppNavigator';
import { adminTheme } from './theme';
import { adminSocket } from './api/socket';
import { adminAuthApi } from './api/services';
import { fetchAdminOrders, fetchAdminProducts, fetchInventory } from './store/opsSlice';
import { registerForPushNotificationsAsync } from './utils/pushNotifications';

const InnerApp = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.adminAuth);

  // ── Bootstrap: restore session from SecureStore on cold start ─────────────
  useEffect(() => {
    void dispatch(bootstrapAdminAuth());
  }, [dispatch]);

  // ── Once authenticated: load data, socket, push token ─────────────────────
  useEffect(() => {
    if (!auth.user) {
      return;
    }

    void dispatch(fetchAdminOrders());
    void dispatch(fetchAdminProducts());
    void dispatch(fetchInventory());

    // Push token registration
    void registerForPushNotificationsAsync().then((token) => {
      if (token) {
        void adminAuthApi.registerPushToken(token).catch(() => {
          // best-effort
        });
      }
    });

    // ── Socket connection ────────────────────────────────────────────────────
    const handleOrdersCreated = () => { void dispatch(fetchAdminOrders()); };
    const handleOrdersUpdated = () => { void dispatch(fetchAdminOrders()); };
    const handleProductsUpdated = () => { void dispatch(fetchAdminProducts()); };
    // Re-join the role room after reconnect so server-side targeting still works
    const handleReconnect = () => {
      adminSocket.emit('join:role', auth.user!.role);
    };

    adminSocket.connect();
    adminSocket.emit('join:role', auth.user.role);
    adminSocket.on('orders.created', handleOrdersCreated);
    adminSocket.on('orders.updated', handleOrdersUpdated);
    adminSocket.on('products.updated', handleProductsUpdated);
    adminSocket.io.on('reconnect', handleReconnect);

    // ── Foreground notification tap handler ───────────────────────────────────
    const notificationResponseSub = Notifications.addNotificationResponseReceivedListener(() => {
      void dispatch(fetchAdminOrders());
    });

    return () => {
      adminSocket.off('orders.created', handleOrdersCreated);
      adminSocket.off('orders.updated', handleOrdersUpdated);
      adminSocket.off('products.updated', handleProductsUpdated);
      adminSocket.io.off('reconnect', handleReconnect);
      adminSocket.disconnect();
      notificationResponseSub.remove();
    };
  }, [auth.user, dispatch]);

  // ── Splash guard while bootstrap is in progress ───────────────────────────
  if (auth.status === 'bootstrapping') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: adminTheme.colors.background }}>
        <ActivityIndicator size="large" color={adminTheme.colors.primary} />
      </View>
    );
  }

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
    <Provider store={store}>
      <InnerApp />
    </Provider>
  );
}
