import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppSelector } from '../store';
import { customerTheme, type as t } from '../theme';

export const OrderTrackingScreen = ({ route }: any) => {
  const orderId = route.params?.orderId;
  const order = useAppSelector(
    (state) => state.orders.orders.find((item) => item._id === orderId) ?? state.orders.orders[0]
  );

  if (!order) {
    return (
      <Screen>
        <Text style={styles.empty}>Order not found. It may still be loading.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionHeader
        title={order.orderNumber}
        subtitle={`Status: ${order.status.replaceAll('_', ' ')}`}
      />
      {order.timeline.map((event) => (
        <View key={`${event.status}-${event.createdAt}`} style={styles.card}>
          <View style={styles.dot} />
          <View style={styles.copy}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDesc}>{event.description}</Text>
            <Text style={styles.eventDate}>{new Date(event.createdAt).toLocaleString()}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  empty: { ...t.body, color: customerTheme.colors.textMuted, textAlign: 'center', paddingVertical: 40 },
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.md
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5,
    backgroundColor: customerTheme.colors.primary,
    flexShrink: 0
  },
  copy: { flex: 1, gap: 4 },
  eventTitle: { ...t.label, color: customerTheme.colors.text },
  eventDesc: { ...t.body, color: customerTheme.colors.textMuted },
  eventDate: { ...t.caption, color: customerTheme.colors.textMuted }
});
