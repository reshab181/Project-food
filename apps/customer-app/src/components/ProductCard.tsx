// Minimal product card — full-bleed image, thin rule divider, light text.
// No shadow, no heavy rounded corners, no colour block.
import { Product } from '@bambam/shared';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, type as t } from '../theme';
import { formatPrice } from '../utils/format';
import { PureVegBadge } from './PureVegBadge';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard = ({ product, onPress }: ProductCardProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}
    accessibilityRole="button"
  >
    <Image
      source={{ uri: product.imageUrls[0] }}
      style={styles.image}
      resizeMode="cover"
    />
    <View style={styles.body}>
      <PureVegBadge />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.desc} numberOfLines={2}>{product.shortDescription}</Text>
      <View style={styles.foot}>
        <Text style={styles.price}>{formatPrice(product.variants[0]?.price ?? 0)}</Text>
        <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
      </View>
    </View>
    <View style={styles.rule} />
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: palette.hairline,
  },
  body: {
    paddingTop: 12,
    paddingBottom: 16,
    gap: 6,
  },
  name: {
    ...t.title,
    color: palette.text,
  },
  desc: {
    ...t.body,
    color: palette.textSoft,
  },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  price: {
    ...t.price,
    color: palette.text,
  },
  rating: {
    ...t.caption,
    color: palette.textFaint,
  },
  rule: {
    height: 1,
    backgroundColor: palette.hairline,
  },
});
