import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { PureVegBadge } from '../components/PureVegBadge';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { customerTheme } from '../theme';

export const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const orderCount = useAppSelector((state) => state.orders.orders.length);

  return (
    <Screen>
      <PureVegBadge />
      <SectionHeader title={user?.fullName ?? 'Customer'} subtitle={user?.email ?? user?.phone} />
      <View style={styles.card}>
        <Text style={styles.item}>Loyalty points: {user?.loyaltyPoints ?? 0}</Text>
        <Text style={styles.item}>Saved addresses: {user?.addresses.length ?? 0}</Text>
        <Text style={styles.item}>My orders: {orderCount}</Text>
      </View>
      <PrimaryButton label="View wishlist" variant="outline" onPress={() => navigation.navigate('Wishlist')} />
      <PrimaryButton label="Notifications" variant="outline" onPress={() => navigation.navigate('Notifications')} />
      <PrimaryButton label="Logout" onPress={() => dispatch(logout())} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.lg,
    gap: 10
  },
  item: {
    color: customerTheme.colors.text,
    fontWeight: '600'
  }
});
