import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOrders } from '../store/orderSlice';
import { customerTheme, type as t } from '../theme';
import { formatPrice } from '../utils/format';

export const OrdersScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.orders.orders);

  useEffect(() => {
    void dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <Screen>
      <SectionHeader title="My orders" subtitle="Track every celebration and snack in real time." />
      {orders.length === 0 ? (
        <Text style={styles.empty}>No orders yet — go place your first one!</Text>
      ) : null}
      {orders.map((order) => (
        <Pressable
          key={order._id}
          onPress={() => navigation.navigate('OrderTracking', { orderId: order._id })}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.orderNo}>{order.orderNumber}</Text>
          <Text style={styles.status}>{order.status.replaceAll('_', ' ')}</Text>
          <Text style={styles.meta}>{order.items.length} items · {formatPrice(order.pricing.grandTotal)}</Text>
        </Pressable>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  empty: { ...t.body, color: customerTheme.colors.textMuted, textAlign: 'center', paddingVertical: 32 },
  card: {
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.md,
    gap: 6
  },
  orderNo: { ...t.label, color: customerTheme.colors.text },
  status: { ...t.body, color: customerTheme.colors.primary, textTransform: 'capitalize' },
  meta: { ...t.caption, color: customerTheme.colors.textMuted }
});
