import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useAppDispatch, useAppSelector } from '../store';
import { createAdminProduct, fetchAdminProducts, updateAdminProduct } from '../store/opsSlice';
import { adminTheme } from '../theme';

export const ProductsScreen = () => {
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.adminAuth.user?.role);
  const products = useAppSelector((state) => state.ops.products);
  const canManage = role === 'super_admin';
  const [form, setForm] = useState({
    name: 'Fresh Mango Cake',
    slug: 'fresh-mango-cake',
    category: 'cakes',
    price: '599',
    stockQty: '14',
    imageUrl: ''
  });

  useEffect(() => {
    void dispatch(fetchAdminProducts());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!canManage) {
      Alert.alert('Restricted', 'Only the super admin can create or edit products.');
      return;
    }

    try {
      await dispatch(
        createAdminProduct({
          name: form.name,
          slug: form.slug,
          category: form.category as 'cakes' | 'pizza' | 'burger',
          shortDescription: `${form.name} crafted for pure veg celebrations.`,
          description: `${form.name} is prepared in the Bam Bam 100% Pure Veg kitchen.`,
          ingredients: ['Pure veg ingredients', 'Fresh cream', 'Premium bakery base'],
          imageUrls: [form.imageUrl.trim() || 'https://placehold.co/600x400?text=Bam+Bam+Pure+Veg'],
          badges: ['Pure Veg', 'Fresh'],
          rating: 4.8,
          reviewCount: 0,
          isBestSeller: false,
          isTrending: true,
          isRecommended: true,
          isAvailable: true,
          variants: [{ label: 'Standard', value: 'standard', price: Number(form.price), stockQty: Number(form.stockQty), isDefault: true }],
          addOns: [],
          stockQty: Number(form.stockQty),
          prepTimeMinutes: 45,
          loyaltyPoints: 30
        })
      ).unwrap();
      Alert.alert('Product created', 'The customer app will receive the update in real time.');
    } catch (error) {
      Alert.alert('Create failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const toggleAvailability = async (productId: string, current: boolean) => {
    if (!canManage) {
      Alert.alert('Restricted', 'Only the super admin can change availability.');
      return;
    }

    try {
      await dispatch(updateAdminProduct({ id: productId, data: { isAvailable: !current } })).unwrap();
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <Screen>
      <SectionCard title="Product management" subtitle="Create, update, and keep the customer menu synced live.">
        <TextInput value={form.name} onChangeText={(name) => setForm((prev) => ({ ...prev, name }))} style={styles.input} placeholder="Product name" />
        <TextInput value={form.slug} onChangeText={(slug) => setForm((prev) => ({ ...prev, slug }))} style={styles.input} placeholder="Slug" />
        <TextInput value={form.category} onChangeText={(category) => setForm((prev) => ({ ...prev, category }))} style={styles.input} placeholder="cakes / pizza / burger" />
        <TextInput value={form.price} onChangeText={(price) => setForm((prev) => ({ ...prev, price }))} style={styles.input} placeholder="Price" keyboardType="numeric" />
        <TextInput value={form.stockQty} onChangeText={(stockQty) => setForm((prev) => ({ ...prev, stockQty }))} style={styles.input} placeholder="Stock qty" keyboardType="numeric" />
        <TextInput
          value={form.imageUrl}
          onChangeText={(imageUrl) => setForm((prev) => ({ ...prev, imageUrl }))}
          style={styles.input}
          placeholder="Image URL (optional)"
          autoCapitalize="none"
          keyboardType="url"
        />
        {form.imageUrl.trim() ? (
          <Image source={{ uri: form.imageUrl.trim() }} style={styles.imagePreview} resizeMode="cover" />
        ) : (
          <Text style={styles.imageHint}>Paste an image link to preview it. Leave blank to use a placeholder.</Text>
        )}
        <PrimaryButton label={canManage ? 'Add Pure Veg Product' : 'Super admin only'} onPress={handleCreate} />
      </SectionCard>

      <SectionCard title="Current products" subtitle="Delete is intentionally locked; use availability toggle for safer operations.">
        {products.map((product) => (
          <View key={product._id} style={styles.productCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productMeta}>{product.category} • Rs. {product.variants[0]?.price ?? 0} • Stock {product.stockQty}</Text>
            <Text style={styles.productMeta}>Availability: {product.isAvailable ? 'On' : 'Off'}</Text>
            <PrimaryButton label={product.isAvailable ? 'Mark unavailable' : 'Mark available'} variant="outline" onPress={() => toggleAvailability(product._id, product.isAvailable)} />
          </View>
        ))}
      </SectionCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: adminTheme.colors.border,
    borderRadius: adminTheme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff'
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: adminTheme.radius.md,
    backgroundColor: adminTheme.colors.adminSurface
  },
  imageHint: {
    color: adminTheme.colors.textMuted,
    fontSize: 12
  },
  productCard: {
    backgroundColor: adminTheme.colors.adminSurface,
    borderRadius: adminTheme.radius.md,
    padding: adminTheme.spacing.md,
    gap: 8
  },
  productName: {
    fontWeight: '900',
    color: adminTheme.colors.ink
  },
  productMeta: {
    color: adminTheme.colors.textMuted
  }
});
