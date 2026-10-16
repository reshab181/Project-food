import { Address } from '@bambam/shared';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppDispatch, useAppSelector } from '../store';
import { saveAddress } from '../store/authSlice';
import { clearCart } from '../store/cartSlice';
import { placeOrder } from '../store/orderSlice';
import { customerTheme } from '../theme';

const emptyAddress: Address = {
  label: 'Home',
  line1: '',
  line2: '',
  landmark: '',
  city: '',
  state: '',
  postalCode: ''
};

export const CheckoutScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth.user);
  const cart = useAppSelector((state) => state.cart);
  const products = useAppSelector((state) => state.catalog.products);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'qr'>('upi');
  const [deliveryTime, setDeliveryTime] = useState('Today, 7:00 PM');
  const [note, setNote] = useState('Please keep it fresh and deliver carefully.');
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressDraft, setAddressDraft] = useState<Address>(emptyAddress);

  const summary = useMemo(() => {
    const subtotal = cart.items.reduce((sum, item) => {
      const product = products.find((entry) => entry._id === item.productId);
      const variant = product?.variants.find((entry) => (entry._id ?? entry.value) === item.variantId);
      return sum + ((variant?.price ?? 0) + item.addOns.reduce((addOnSum, addOn) => addOnSum + addOn.price, 0)) * item.quantity;
    }, 0);
    // Tax and delivery charges are not applied.
    const tax = 0;
    const deliveryCharge = 0;
    const discount = cart.coupon ? Math.min(subtotal * 0.1, cart.coupon.maxDiscountValue ?? 9999) : 0;
    return { subtotal, tax, deliveryCharge, discount, grandTotal: subtotal - discount };
  }, [cart.coupon, cart.items, products]);

  const address = auth?.addresses?.[0];

  const openAddressEditor = () => {
    setAddressDraft(address ? { ...emptyAddress, ...address } : emptyAddress);
    setAddressModalVisible(true);
  };

  const updateDraft = (field: keyof Address, value: string) => {
    setAddressDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAddress = () => {
    if (!addressDraft.line1.trim() || !addressDraft.city.trim() || !addressDraft.state.trim() || !addressDraft.postalCode.trim()) {
      Alert.alert('Incomplete address', 'Please fill address line, city, state and postal code.');
      return;
    }
    dispatch(saveAddress({ address: { ...addressDraft, label: addressDraft.label.trim() || 'Home' } }));
    setAddressModalVisible(false);
  };

  const handlePlaceOrder = async () => {
    if (!address) {
      Alert.alert('Missing address', 'Please add a delivery address in your profile.');
      return;
    }

    try {
      const order = await dispatch(
        placeOrder({
          items: cart.items.map((item) => {
            const product = products.find((entry) => entry._id === item.productId)!;
            const variant = product.variants.find((entry) => (entry._id ?? entry.value) === item.variantId)!;
            return {
              productId: product._id,
              productName: product.name,
              category: product.category,
              imageUrl: product.imageUrls[0],
              variantLabel: variant.label,
              quantity: item.quantity,
              unitPrice: variant.price,
              totalPrice: (variant.price + item.addOns.reduce((addOnSum, addOn) => addOnSum + addOn.price, 0)) * item.quantity,
              addOns: item.addOns,
              veg: true
            };
          }),
          address,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
          pricing: summary,
          scheduledFor: deliveryTime,
          note,
          couponCode: cart.coupon?.code
        })
      ).unwrap();

      dispatch(clearCart());
      navigation.navigate('OrderTracking', { orderId: order._id });
    } catch (error) {
      Alert.alert('Order failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <Screen>
      <SectionHeader title="Checkout" subtitle="Transparent pricing, flexible payment, pure veg trust." />
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.label}>Delivery address</Text>
          <Text style={styles.editLink} onPress={openAddressEditor}>
            {address ? 'Edit' : 'Add'}
          </Text>
        </View>
        {address ? (
          <>
            <Text style={styles.addressLabel}>{address.label}</Text>
            <Text>{address.line1}</Text>
            {address.line2 ? <Text>{address.line2}</Text> : null}
            {address.landmark ? <Text>Landmark: {address.landmark}</Text> : null}
            <Text>
              {address.city}, {address.state} {address.postalCode}
            </Text>
          </>
        ) : (
          <Text style={styles.muted}>No delivery address yet. Tap "Add" to enter one.</Text>
        )}
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Preferred delivery time</Text>
        <TextInput value={deliveryTime} onChangeText={setDeliveryTime} style={styles.input} />
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Order note</Text>
        <TextInput value={note} onChangeText={setNote} style={[styles.input, styles.note]} multiline />
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Payment method</Text>
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
        <Text>Subtotal: Rs. {summary.subtotal.toFixed(0)}</Text>
        {summary.discount > 0 ? <Text>Discount: Rs. {summary.discount.toFixed(0)}</Text> : null}
        <Text style={styles.total}>Grand total: Rs. {summary.grandTotal.toFixed(0)}</Text>
      </View>
      <PrimaryButton label="Place order" onPress={handlePlaceOrder} />

      <Modal visible={addressModalVisible} animationType="slide" transparent onRequestClose={() => setAddressModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.modalTitle}>Delivery address</Text>
              <Text style={styles.editLink} onPress={() => setAddressModalVisible(false)}>
                Close
              </Text>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
              <Text style={styles.fieldLabel}>Label</Text>
              <TextInput value={addressDraft.label} onChangeText={(t) => updateDraft('label', t)} placeholder="Home, Work..." style={styles.input} />

              <Text style={styles.fieldLabel}>Address line 1</Text>
              <TextInput value={addressDraft.line1} onChangeText={(t) => updateDraft('line1', t)} placeholder="House no, street" style={styles.input} />

              <Text style={styles.fieldLabel}>Address line 2 (optional)</Text>
              <TextInput value={addressDraft.line2 ?? ''} onChangeText={(t) => updateDraft('line2', t)} placeholder="Area, colony" style={styles.input} />

              <Text style={styles.fieldLabel}>Landmark (optional)</Text>
              <TextInput value={addressDraft.landmark ?? ''} onChangeText={(t) => updateDraft('landmark', t)} placeholder="Near..." style={styles.input} />

              <Text style={styles.fieldLabel}>City</Text>
              <TextInput value={addressDraft.city} onChangeText={(t) => updateDraft('city', t)} placeholder="City" style={styles.input} />

              <Text style={styles.fieldLabel}>State</Text>
              <TextInput value={addressDraft.state} onChangeText={(t) => updateDraft('state', t)} placeholder="State" style={styles.input} />

              <Text style={styles.fieldLabel}>Postal code</Text>
              <TextInput
                value={addressDraft.postalCode}
                onChangeText={(t) => updateDraft('postalCode', t)}
                placeholder="452001"
                keyboardType="number-pad"
                style={styles.input}
              />

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setAddressModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <View style={styles.saveBtnWrap}>
                  <PrimaryButton label="Save address" onPress={handleSaveAddress} />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  label: {
    fontWeight: '800',
    color: customerTheme.colors.text
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  editLink: {
    fontWeight: '800',
    color: customerTheme.colors.primary
  },
  addressLabel: {
    fontWeight: '700',
    color: customerTheme.colors.text
  },
  muted: {
    color: customerTheme.colors.textMuted
  },
  fieldLabel: {
    fontWeight: '700',
    color: customerTheme.colors.text,
    marginBottom: 6,
    marginTop: 10
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: customerTheme.colors.surface,
    borderTopLeftRadius: customerTheme.radius.lg,
    borderTopRightRadius: customerTheme.radius.lg,
    paddingHorizontal: customerTheme.spacing.md,
    paddingTop: customerTheme.spacing.md,
    paddingBottom: customerTheme.spacing.md,
    maxHeight: '88%'
  },
  modalTitle: {
    fontWeight: '900',
    fontSize: 18,
    color: customerTheme.colors.text
  },
  modalScroll: {
    paddingBottom: 24
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: customerTheme.radius.md,
    backgroundColor: customerTheme.colors.mutedSurface
  },
  cancelBtnText: {
    fontWeight: '800',
    color: customerTheme.colors.text
  },
  saveBtnWrap: {
    flex: 1
  },
  input: {
    borderWidth: 1,
    borderColor: customerTheme.colors.border,
    borderRadius: customerTheme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff'
  },
  note: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10
  },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: customerTheme.radius.pill,
    backgroundColor: customerTheme.colors.mutedSurface
  },
  methodChipActive: {
    backgroundColor: '#E9F7EE',
    color: customerTheme.colors.primary
  },
  total: {
    fontWeight: '900',
    color: customerTheme.colors.primary
  }
});
