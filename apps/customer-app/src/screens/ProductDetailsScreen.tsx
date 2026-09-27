import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { PureVegBadge } from '../components/PureVegBadge';
import { SectionHeader } from '../components/SectionHeader';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/catalogSlice';
import { customerTheme, palette, type as t } from '../theme';
import { formatPrice } from '../utils/format';

export const ProductDetailsScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const { success } = useToast();
  const product     = useAppSelector((s) => s.catalog.products.find((p) => p._id === productId));
  const wishlistIds = useAppSelector((s) => s.catalog.wishlistIds);
  const [variantId,        setVariantId]        = useState(product?.variants[0]?._id ?? '');
  const [quantity,         setQuantity]         = useState(1);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  const activeVariant = useMemo(
    () => product?.variants.find((v) => v._id === variantId) ?? product?.variants[0],
    [product, variantId]
  );

  if (!product || !activeVariant) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found.</Text>
      </View>
    );
  }

  const inWishlist = wishlistIds.includes(product._id);

  const handleAddToCart = () => {
    dispatch(addToCart({
      product,
      variantId: activeVariant._id ?? activeVariant.value,
      quantity,
      addOnIds: selectedAddOnIds,
    }));
    success(`${product.name} added to cart.`);
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product._id));
    if (!inWishlist) success('Saved to your wishlist.');
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Image — full-bleed, gentle radius */}
      <Image source={{ uri: product.imageUrls[0] }} style={styles.image} resizeMode="cover" />

      {/* Meta */}
      <View style={styles.meta}>
        <PureVegBadge />
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.desc}>{product.description}</Text>
        <Text style={styles.price}>{formatPrice(activeVariant.price)}</Text>
      </View>

      <View style={styles.rule} />

      {/* Variant selector */}
      <SectionHeader title="Size" />
      <View style={styles.variantRow}>
        {product.variants.map((v) => {
          const active = variantId === (v._id ?? v.value);
          return (
            <Pressable
              key={v._id ?? v.value}
              onPress={() => setVariantId(v._id ?? v.value)}
              style={[styles.variantChip, active && styles.variantChipActive]}
            >
              <Text style={[styles.variantLabel, active && styles.variantLabelActive]}>
                {v.label}
              </Text>
              <Text style={styles.variantPrice}>{formatPrice(v.price)}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Ingredients */}
      {product.ingredients.length > 0 ? (
        <>
          <View style={styles.rule} />
          <SectionHeader title="Ingredients" />
          <View style={styles.tagWrap}>
            {product.ingredients.map((ing) => (
              <Text key={ing} style={styles.tag}>{ing}</Text>
            ))}
          </View>
        </>
      ) : null}

      {/* Add-ons */}
      {product.addOns.length > 0 ? (
        <>
          <View style={styles.rule} />
          <SectionHeader title="Add-ons" />
          <View style={styles.tagWrap}>
            {product.addOns.map((a) => {
              const active = selectedAddOnIds.includes(a._id ?? '');
              return (
                <Text
                  key={a._id}
                  onPress={() =>
                    setSelectedAddOnIds((cur) =>
                      active ? cur.filter((id) => id !== a._id) : [...cur, a._id ?? '']
                    )
                  }
                  style={[styles.tag, active && styles.tagActive]}
                >
                  {a.name} +{formatPrice(a.price)}
                </Text>
              );
            })}
          </View>
        </>
      ) : null}

      {/* Qty + CTA */}
      <View style={styles.rule} />
      <View style={styles.footer}>
        <View style={styles.qtyRow}>
          <Text
            onPress={() => setQuantity((n) => Math.max(1, n - 1))}
            style={styles.qtyBtn}
          >−</Text>
          <Text style={styles.qtyVal}>{quantity}</Text>
          <Text
            onPress={() => setQuantity((n) => n + 1)}
            style={styles.qtyBtn}
          >+</Text>
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton label="Add to cart" onPress={handleAddToCart} />
        </View>
      </View>

      <PrimaryButton
        variant="outline"
        label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        onPress={handleWishlist}
      />

      <Text style={styles.ratingLine}>
        ★ {product.rating.toFixed(1)} · {product.reviewCount} ratings
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: palette.bg },
  content: {
    gap: customerTheme.spacing.lg,
    paddingBottom: customerTheme.spacing.xxl,
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg },
  notFoundText: { ...t.body, color: palette.textSoft },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: palette.hairline,
  },
  meta: {
    paddingHorizontal: customerTheme.spacing.md,
    gap: 8,
  },
  name: { ...t.heading, color: palette.text },
  desc: { ...t.body, color: palette.textSoft },
  price: { ...t.price, fontSize: 18, color: palette.text, marginTop: 4 },
  rule: {
    height: 1,
    backgroundColor: palette.hairline,
    marginHorizontal: customerTheme.spacing.md,
  },
  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: customerTheme.spacing.md,
  },
  variantChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    gap: 2,
  },
  variantChipActive: { borderColor: palette.accent },
  variantLabel: { ...t.label, color: palette.text },
  variantLabelActive: { color: palette.accent },
  variantPrice: { ...t.caption, color: palette.textSoft },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: customerTheme.spacing.md,
  },
  tag: {
    ...t.caption,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.textSoft,
  },
  tagActive: { borderColor: palette.accent, color: palette.accent },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: customerTheme.spacing.md,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    ...t.heading,
    width: 36,
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: palette.accent,
  },
  qtyVal: { ...t.label, fontSize: 16, color: palette.text, minWidth: 20, textAlign: 'center' },
  ratingLine: {
    ...t.caption,
    color: palette.textFaint,
    textAlign: 'center',
    paddingHorizontal: customerTheme.spacing.md,
  },
});
