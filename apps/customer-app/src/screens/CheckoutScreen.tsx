import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { clearCart } from '../store/cartSlice';
import { placeOrder } from '../store/orderSlice';
import { customerTheme, type as t } from '../theme';

export const CheckoutScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { success, error, info } = useToast();
  const auth = useAppSelector((state) => state.auth.user);
  const cart = useAppSelector((state) => state.cart);
  const products = useAppSelector((state) => state.catalog.products);
  const orderStatus = useAppSelector((state) => state.orders.status);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'qr'>('upi');
  const [deliveryTime, setDeliveryTime] = useState('Today, 7:00 PM');
  const [note, setNote] = useState('');

  const isPlacing = orderStatus === 'placing';

  const summary = useMemo(() => {
    const subtotal = cart.items.reduce((sum, item) => {
      const product = products.find((e) => e._id === item.productId);
      const variant = product?.variants.find((e) => (e._id ?? e.value) === item.variantId);
      return sum + ((variant?.price ?? 0) + item.addOns.reduce((s, a) => s + a.price, 0)) * item.quantity;
    }, 0);
    const tax = subtotal * 0.05;
    const deliveryCharge = subtotal > 499 ? 0 : 40;
    const rawDiscount = cart.coupon
      ? cart.coupon.discountType === 'percentage'
        ? subtotal * (cart.coupon.discountValue / 100)
        : cart.coupon.discountValue
      : 0;
    const discount = cart.coupon && subtotal >= cart.coupon.minimumOrderValue
      ? Math.min(
          rawDiscount,
          cart.coupon.maxDiscountValue ?? rawDiscount,
          subtotal
        )
      : 0;
    const grandTotal = Math.max(0, subtotal + tax + deliveryCharge - discount);
    return { subtotal, tax, deliveryCharge, discount, grandTotal };
  }, [cart.coupon, cart.items, products]);

  const address = auth?.addresses[0];

  const getScheduledFor = () => {
    // Accept "today, 7:00 PM" or "tomorrow, 7:00 PM"
    const fullMatch = deliveryTime.trim().match(/^(today|tomorrow),\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (fullMatch) {
      const [, day, hourText, minuteText, period] = fullMatch;
      let hour = Number(hourText) % 12;
      if (period.toLowerCase() === 'pm') hour += 12;
      const scheduled = new Date();
      if (day.toLowerCase() === 'tomorrow') scheduled.setDate(scheduled.getDate() + 1);
      scheduled.setHours(hour, Number(minuteText), 0, 0);
      return scheduled.toISOString();
    }
    // Simple time assuming today, e.g., "7:30 PM"
    const simpleMatch = deliveryTime.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (simpleMatch) {
      const [, hourText, minuteText, period] = simpleMatch;
      let hour = Number(hourText) % 12;
      if (period.toLowerCase() === 'pm') hour += 12;
      const scheduled = new Date();
      scheduled.setHours(hour, Number(minuteText), 0, 0);
      return scheduled.toISOString();
    }
    // If parsing fails, omit scheduledFor (immediate delivery)
    return undefined;
  };

  const handlePlaceOrder = async () => {
    if (!address) {
      info('Add a delivery address in your profile, then return to checkout.');
      navigation.navigate('Main', { screen: 'ProfileTab' });
      return;
    }
    if (cart.items.length === 0) {
      info('Your cart is empty. Add items before ordering.');
      return;
    }

    const resolvedItems = cart.items.map((item) => {
      const product = products.find((e) => e._id === item.productId);
      if (!product) return null;
      const variant =
        product.variants.find((e) => (e._id ?? e.value) === item.variantId) ?? product.variants[0];
      if (!variant) return null;
      return {
        productId: product._id,
        variantId: variant._id ?? variant.value,
        quantity: item.quantity,
        addOnIds: item.addOns.map((addOn) => addOn._id).filter((id): id is string => Boolean(id))
      };
    });

    // Filter out any items that could not be resolved (e.g., removed products)
    const sanitizedItems = resolvedItems.filter((i): i is NonNullable<typeof i> => i !== null);
    if (sanitizedItems.length !== resolvedItems.length) {
      info('Some items are no longer available. Please review your cart.');
      return;
    }

    try {
      const order = await dispatch(
        placeOrder({
          items: resolvedItems as NonNullable<(typeof resolvedItems)[0]>[],
          address,
          paymentMethod,
          scheduledFor: getScheduledFor(),
          note: note || undefined,
          couponCode: cart.coupon?.code
        })
      ).unwrap();

      dispatch(clearCart());
      success('Order placed! Tracking your delivery now.');
      navigation.navigate('OrderTracking', { orderId: order._id });
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not place your order. Please try again.');
    }
  };

  return (
    <Screen>
      <SectionHeader title="Checkout" subtitle="Review your order before confirming." />

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Delivery address</Text>
        {address ? (
          <>
            <Text style={styles.addressLine}>{address.label}</Text>
            <Text style={styles.addressLine}>{address.line1}</Text>
            <Text style={styles.addressLine}>{address.city}, {address.state} {address.postalCode}</Text>
          </>
        ) : (
          <Text style={styles.warning}>No saved address — add one in your profile.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Preferred delivery time</Text>
        <TextInput value={deliveryTime} onChangeText={setDeliveryTime} style={styles.input} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Order note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          style={[styles.input, styles.note]}
          placeholder="Any special instructions?"
          multiline
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Payment method</Text>
        <View style={styles.methodRow}>
          {(['cod', 'upi', 'qr'] as const).map((method) => (
            <Text
              key={method}
              onPress={() => setPaymentMethod(method)}
              style={[styles.methodChip, paymentMethod === method && styles.methodChipActive]}
            >
              {method.toUpperCase()}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Subtotal</Text><Text style={styles.summaryVal}>Rs. {summary.subtotal.toFixed(0)}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Tax (5%)</Text><Text style={styles.summaryVal}>Rs. {summary.tax.toFixed(0)}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Delivery</Text><Text style={styles.summaryVal}>Rs. {summary.deliveryCharge.toFixed(0)}</Text></View>
        {summary.discount > 0 ? (
          <View style={styles.summaryRow}><Text style={styles.summaryKey}>Discount</Text><Text style={[styles.summaryVal, { color: customerTheme.colors.primary }]}>-Rs. {summary.discount.toFixed(0)}</Text></View>
        ) : null}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalKey}>Grand total</Text>
          <Text style={styles.totalVal}>Rs. {summary.grandTotal.toFixed(0)}</Text>
        </View>
      </View>

      <PrimaryButton
        label={isPlacing ? 'Placing order…' : 'Place order'}
        onPress={handlePlaceOrder}
        loading={isPlacing}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: customerTheme.colors.surface,
    borderRadius: customerTheme.radius.lg,
    padding: customerTheme.spacing.md,
    gap: 8
  },
  cardLabel: {
    ...t.label,
    color: customerTheme.colors.text
  },
  addressLine: {
    ...t.body,
    color: customerTheme.colors.textMuted
  },
  warning: {
    ...t.caption,
    color: '#C0392B'
  },
  input: {
    ...t.input,
    borderWidth: 1,
    borderColor: customerTheme.colors.border,
    borderRadius: customerTheme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#fff'
  },
  note: { minHeight: 88, textAlignVertical: 'top' },
  methodRow: { flexDirection: 'row', gap: 10 },
  methodChip: {
    ...t.label,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: customerTheme.radius.pill,
    backgroundColor: customerTheme.colors.mutedSurface,
    color: customerTheme.colors.textMuted
  },
  methodChipActive: {
    backgroundColor: '#E9F7EE',
    color: customerTheme.colors.primary
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryKey: { ...t.body, color: customerTheme.colors.textMuted },
  summaryVal: { ...t.body, color: customerTheme.colors.text },
  totalRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: customerTheme.colors.border, marginTop: 4 },
  totalKey: { ...t.label, color: customerTheme.colors.text },
  totalVal: { ...t.price, color: customerTheme.colors.primary }
});
