import { brand } from '@bambam/shared';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppSelector } from '../store';
import { customerTheme } from '../theme';

const categories = ['all', 'cakes', 'pizza', 'burger'] as const;

export const CatalogScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('all');
  const products = useAppSelector((state) => state.catalog.products);

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = category === 'all' || product.category === category;
        const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [category, products, query]
  );

  return (
    <Screen>
      <SectionHeader title="Pure Veg Menu" subtitle="All items are crafted in a 100% vegetarian kitchen." />
      <TextInput value={query} onChangeText={setQuery} placeholder="Search by item name" style={styles.search} />
      <View style={styles.filterRow}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}>
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>
              {item === 'all' ? 'All' : brand.categoryLabels[item]}
            </Text>
          </Pressable>
        ))}
      </View>
      {filtered.map((product) => (
        <ProductCard key={product._id} product={product} onPress={() => navigation.navigate('ProductDetails', { productId: product._id })} />
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  search: {
    borderRadius: customerTheme.radius.md,
    backgroundColor: customerTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: customerTheme.radius.pill,
    backgroundColor: customerTheme.colors.mutedSurface
  },
  chipActive: {
    backgroundColor: '#E9F7EE'
  },
  chipText: {
    color: customerTheme.colors.textMuted,
    fontWeight: '700'
  },
  chipTextActive: {
    color: customerTheme.colors.primary
  }
});
