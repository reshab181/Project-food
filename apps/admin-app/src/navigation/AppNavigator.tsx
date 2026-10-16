import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../store';
import { DashboardScreen } from '../screens/DashboardScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { PeopleScreen } from '../screens/PeopleScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { adminTheme } from '../theme';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const TabLabel = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ color: focused ? adminTheme.colors.primary : adminTheme.colors.textMuted, fontWeight: '700' }}>{label}</Text>
);

// Emoji-based tab icons so no extra icon-font dependency / font linking is
// required - they render reliably on every device.
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 20 : 18, opacity: focused ? 1 : 0.6 }}>{icon}</Text>
);

const MainTabs = () => {
  // Add the bottom safe-area inset to the tab bar so it sits above the phone's
  // gesture / navigation bar instead of being overlapped by it. On Android the
  // reported bottom inset is often 0 even when a gesture/nav bar is present, so
  // we guarantee a minimum bottom padding there.
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 12) : insets.bottom;
  const tabBarHeight = 60 + bottomInset;

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: tabBarHeight, paddingBottom: bottomInset + 6, paddingTop: 6 }
      }}
    >
      <Tabs.Screen name="DashboardTab" component={DashboardScreen} options={{ tabBarLabel: ({ focused }) => <TabLabel label="Dashboard" focused={focused} />, tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} /> }} />
      <Tabs.Screen name="OrdersTab" component={OrdersScreen} options={{ tabBarLabel: ({ focused }) => <TabLabel label="Orders" focused={focused} />, tabBarIcon: ({ focused }) => <TabIcon icon="📦" focused={focused} /> }} />
      <Tabs.Screen name="ProductsTab" component={ProductsScreen} options={{ tabBarLabel: ({ focused }) => <TabLabel label="Products" focused={focused} />, tabBarIcon: ({ focused }) => <TabIcon icon="🍰" focused={focused} /> }} />
      <Tabs.Screen name="InventoryTab" component={InventoryScreen} options={{ tabBarLabel: ({ focused }) => <TabLabel label="Stock" focused={focused} />, tabBarIcon: ({ focused }) => <TabIcon icon="📥" focused={focused} /> }} />
      <Tabs.Screen name="PeopleTab" component={PeopleScreen} options={{ tabBarLabel: ({ focused }) => <TabLabel label="People" focused={focused} />, tabBarIcon: ({ focused }) => <TabIcon icon="👥" focused={focused} /> }} />
      <Tabs.Screen name="InsightsTab" component={InsightsScreen} options={{ tabBarLabel: ({ focused }) => <TabLabel label="Insights" focused={focused} />, tabBarIcon: ({ focused }) => <TabIcon icon="📈" focused={focused} /> }} />
    </Tabs.Navigator>
  );
};

export const AppNavigator = () => {
  const user = useAppSelector((state) => state.adminAuth.user);

  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};
