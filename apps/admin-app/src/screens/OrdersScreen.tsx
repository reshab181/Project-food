import { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useAppDispatch, useAppSelector } from '../store';
import { adminUpdateOrderStatus, fetchAdminOrders } from '../store/opsSlice';
import { adminTheme } from '../theme';

export const OrdersScreen = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.ops.orders);
  const role = useAppSelector((state) => state.adminAuth.user?.role);
  const canManage = role === 'super_admin';

  useEffect(() => {
    void dispatch(fetchAdminOrders());
  }, [dispatch]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await dispatch(adminUpdateOrderStatus({ orderId, status })).unwrap();
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <Screen>
      <SectionCard title="Incoming orders" subtitle={canManage ? 'Accept, reject, and update in real time.' : 'Staff can monitor incoming orders.'}>
        {orders.map((order) => (
          <View key={order._id} style={styles.orderCard}>
            <Text style={styles.orderNo}>{order.orderNumber}</Text>
            <Text style={styles.meta}>{order.customer.fullName} • {order.items.length} items • Rs. {order.pricing.grandTotal}</Text>
            <Text style={styles.status}>Status: {order.status.replaceAll('_', ' ')}</Text>
            {canManage ? (
              <View style={styles.actions}>
                <PrimaryButton label="Accept" onPress={() => updateStatus(order._id, 'confirmed')} />
                <PrimaryButton label="Preparing" variant="outline" onPress={() => updateStatus(order._id, 'preparing')} />
                <PrimaryButton label="Dispatch" variant="outline" onPress={() => updateStatus(order._id, 'out_for_delivery')} />
              </View>
            ) : (
              <Text style={styles.helper}>Only the super admin can manage this order.</Text>
            )}
          </View>
        ))}
      </SectionCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: adminTheme.colors.adminSurface,
    borderRadius: adminTheme.radius.md,
    padding: adminTheme.spacing.md,
    gap: 8
  },
  orderNo: {
    fontWeight: '900',
    color: adminTheme.colors.ink
  },
  meta: {
    color: adminTheme.colors.textMuted
  },
  status: {
    fontWeight: '800',
    color: adminTheme.colors.primary
  },
  actions: {
    gap: 10
  },
  helper: {
    color: adminTheme.colors.textMuted
  }
});
