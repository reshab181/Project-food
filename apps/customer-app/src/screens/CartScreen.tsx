import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppDispatch, useAppSelector } from '../store';
import { applyCoupon, removeFromCart, updateQuantity } from '../store/cartSlice';
import { customerTheme } from '../theme';
import { formatPrice } from '../utils/format';

export const CartScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const products = useAppSelector((state) => state.catalog.products);

  const enrichedItems = useMemo(
    () =>
      cart.items.map((item) => {
        const product = products.find((entry) => entry._id === item.productId);
        const variant = product?.variants.find((entry) => (entry._id ?? entry.value) === item.variantId);
        return {
          ...item,
          product,
          variant,
          lineTotal: ((variant?.price ?? 0) + item.addOns.reduce((sum, addOn) => sum + addOn.price, 0)) * item.quantity
        };
      }),
    [cart.items, products]
  );

  const totals = useMemo(() => {
    const subtotal = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const discount = cart.coupon ? Math.min(subtotal * 0.1, cart.coupon.maxDiscountValue ?? 9999) : 0;
    // Tax and delivery charges are not applied (consistent with checkout).
    return {
      subtotal,
      discount,
      grandTotal: subtotal - discount
    };
  }, [cart.coupon, enrichedItems]);

  return (
    <Screen>
      <SectionHeader title="Your cart" subtitle="Freshly prepared pure veg items only." />
      {enrichedItems.length === 0 ? <Text style={styles.empty}>Your cart is empty.</Text> : null}
      {enrichedItems.map((item) => (
        <View key={`${item.productId}-${item.variantId}`} style={styles.card}>
          <Text style={styles.name}>{item.product?.name}</Text>
          <Text style={styles.meta}>{item.variant?.label}</Text>
          <View style={styles.row}>
            <Text style={styles.price}>{formatPrice(item.lineTotal)}</Text>
            <View style={styles.qtyRow}>
              <Text
                onPress={() =>
                  dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity - 1 }))
                }
                style={styles.qtyButton}
              >
                -
              </Text>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
              <Text
                onPress={() =>
                  dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity + 1 }))
                }
                style={styles.qtyButton}
              >
                +
              </Text>
            </View>
          </View>
          <Pressable onPress={() => dispatch(removeFromCart({ productId: item.productId, variantId: item.variantId }))}>
            <Text style={styles.remove}>Remove item</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.couponCard}>
        <Text style={styles.couponTitle}>Apply offer</Text>
        <PrimaryButton
          label={cart.coupon ? 'Coupon applied: PUREVEG10' : 'Apply PUREVEG10'}
          variant="outline"
          onPress={() =>
            dispatch(
              applyCoupon(
                cart.coupon
                  ? undefined
                  : {
                      code: 'PUREVEG10',
                      title: 'Welcome',
                      description: '10% off',
                      discountType: 'percentage',
                      discountValue: 10,
                      minimumOrderValue: 399,
                      maxDiscountValue: 120,
                      isActive: true
                    }
              )
            )
          }
        />
      </View>

      <View style={styles.summary}>
        <Text>Subtotal: {formatPrice(totals.subtotal)}</Text>
        {totals.discount > 0 ? <Text>Discount: -{formatPrice(totals.discount)}</Text> : null}
        <Text style={styles.total}>Grand total: {formatPrice(totals.grandTotal)}</Text>
      </View>

      <PrimaryButton label="Proceed to checkout" onPress={() => navigation.navigate('Checkout')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  empty: {
    color: customerTheme.colors.textMuted
  },
  card: {
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.md,
    gap: 8
  },
  name: {
    fontWeight: '800',
    fontSize: 17,
    color: customerTheme.colors.text
  },
  meta: {
    color: customerTheme.colors.textMuted
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontWeight: '800',
    color: customerTheme.colors.primary
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  qtyButton: {
    width: 32,
    height: 32,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 16,
    backgroundColor: customerTheme.colors.mutedSurface
  },
  qtyValue: {
    fontWeight: '800'
  },
  remove: {
    color: customerTheme.colors.error,
    fontWeight: '700'
  },
  couponCard: {
    backgroundColor: '#FFF5DE',
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.md,
    gap: 12
  },
  couponTitle: {
    fontWeight: '800',
    color: customerTheme.colors.primaryDark
  },
  summary: {
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.md,
    gap: 10
  },
  total: {
    fontWeight: '900',
    color: customerTheme.colors.primary
  }
});
