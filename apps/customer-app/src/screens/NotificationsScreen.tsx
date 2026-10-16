import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchNotifications } from '../store/orderSlice';
import { customerTheme } from '../theme';

export const NotificationsScreen = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.orders.notifications);

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <Screen>
      <SectionHeader title="Notifications" subtitle="Order updates, offers, and kitchen alerts." />
      {notifications.map((notification) => (
        <View key={notification._id ?? notification.createdAt} style={styles.card}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message}>{notification.message}</Text>
        </View>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.md,
    gap: 6
  },
  title: {
    fontWeight: '800',
    color: customerTheme.colors.text
  },
  message: {
    color: customerTheme.colors.textMuted
  }
});
