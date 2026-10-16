import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppSelector } from '../store';
import { customerTheme } from '../theme';

export const OrderTrackingScreen = ({ route }: any) => {
  const orderId = route.params?.orderId;
  const order = useAppSelector((state) => state.orders.orders.find((item) => item._id === orderId) ?? state.orders.orders[0]);

  if (!order) {
    return (
      <Screen>
        <Text>No order found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionHeader title={order.orderNumber} subtitle={`Current status: ${order.status.replaceAll('_', ' ')}`} />
      {order.timeline.map((event) => (
        <View key={`${event.status}-${event.createdAt}`} style={styles.timelineCard}>
          <View style={styles.dot} />
          <View style={styles.copy}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.description}>{event.description}</Text>
            <Text style={styles.date}>{new Date(event.createdAt).toLocaleString()}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  timelineCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.md
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 6,
    backgroundColor: customerTheme.colors.primary
  },
  copy: {
    flex: 1,
    gap: 4
  },
  title: {
    fontWeight: '800',
    color: customerTheme.colors.text
  },
  description: {
    color: customerTheme.colors.textMuted
  },
  date: {
    color: customerTheme.colors.textMuted,
    fontSize: 12
  }
});
