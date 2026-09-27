import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  BricolageGrotesque_300Light,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold
} from '@expo-google-fonts/bricolage-grotesque';
import { store, useAppDispatch, useAppSelector } from './store';
import { bootstrapAuth, setPushToken } from './store/authSlice';
import { fetchNotifications, fetchOrders } from './store/orderSlice';
import { fetchProducts } from './store/catalogSlice';
import { AppNavigator } from './navigation/AppNavigator';
import { customerSocket } from './api/socket';
import { authApi } from './api/services';
import { customerTheme } from './theme';
import { registerForPushNotificationsAsync } from './utils/pushNotifications';
import { ToastProvider } from './components/Toast';

const InnerApp = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const [fontsLoaded] = useFonts({
    BricolageGrotesque_300Light,
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold
  });

  // ── Step 1: bootstrap auth first, then load public catalogue ──────────────
  useEffect(() => {
    void dispatch(bootstrapAuth()).then(() => {
      void dispatch(fetchProducts());
    });
  }, [dispatch]);

  // ── Step 2: once authenticated, connect socket, register push token ────────
  useEffect(() => {
    if (!auth.user) return;

    void dispatch(fetchOrders());
    void dispatch(fetchNotifications());

    void registerForPushNotificationsAsync().then((token) => {
      if (token) {
        dispatch(setPushToken(token));
        void authApi.registerPushToken(token).catch(() => {});
      }
    });

    const handleOrdersUpdated = () => {
      void dispatch(fetchOrders());
      void dispatch(fetchNotifications());
    };
    const handleProductsUpdated = () => { void dispatch(fetchProducts()); };
    const handleReconnect = () => { customerSocket.emit('join:user', auth.user!._id); };

    customerSocket.connect();
    customerSocket.emit('join:user', auth.user._id);
    customerSocket.on('orders.updated', handleOrdersUpdated);
    customerSocket.on('products.updated', handleProductsUpdated);
    customerSocket.io.on('reconnect', handleReconnect);

    let notificationSub: { remove: () => void } | null = null;
    if (Platform.OS !== 'web') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Notifications = require('expo-notifications') as typeof import('expo-notifications');
      notificationSub = Notifications.addNotificationResponseReceivedListener(() => {
        void dispatch(fetchOrders());
        void dispatch(fetchNotifications());
      });
    }

    return () => {
      customerSocket.off('orders.updated', handleOrdersUpdated);
      customerSocket.off('products.updated', handleProductsUpdated);
      customerSocket.io.off('reconnect', handleReconnect);
      customerSocket.disconnect();
      notificationSub?.remove();
    };
  }, [auth.user, dispatch]);

  // Show spinner until both fonts and bootstrap are ready
  if (!fontsLoaded || auth.status === 'bootstrapping') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: customerTheme.colors.background }}>
        <ActivityIndicator size="large" color={customerTheme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: customerTheme.colors.background,
          card: customerTheme.colors.surface,
          primary: customerTheme.colors.primary,
          text: customerTheme.colors.text,
          border: customerTheme.colors.border
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
      <ToastProvider>
        <InnerApp />
      </ToastProvider>
    </Provider>
  );
}
