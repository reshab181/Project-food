import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { CartItem, Coupon, Product } from '@bambam/shared';

interface CartState {
  items: CartItem[];
  coupon?: Coupon;
}

const initialState: CartState = {
  items: []
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: Product; variantId: string; quantity: number; addOnIds?: string[]; note?: string }>) {
      const { product, variantId, quantity, addOnIds = [], note } = action.payload;
      const variant = product.variants.find((item) => item._id === variantId) ?? product.variants[0];
      const addOns = product.addOns.filter((addOn) => addOnIds.includes(addOn._id ?? ''));
      const existing = state.items.find((item) => item.productId === product._id && item.variantId === variant._id);

      if (existing) {
        existing.quantity += quantity;
        existing.addOns = addOns;
        existing.note = note;
      } else {
        state.items.push({
          productId: product._id,
          variantId: variant._id ?? variant.value,
          quantity,
          addOns,
          note
        });
      }
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; variantId: string; quantity: number }>) {
      const line = state.items.find(
        (item) => item.productId === action.payload.productId && item.variantId === action.payload.variantId
      );
      if (line) {
        line.quantity = action.payload.quantity;
      }
      state.items = state.items.filter((item) => item.quantity > 0);
    },
    removeFromCart(state, action: PayloadAction<{ productId: string; variantId: string }>) {
      state.items = state.items.filter(
        (item) => !(item.productId === action.payload.productId && item.variantId === action.payload.variantId)
      );
    },
    applyCoupon(state, action: PayloadAction<Coupon | undefined>) {
      state.coupon = action.payload;
    },
    clearCart(state) {
      state.items = [];
      state.coupon = undefined;
    }
  }
});

export const { addToCart, updateQuantity, removeFromCart, applyCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
