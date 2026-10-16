import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { PureVegBadge } from '../components/PureVegBadge';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/catalogSlice';
import { customerTheme } from '../theme';
import { formatPrice } from '../utils/format';

export const ProductDetailsScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) => state.catalog.products.find((item) => item._id === productId));
  const wishlistIds = useAppSelector((state) => state.catalog.wishlistIds);
  const [variantId, setVariantId] = useState(product?.variants[0]?._id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  const activeVariant = useMemo(
    () => product?.variants.find((item) => item._id === variantId) ?? product?.variants[0],
    [product, variantId]
  );

  if (!product || !activeVariant) {
    return (
      <Screen>
        <Text>Product not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Image source={{ uri: product.imageUrls[0] }} style={styles.image} />
      <PureVegBadge />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.price}>{formatPrice(activeVariant.price)}</Text>

      <SectionHeader title="Size / weight" />
      <View style={styles.row}>
        {product.variants.map((variant) => (
          <Pressable
            key={variant._id}
            onPress={() => setVariantId(variant._id ?? variant.value)}
            style={[styles.selector, variantId === (variant._id ?? variant.value) && styles.selectorActive]}
          >
            <Text style={styles.selectorTitle}>{variant.label}</Text>
            <Text style={styles.selectorPrice}>{formatPrice(variant.price)}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Ingredients transparency" subtitle="We proudly disclose what goes into every pure veg item." />
      <View style={styles.ingredientWrap}>
        {product.ingredients.map((ingredient) => (
          <Text key={ingredient} style={styles.ingredient}>
            {ingredient}
          </Text>
        ))}
      </View>

      {product.addOns.length > 0 ? (
        <>
          <SectionHeader title="Add-ons" subtitle="Optional extras for a better celebration or snack combo." />
          <View style={styles.ingredientWrap}>
            {product.addOns.map((addOn) => {
              const active = selectedAddOnIds.includes(addOn._id ?? '');
              return (
                <Text
                  key={addOn._id}
                  onPress={() =>
                    setSelectedAddOnIds((current) =>
                      active ? current.filter((id) => id !== addOn._id) : [...current, addOn._id ?? '']
                    )
                  }
                  style={[styles.ingredient, active && styles.addOnActive]}
                >
                  {addOn.name} +{formatPrice(addOn.price)}
                </Text>
              );
            })}
          </View>
        </>
      ) : null}

      <SectionHeader title="Customer reviews" />
      <Text style={styles.review}>
        ★ {product.rating.toFixed(1)} from {product.reviewCount} ratings
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.quantityRow}>
          <Text onPress={() => setQuantity((value) => Math.max(1, value - 1))} style={styles.quantityButton}>
            -
          </Text>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <Text onPress={() => setQuantity((value) => value + 1)} style={styles.quantityButton}>
            +
          </Text>
        </View>
        <PrimaryButton
          label="Add to cart"
          onPress={() => {
            dispatch(addToCart({ product, variantId: activeVariant._id ?? activeVariant.value, quantity, addOnIds: selectedAddOnIds }));
            Alert.alert('Added', `${product.name} added to cart.`);
          }}
        />
      </View>

      <PrimaryButton
        variant="outline"
        label={wishlistIds.includes(product._id) ? 'Remove from wishlist' : 'Save to wishlist'}
        onPress={() => {
          dispatch(toggleWishlist(product._id));
          if (!wishlistIds.includes(product._id)) {
            navigation.navigate('Wishlist');
          }
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 260,
    borderRadius: customerTheme.radius.lg
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: customerTheme.colors.text
  },
  description: {
    color: customerTheme.colors.textMuted,
    lineHeight: 22
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: customerTheme.colors.primary
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  selector: {
    flex: 1,
    padding: customerTheme.spacing.md,
    borderRadius: customerTheme.radius.md,
    borderWidth: 1,
    borderColor: customerTheme.colors.border,
    backgroundColor: customerTheme.colors.surface
  },
  selectorActive: {
    borderColor: customerTheme.colors.primary
  },
  selectorTitle: {
    fontWeight: '800',
    color: customerTheme.colors.text
  },
  selectorPrice: {
    marginTop: 6,
    color: customerTheme.colors.textMuted
  },
  ingredientWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  ingredient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: customerTheme.radius.pill,
    backgroundColor: customerTheme.colors.mutedSurface,
    color: customerTheme.colors.textMuted
  },
  addOnActive: {
    backgroundColor: '#E9F7EE',
    color: customerTheme.colors.primary
  },
  review: {
    color: customerTheme.colors.textMuted
  },
  footerRow: {
    gap: 16
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: customerTheme.colors.surface,
    color: customerTheme.colors.primary,
    fontWeight: '900',
    fontSize: 22
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '800'
  }
});
