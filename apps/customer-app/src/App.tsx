import { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store, useAppDispatch, useAppSelector } from './store';
import { bootstrapAuth } from './store/authSlice';
import { fetchNotifications, fetchOrders } from './store/orderSlice';
import { fetchProducts } from './store/catalogSlice';
import { AppNavigator } from './navigation/AppNavigator';
import { customerSocket } from './api/socket';
import { authApi } from './api/services';
import { customerTheme } from './theme';
import { registerForPushNotificationsAsync } from './utils/pushNotifications';

const InnerApp = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    void dispatch(bootstrapAuth());
    void dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (!auth.user) {
      return;
    }

    void registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          console.log('[push] registering customer token with backend');
          return authApi.registerPushToken(token);
        }
        console.warn('[push] no customer token to register (see earlier logs)');
      })
      .catch((error) => console.warn('[push] customer token registration failed:', error));

    customerSocket.connect();
    customerSocket.emit('join:user', auth.user._id);
    customerSocket.on('orders.updated', () => {
      void dispatch(fetchOrders());
      void dispatch(fetchNotifications());
    });
    customerSocket.on('products.updated', () => {
      void dispatch(fetchProducts());
    });

    return () => {
      customerSocket.removeAllListeners();
      customerSocket.disconnect();
    };
  }, [auth.user, dispatch]);

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
    <SafeAreaProvider>
      <Provider store={store}>
        <InnerApp />
      </Provider>
    </SafeAreaProvider>
  );
}
