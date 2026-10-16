import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MetricTile } from '../components/MetricTile';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAdminDashboard } from '../store/opsSlice';
import { adminTheme } from '../theme';

export const DashboardScreen = () => {
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector((state) => state.ops.dashboard);
  const user = useAppSelector((state) => state.adminAuth.user);

  useEffect(() => {
    void dispatch(fetchAdminDashboard());
  }, [dispatch]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Operations dashboard</Text>
        <Text style={styles.subtitle}>{user?.role === 'super_admin' ? 'Super admin control center' : 'Staff visibility panel'}</Text>
      </View>
      <View style={styles.grid}>
        <MetricTile label="Today orders" value={dashboard.todayOrders} />
        <MetricTile label="Revenue" value={`Rs. ${dashboard.todayRevenue}`} />
      </View>
      <View style={styles.grid}>
        <MetricTile label="Pending" value={dashboard.pendingOrders} />
        <MetricTile label="Low stock" value={dashboard.lowStockItems} />
      </View>
      <SectionCard title="Top products" subtitle="Best performers for the current period">
        {dashboard.topProducts.map((product) => (
          <Text key={product.productId} style={styles.listItem}>{product.name} • {product.unitsSold} sold</Text>
        ))}
      </SectionCard>
      <SectionCard title="Pure Veg assurance" subtitle="Customer-facing trust points reflected across both apps">
        <Text style={styles.listItem}>Every product is auto-tagged as 100% Pure Veg.</Text>
        <Text style={styles.listItem}>Ingredient visibility is enabled for cakes, pizza, and burgers.</Text>
        <Text style={styles.listItem}>Real-time order events notify the customer app instantly.</Text>
      </SectionCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: 6
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: adminTheme.colors.ink
  },
  subtitle: {
    color: adminTheme.colors.textMuted
  },
  grid: {
    flexDirection: 'row',
    gap: 12
  },
  listItem: {
    color: adminTheme.colors.ink
  }
});
