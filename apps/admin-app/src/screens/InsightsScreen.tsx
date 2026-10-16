import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useAppDispatch, useAppSelector } from '../store';
import { createCouponOffer, fetchCoupons, fetchReports } from '../store/opsSlice';
import { adminTheme } from '../theme';

export const InsightsScreen = () => {
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.adminAuth.user?.role);
  const coupons = useAppSelector((state) => state.ops.coupons);
  const reports = useAppSelector((state) => state.ops.reports);
  const [couponForm, setCouponForm] = useState({
    code: 'FESTIVE20',
    title: 'Festive Pure Veg Offer',
    description: '20% off on celebration cakes',
    discountValue: '20'
  });

  useEffect(() => {
    void dispatch(fetchCoupons());
    void dispatch(fetchReports());
  }, [dispatch]);

  const handleCreateCoupon = async () => {
    if (role !== 'super_admin') {
      Alert.alert('Restricted', 'Only the super admin can create offers.');
      return;
    }

    try {
      await dispatch(
        createCouponOffer({
          code: couponForm.code,
          title: couponForm.title,
          description: couponForm.description,
          discountType: 'percentage',
          discountValue: Number(couponForm.discountValue),
          minimumOrderValue: 499,
          maxDiscountValue: 250,
          isActive: true
        })
      ).unwrap();
      Alert.alert('Offer created', 'Customers will see the offer once the customer app refreshes.');
    } catch (error) {
      Alert.alert('Create failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <Screen>
      <SectionCard title="Offers and coupons" subtitle="Festival discounts and campaign control.">
        <TextInput value={couponForm.code} onChangeText={(code) => setCouponForm((prev) => ({ ...prev, code }))} style={styles.input} placeholder="Coupon code" />
        <TextInput value={couponForm.title} onChangeText={(title) => setCouponForm((prev) => ({ ...prev, title }))} style={styles.input} placeholder="Title" />
        <TextInput value={couponForm.description} onChangeText={(description) => setCouponForm((prev) => ({ ...prev, description }))} style={styles.input} placeholder="Description" />
        <TextInput value={couponForm.discountValue} onChangeText={(discountValue) => setCouponForm((prev) => ({ ...prev, discountValue }))} style={styles.input} placeholder="Discount %" keyboardType="numeric" />
        <PrimaryButton label={role === 'super_admin' ? 'Create coupon' : 'Super admin only'} onPress={handleCreateCoupon} />
        {coupons.map((coupon) => (
          <View key={coupon._id ?? coupon.code} style={styles.rowCard}>
            <Text style={styles.bold}>{coupon.code}</Text>
            <Text style={styles.meta}>{coupon.title}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Reports" subtitle="Daily, weekly, and monthly performance snapshots.">
        <Text style={styles.meta}>Daily buckets: {Object.keys((reports as any).daily ?? {}).length}</Text>
        <Text style={styles.meta}>Weekly buckets: {Object.keys((reports as any).weekly ?? {}).length}</Text>
        <Text style={styles.meta}>Monthly buckets: {Object.keys((reports as any).monthly ?? {}).length}</Text>
      </SectionCard>

      <SectionCard title="Notifications panel" subtitle="New orders and product syncs are pushed in real time through Socket.IO and Expo notifications.">
        <Text style={styles.meta}>Customer status updates are emitted when order state changes.</Text>
        <Text style={styles.meta}>Staff devices receive visibility for new incoming orders immediately.</Text>
      </SectionCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: adminTheme.colors.border,
    borderRadius: adminTheme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff'
  },
  rowCard: {
    backgroundColor: adminTheme.colors.adminSurface,
    borderRadius: adminTheme.radius.md,
    padding: adminTheme.spacing.md,
    gap: 4
  },
  bold: {
    fontWeight: '900',
    color: adminTheme.colors.ink
  },
  meta: {
    color: adminTheme.colors.textMuted
  }
});
