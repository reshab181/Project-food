import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { applyCoupon, removeFromCart, updateQuantity } from '../store/cartSlice';
import { customerTheme, palette, type as t } from '../theme';
import { formatPrice } from '../utils/format';

export const CartScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { success } = useToast();
  const cart     = useAppSelector((s) => s.cart);
  const products = useAppSelector((s) => s.catalog.products);

  const enriched = useMemo(
    () =>
      cart.items.map((item) => {
        const product = products.find((p) => p._id === item.productId);
        const variant = product?.variants.find((v) => (v._id ?? v.value) === item.variantId);
        return {
          ...item,
          product,
          variant,
          lineTotal: ((variant?.price ?? 0) + item.addOns.reduce((s, a) => s + a.price, 0)) * item.quantity,
        };
      }),
    [cart.items, products]
  );

  const totals = useMemo(() => {
    const sub      = enriched.reduce((s, i) => s + i.lineTotal, 0);
    const rawDiscount = cart.coupon
      ? cart.coupon.discountType === 'percentage'
        ? sub * (cart.coupon.discountValue / 100)
        : cart.coupon.discountValue
      : 0;
    const discount = cart.coupon && sub >= cart.coupon.minimumOrderValue
      ? Math.min(rawDiscount, cart.coupon.maxDiscountValue ?? rawDiscount, sub)
      : 0;
    const delivery = sub > 499 ? 0 : 40;
    const tax      = sub * 0.05;
    return { sub, discount, delivery, tax, grand: sub + delivery + tax - discount };
  }, [cart.coupon, enriched]);

  const handleCoupon = () => {
    if (cart.coupon) {
      dispatch(applyCoupon(undefined));
      success('Coupon removed.');
    } else {
      dispatch(applyCoupon({
        code: 'PUREVEG10', title: 'Welcome offer', description: '10% off',
        discountType: 'percentage', discountValue: 10,
        minimumOrderValue: 399, maxDiscountValue: 120, isActive: true,
      }));
      success('PUREVEG10 applied — 10% off.');
    }
  };

  return (
    <Screen>
      <SectionHeader title="Cart" subtitle={`${enriched.length} item${enriched.length !== 1 ? 's' : ''}`} />

      {enriched.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : null}

      {enriched.map((item) => (
        <View key={`${item.productId}-${item.variantId}`}>
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product?.name}</Text>
              <Text style={styles.itemMeta}>{item.variant?.label}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemPrice}>{formatPrice(item.lineTotal)}</Text>
              <View style={styles.qtyRow}>
                <Text
                  onPress={() => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity - 1 }))}
                  style={styles.qtyBtn}
                >−</Text>
                <Text style={styles.qtyVal}>{item.quantity}</Text>
                <Text
                  onPress={() => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity + 1 }))}
                  style={styles.qtyBtn}
                >+</Text>
              </View>
              <Pressable onPress={() => dispatch(removeFromCart({ productId: item.productId, variantId: item.variantId }))}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.rule} />
        </View>
      ))}

      {/* Coupon */}
      <Pressable onPress={handleCoupon} style={styles.couponRow}>
        <Text style={styles.couponText}>
          {cart.coupon ? `✓ ${cart.coupon.code} applied` : 'Apply promo code PUREVEG10'}
        </Text>
        <Text style={styles.couponArrow}>{cart.coupon ? 'Remove' : '→'}</Text>
      </Pressable>

      <View style={styles.rule} />

      {/* Totals */}
      <View style={styles.totals}>
        {[
          ['Subtotal',  formatPrice(totals.sub)],
          ['Tax (5%)',  formatPrice(totals.tax)],
          ['Delivery',  formatPrice(totals.delivery)],
          ...(totals.discount > 0 ? [['Discount', `−${formatPrice(totals.discount)}`]] : []),
        ].map(([k, v]) => (
          <View key={k} style={styles.totalRow}>
            <Text style={styles.totalKey}>{k}</Text>
            <Text style={styles.totalVal}>{v}</Text>
          </View>
        ))}
        <View style={[styles.totalRow, styles.grandRow]}>
          <Text style={styles.grandKey}>Total</Text>
          <Text style={styles.grandVal}>{formatPrice(totals.grand)}</Text>
        </View>
      </View>

      <PrimaryButton label="Proceed to checkout" onPress={() => navigation.navigate('Checkout')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  empty: { ...t.body, color: palette.textFaint, textAlign: 'center', paddingVertical: 40 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, gap: 12 },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { ...t.body, color: palette.text },
  itemMeta: { ...t.caption, color: palette.textSoft },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  itemPrice: { ...t.price, color: palette.text },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { ...t.label, color: palette.accent, width: 28, textAlign: 'center' },
  qtyVal: { ...t.label, color: palette.text, minWidth: 16, textAlign: 'center' },
  remove: { ...t.caption, color: palette.error },
  rule: { height: 1, backgroundColor: palette.hairline },
  couponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  couponText: { ...t.body, color: palette.accent },
  couponArrow: { ...t.caption, color: palette.textFaint },
  totals: { gap: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalKey: { ...t.body, color: palette.textSoft },
  totalVal: { ...t.body, color: palette.text },
  grandRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.hairline, marginTop: 4 },
  grandKey: { ...t.label, color: palette.text },
  grandVal: { ...t.price, color: palette.text },
});
