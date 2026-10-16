import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useAppSelector } from '../store';

export const WishlistScreen = ({ navigation }: any) => {
  const products = useAppSelector((state) =>
    state.catalog.products.filter((product) => state.catalog.wishlistIds.includes(product._id))
  );

  return (
    <Screen>
      <SectionHeader title="Wishlist" subtitle="Your saved pure veg picks for the next craving." />
      {products.map((product) => (
        <ProductCard key={product._id} product={product} onPress={() => navigation.navigate('ProductDetails', { productId: product._id })} />
      ))}
    </Screen>
  );
};
