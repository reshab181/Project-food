import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchInventory } from '../store/opsSlice';
import { adminTheme } from '../theme';

export const InventoryScreen = () => {
  const dispatch = useAppDispatch();
  const inventory = useAppSelector((state) => state.ops.inventory);

  useEffect(() => {
    void dispatch(fetchInventory());
  }, [dispatch]);

  return (
    <Screen>
      <SectionCard title="Inventory management" subtitle="Raw materials, finished stock, and low-level visibility.">
        {inventory.map((item) => (
          <View key={item._id} style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.currentStock} {item.unit} available • Reorder at {item.reorderLevel}
            </Text>
            <Text style={[styles.meta, item.currentStock <= item.reorderLevel && styles.alert]}>
              {item.currentStock <= item.reorderLevel ? 'Low stock alert' : 'Stock healthy'}
            </Text>
          </View>
        ))}
      </SectionCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: adminTheme.colors.adminSurface,
    borderRadius: adminTheme.radius.md,
    padding: adminTheme.spacing.md,
    gap: 6
  },
  name: {
    fontWeight: '900',
    color: adminTheme.colors.ink
  },
  meta: {
    color: adminTheme.colors.textMuted
  },
  alert: {
    color: adminTheme.colors.error,
    fontWeight: '800'
  }
});
