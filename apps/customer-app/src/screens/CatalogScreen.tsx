import { brand } from '@bambam/shared';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppSelector } from '../store';
import { customerTheme, palette, type as t } from '../theme';

const CATEGORIES = ['all', 'cakes', 'pizza', 'burger'] as const;
type Cat = (typeof CATEGORIES)[number];

export const CatalogScreen = ({ navigation }: any) => {
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState<Cat>('all');
  const products = useAppSelector((s) => s.catalog.products);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchCat    = category === 'all' || p.category === category;
        const matchSearch = p.name.toLowerCase().includes(query.toLowerCase());
        return matchCat && matchSearch;
      }),
    [category, products, query]
  );

  return (
    <Screen>
      <SectionHeader title="Menu" subtitle="100% vegetarian kitchen" />

      {/* Borderless search */}
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search…"
          placeholderTextColor={palette.textFaint}
          style={styles.searchInput}
        />
        <View style={styles.searchLine} />
      </View>

      {/* Category filter — plain text chips */}
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <Pressable key={c} onPress={() => setCategory(c)} style={styles.chip}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {c === 'all' ? 'All' : brand.categoryLabels[c]}
              </Text>
              {active ? <View style={styles.chipBar} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.divider} />

      {filtered.length === 0 ? (
        <Text style={styles.empty}>Nothing matches your search.</Text>
      ) : (
        <View style={styles.list}>
          {filtered.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onPress={() => navigation.navigate('ProductDetails', { productId: p._id })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  searchWrap: { gap: 0 },
  searchInput: {
    ...t.input,
    color: palette.text,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  searchLine: { height: 1, backgroundColor: palette.border },
  chipRow: { flexDirection: 'row', gap: 24 },
  chip: { alignItems: 'center', gap: 4, paddingBottom: 2 },
  chipText: {
    ...t.caption,
    color: palette.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipTextActive: { color: palette.text },
  chipBar: { height: 1, width: '100%', backgroundColor: palette.text },
  divider: { height: 1, backgroundColor: palette.hairline },
  list: { gap: customerTheme.spacing.lg },
  empty: {
    ...t.body,
    color: palette.textFaint,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
