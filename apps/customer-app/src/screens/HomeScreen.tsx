import { brand } from '@bambam/shared';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { CategoryCard } from '../components/CategoryCard';
import { InfoBanner } from '../components/InfoBanner';
import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppSelector } from '../store';
import { customerTheme, palette, type as t } from '../theme';

export const HomeScreen = ({ navigation }: any) => {
  const products    = useAppSelector((s) => s.catalog.products);
  const trending    = products.filter((p) => p.isTrending);
  const recommended = products.filter((p) => p.isRecommended);

  return (
    <Screen>
      {/* ── Wordmark ── */}
      <View style={styles.hero}>
        <View style={styles.heroRule} />
        <View style={styles.wordmarkRow}>
          <Text style={styles.kicker}>PURE VEGETARIAN KITCHEN</Text>
          <Text style={styles.wordmark}>{brand.appName}</Text>
          <Text style={styles.tagline}>{brand.tagline}</Text>
        </View>
      </View>

      {/* ── Search — hairline underline only ── */}
      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Search…"
          placeholderTextColor={palette.textFaint}
          style={styles.searchInput}
        />
        <View style={styles.searchLine} />
      </View>

      {/* ── Category row — icon + label, no fills ── */}
      <View style={styles.catRow}>
        <CategoryCard label="Cakes"  onPress={() => navigation.navigate('CatalogTab')} />
        <CategoryCard label="Pizza"  onPress={() => navigation.navigate('CatalogTab')} />
        <CategoryCard label="Burger" onPress={() => navigation.navigate('CatalogTab')} />
      </View>

      {/* ── Quiet info strip ── */}
      <InfoBanner
        title="Fresh daily — no egg, no meat"
        message={brand.trustMessage}
      />

      {/* ── Trending ── */}
      {trending.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Trending now" />
          <View style={styles.list}>
            {trending.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onPress={() => navigation.navigate('ProductDetails', { productId: p._id })}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* ── Recommended ── */}
      {recommended.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="For you" />
          <View style={styles.list}>
            {recommended.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onPress={() => navigation.navigate('ProductDetails', { productId: p._id })}
              />
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    gap: customerTheme.spacing.sm,
    paddingTop: customerTheme.spacing.sm,
    paddingBottom: customerTheme.spacing.xs,
  },
  heroRule: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: palette.warm,
  },
  wordmarkRow: {
    flex: 1,
    gap: 3,
  },
  kicker: {
    ...t.overline,
    color: palette.warm,
  },
  wordmark: {
    ...t.display,
    color: palette.text,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 0.3,
  },
  tagline: {
    ...t.caption,
    color: palette.textSoft,
    letterSpacing: 0.2,
  },
  searchWrap: {
    gap: 0,
  },
  searchInput: {
    ...t.input,
    color: palette.text,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  searchLine: {
    height: 1,
    backgroundColor: palette.border,
  },
  catRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.hairline,
    paddingVertical: 4,
  },
  section: {
    gap: customerTheme.spacing.sm,
  },
  list: {
    gap: customerTheme.spacing.lg,
  },
});
