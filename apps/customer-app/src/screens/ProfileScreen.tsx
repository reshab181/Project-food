import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { PureVegBadge } from '../components/PureVegBadge';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { addCustomerAddress, logoutCustomer } from '../store/authSlice';
import { customerTheme, type as t } from '../theme';

export const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { info } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const pushToken = useAppSelector((state) => state.auth.pushToken);
  const orderCount = useAppSelector((state) => state.orders.orders.length);
  const [address, setAddress] = useState({ label: 'Home', line1: '', city: '', state: '', postalCode: '' });

  const handleLogout = () => {
    info('Signing you out…');
    void dispatch(logoutCustomer(pushToken));
  };

  const saveAddress = async () => {
    if (!address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.postalCode.trim()) {
      info('Complete your street, city, state, and postal code.');
      return;
    }
    try {
      await dispatch(addCustomerAddress(address)).unwrap();
      setAddress({ label: 'Home', line1: '', city: '', state: '', postalCode: '' });
      info('Delivery address saved. It is now your checkout default.');
    } catch (err) {
      info(err instanceof Error ? err.message : 'Could not save your address.');
    }
  };

  return (
    <Screen>
      <PureVegBadge />
      <SectionHeader title={user?.fullName ?? 'Customer'} subtitle={user?.email ?? user?.phone} />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.key}>Loyalty points</Text>
          <Text style={styles.val}>{user?.loyaltyPoints ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Saved addresses</Text>
          <Text style={styles.val}>{user?.addresses.length ?? 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Total orders</Text>
          <Text style={styles.val}>{orderCount}</Text>
        </View>
      </View>
      <View style={styles.addressCard}>
        <Text style={styles.addressTitle}>Delivery addresses</Text>
        {user?.addresses.map((savedAddress) => (
          <View key={savedAddress._id ?? `${savedAddress.label}-${savedAddress.line1}`} style={styles.savedAddress}>
            <Text style={styles.savedLabel}>{savedAddress.label}</Text>
            <Text style={styles.savedText}>{savedAddress.line1}, {savedAddress.city}, {savedAddress.state} {savedAddress.postalCode}</Text>
          </View>
        ))}
        <Text style={styles.addressHint}>Save a new address to make it your default at checkout.</Text>
        <TextInput value={address.label} onChangeText={(label) => setAddress((current) => ({ ...current, label }))} style={styles.input} placeholder="Label (Home, Work)" />
        <TextInput value={address.line1} onChangeText={(line1) => setAddress((current) => ({ ...current, line1 }))} style={styles.input} placeholder="House / street address" />
        <TextInput value={address.city} onChangeText={(city) => setAddress((current) => ({ ...current, city }))} style={styles.input} placeholder="City" />
        <TextInput value={address.state} onChangeText={(state) => setAddress((current) => ({ ...current, state }))} style={styles.input} placeholder="State" />
        <TextInput value={address.postalCode} onChangeText={(postalCode) => setAddress((current) => ({ ...current, postalCode }))} style={styles.input} placeholder="Postal code" keyboardType="number-pad" />
        <PrimaryButton label="Save delivery address" onPress={saveAddress} />
      </View>
      <PrimaryButton label="View wishlist" variant="outline" onPress={() => navigation.navigate('Wishlist')} />
      <PrimaryButton label="Notifications" variant="outline" onPress={() => navigation.navigate('Notifications')} />
      <PrimaryButton label="Sign out" onPress={handleLogout} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.lg,
    gap: 14
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  key: { ...t.body, color: customerTheme.colors.textMuted },
  val: { ...t.label, color: customerTheme.colors.text },
  addressCard: { backgroundColor: customerTheme.colors.surface, borderRadius: customerTheme.radius.lg, padding: customerTheme.spacing.md, gap: 10 },
  addressTitle: { ...t.label, color: customerTheme.colors.text },
  addressHint: { ...t.caption, color: customerTheme.colors.textMuted },
  savedAddress: { paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: customerTheme.colors.border, gap: 2 },
  savedLabel: { ...t.label, color: customerTheme.colors.primary },
  savedText: { ...t.body, color: customerTheme.colors.textMuted },
  input: { ...t.input, borderWidth: 1, borderColor: customerTheme.colors.border, borderRadius: customerTheme.radius.md, paddingHorizontal: 14, paddingVertical: 12, color: customerTheme.colors.text, backgroundColor: customerTheme.colors.background }
});
