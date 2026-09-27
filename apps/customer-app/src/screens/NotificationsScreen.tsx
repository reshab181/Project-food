import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchNotifications } from '../store/orderSlice';
import { customerTheme, type as t } from '../theme';

export const NotificationsScreen = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.orders.notifications);

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <Screen>
      <SectionHeader title="Notifications" subtitle="Order updates, offers, and kitchen alerts." />
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : null}
      {notifications.map((n) => (
        <View key={n._id ?? n.createdAt} style={styles.card}>
          <Text style={styles.title}>{n.title}</Text>
          <Text style={styles.message}>{n.message}</Text>
        </View>
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
  title: { ...t.label, color: customerTheme.colors.text },
  message: { ...t.body, color: customerTheme.colors.textMuted }
});
