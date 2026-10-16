import { brand } from '@bambam/shared';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { CategoryCard } from '../components/CategoryCard';
import { InfoBanner } from '../components/InfoBanner';
import { ProductCard } from '../components/ProductCard';
import { PureVegBadge } from '../components/PureVegBadge';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppSelector } from '../store';
import { customerTheme } from '../theme';

export const HomeScreen = ({ navigation }: any) => {
  const products = useAppSelector((state) => state.catalog.products);
  const trending = products.filter((item) => item.isTrending);
  const recommended = products.filter((item) => item.isRecommended);

  return (
    <Screen>
      <View style={styles.header}>
        <PureVegBadge />
        <Text style={styles.title}>{brand.appName}</Text>
        <Text style={styles.subtitle}>{brand.trustMessage}</Text>
      </View>
      <TextInput placeholder="Search cakes, pizza, burgers..." style={styles.search} />
      <InfoBanner title="Fresh from the Pure Veg kitchen" message="Daily baked cakes, cheesy pizza, and satisfying burgers crafted without egg or non-veg ingredients." />
      <SectionHeader title="Shop by category" subtitle="Pure veg favorites for every craving" />
      <View style={styles.categoryRow}>
        <CategoryCard label="Cakes" onPress={() => navigation.navigate('CatalogTab')} />
        <CategoryCard label="Pizza" onPress={() => navigation.navigate('CatalogTab')} />
        <CategoryCard label="Burger" onPress={() => navigation.navigate('CatalogTab')} />
      </View>
      <SectionHeader title="Trending now" subtitle="Best loved by Bam Bam customers" />
      {trending.map((product) => (
        <ProductCard key={product._id} product={product} onPress={() => navigation.navigate('ProductDetails', { productId: product._id })} />
      ))}
      <SectionHeader title="Recommended for you" subtitle="Premium veg picks with ingredient transparency" />
      {recommended.map((product) => (
        <ProductCard key={product._id} product={product} onPress={() => navigation.navigate('ProductDetails', { productId: product._id })} />
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: customerTheme.colors.text
  },
  subtitle: {
    color: customerTheme.colors.textMuted,
    lineHeight: 21
  },
  search: {
    borderRadius: customerTheme.radius.md,
    backgroundColor: customerTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 12
  }
});
