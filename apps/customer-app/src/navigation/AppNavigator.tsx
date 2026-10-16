import { brand } from '@bambam/shared';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthScreen } from '../screens/AuthScreen';
import { CartScreen } from '../screens/CartScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { OrderTrackingScreen } from '../screens/OrderTrackingScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { useAppSelector } from '../store';
import { customerTheme } from '../theme';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const TabLabel = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ color: focused ? customerTheme.colors.primary : customerTheme.colors.textMuted, fontWeight: '700' }}>
    {label}
  </Text>
);

// Emoji-based tab icons. We use emoji instead of an icon font so no extra
// native dependency (@expo/vector-icons / react-native-vector-icons) or font
// linking is required - they render reliably on every device.
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>{icon}</Text>
);

const MainTabs = () => {
  // Add the bottom safe-area inset to the tab bar so it sits above the phone's
  // gesture / navigation bar instead of being overlapped by it. On Android the
  // reported bottom inset is often 0 even when a gesture/nav bar is present, so
  // we guarantee a minimum bottom padding there.
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 12) : insets.bottom;
  const tabBarHeight = 58 + bottomInset;

  // Total number of items in the cart (sum of quantities) for the Cart tab badge.
  const cartCount = useAppSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: tabBarHeight, paddingBottom: bottomInset + 6, paddingTop: 6 }
      }}
    >
      <Tabs.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />, tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />, title: brand.appName }} />
      <Tabs.Screen name="CatalogTab" component={CatalogScreen} options={{ tabBarLabel: ({ focused }) => <TabLabel label="Menu" focused={focused} />, tabBarIcon: ({ focused }) => <TabIcon icon="🍰" focused={focused} /> }} />
      <Tabs.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Cart" focused={focused} />,
          tabBarIcon: ({ focused }) => <TabIcon icon="🛒" focused={focused} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: customerTheme.colors.primary, color: '#fff', fontWeight: '800' }
        }}
      />
      <Tabs.Screen name="OrdersTab" component={OrdersScreen} options={{ tabBarLabel: ({ focused }) => <TabLabel label="Orders" focused={focused} />, tabBarIcon: ({ focused }) => <TabIcon icon="📦" focused={focused} /> }} />
      <Tabs.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: ({ focused }) => <TabLabel label="Profile" focused={focused} />, tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} /> }} />
    </Tabs.Navigator>
  );
};

export const AppNavigator = () => {
  const auth = useAppSelector((state) => state.auth);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  const initialRoute = useMemo(() => {
    if (!onboardingSeen) return 'Onboarding';
    return auth.user ? 'Main' : 'Auth';
  }, [auth.user, onboardingSeen]);

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      {!onboardingSeen ? (
        <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
          {(props) => <OnboardingScreen {...props} onDone={() => setOnboardingSeen(true)} />}
        </Stack.Screen>
      ) : null}
      {!auth.user ? (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product details' }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
          <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Track order' }} />
          <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Wishlist' }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        </>
      )}
    </Stack.Navigator>
  );
};
