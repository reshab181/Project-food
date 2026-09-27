import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthScreen }           from '../screens/AuthScreen';
import { CartScreen }           from '../screens/CartScreen';
import { CatalogScreen }        from '../screens/CatalogScreen';
import { CheckoutScreen }       from '../screens/CheckoutScreen';
import { HomeScreen }           from '../screens/HomeScreen';
import { NotificationsScreen }  from '../screens/NotificationsScreen';
import { OnboardingScreen }     from '../screens/OnboardingScreen';
import { OrderTrackingScreen }  from '../screens/OrderTrackingScreen';
import { OrdersScreen }         from '../screens/OrdersScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ProfileScreen }        from '../screens/ProfileScreen';
import { WishlistScreen }       from '../screens/WishlistScreen';
import { useAppSelector }       from '../store';
import { palette, type as t }  from '../theme';

const ONBOARDING_KEY = 'bam_bam_onboarding_seen';
const Stack = createNativeStackNavigator();
const Tabs  = createBottomTabNavigator();

// Thin Unicode outline icons for each tab — no icon lib dependency.
const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home:    { active: '⌂',  inactive: '⌂'  },
  Menu:    { active: '▤',  inactive: '▤'  },
  Cart:    { active: '⊡',  inactive: '⊡'  },
  Orders:  { active: '◷',  inactive: '◷'  },
  Profile: { active: '◯',  inactive: '◯'  },
};

interface TabIconProps { label: string; focused: boolean }

const TabItem = ({ label, focused }: TabIconProps) => (
  <View style={tabStyles.item}>
    <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>
      {TAB_ICONS[label]?.[focused ? 'active' : 'inactive'] ?? '•'}
    </Text>
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
  </View>
);

const tabStyles = StyleSheet.create({
  item:        { alignItems: 'center', gap: 3, paddingTop: 8 },
  icon:        { fontSize: 18, lineHeight: 22, color: palette.textFaint },
  iconActive:  { color: palette.accent },
  label:       { ...t.caption, color: palette.textFaint, letterSpacing: 0.3 },
  labelActive: { color: palette.accent },
});

const MainTabs = () => (
  <Tabs.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        height: Platform.OS === 'ios' ? 82 : 66,
        backgroundColor: palette.surface,
        borderTopWidth: 1,
        borderTopColor: palette.hairline,
        // no shadow / elevation
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarShowLabel: false,
    }}
  >
    <Tabs.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{ tabBarIcon: ({ focused }) => <TabItem label="Home"    focused={focused} /> }}
    />
    <Tabs.Screen
      name="CatalogTab"
      component={CatalogScreen}
      options={{ tabBarIcon: ({ focused }) => <TabItem label="Menu"    focused={focused} /> }}
    />
    <Tabs.Screen
      name="CartTab"
      component={CartScreen}
      options={{ tabBarIcon: ({ focused }) => <TabItem label="Cart"    focused={focused} /> }}
    />
    <Tabs.Screen
      name="OrdersTab"
      component={OrdersScreen}
      options={{ tabBarIcon: ({ focused }) => <TabItem label="Orders"  focused={focused} /> }}
    />
    <Tabs.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{ tabBarIcon: ({ focused }) => <TabItem label="Profile" focused={focused} /> }}
    />
  </Tabs.Navigator>
);

export const AppNavigator = () => {
  const auth = useAppSelector((state) => state.auth);
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((v) => setOnboardingSeen(v === 'true'))
      .catch(() => setOnboardingSeen(false));
  }, []);

  if (onboardingSeen === null) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.bg },
        headerShadowVisible: false,
        headerTintColor: palette.text,
        headerTitleStyle: { ...t.label, color: palette.text },
      }}
    >
      {!onboardingSeen ? (
        <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
          {(props) => <OnboardingScreen {...props} onDone={() => {
            setOnboardingSeen(true);
            void AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
          }} />}
        </Stack.Screen>
      ) : null}
      {!auth.user ? (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main"          component={MainTabs}           options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product' }} />
          <Stack.Screen name="Checkout"       component={CheckoutScreen}       options={{ title: 'Checkout' }} />
          <Stack.Screen name="OrderTracking"  component={OrderTrackingScreen}  options={{ title: 'Your order' }} />
          <Stack.Screen name="Wishlist"       component={WishlistScreen}       options={{ title: 'Wishlist' }} />
          <Stack.Screen name="Notifications"  component={NotificationsScreen}  options={{ title: 'Notifications' }} />
        </>
      )}
    </Stack.Navigator>
  );
};
