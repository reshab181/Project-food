import { Product } from '@bambam/shared';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { customerTheme } from '../theme';
import { formatPrice } from '../utils/format';
import { PureVegBadge } from './PureVegBadge';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard = ({ product, onPress }: ProductCardProps) => (
  <Pressable onPress={onPress} style={styles.card}>
    <Image source={{ uri: product.imageUrls[0] }} style={styles.image} />
    <View style={styles.content}>
      <PureVegBadge />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.description}>{product.shortDescription}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>{formatPrice(product.variants[0]?.price ?? 0)}</Text>
        <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    overflow: 'hidden',
    shadowColor: customerTheme.colors.cardShadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  image: {
    width: '100%',
    height: 180
  },
  content: {
    padding: customerTheme.spacing.md,
    gap: 8
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: customerTheme.colors.text
  },
  description: {
    color: customerTheme.colors.textMuted,
    lineHeight: 20
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: customerTheme.colors.primary
  },
  rating: {
    color: customerTheme.colors.textMuted,
    fontWeight: '700'
  }
});
