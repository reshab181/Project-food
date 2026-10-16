import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Product, demoProducts } from '@bambam/shared';
import { productApi } from '../api/services';

interface CatalogState {
  products: Product[];
  selectedProduct?: Product;
  wishlistIds: string[];
  status: 'idle' | 'loading' | 'success' | 'error';
}

const initialState: CatalogState = {
  products: demoProducts,
  wishlistIds: [],
  status: 'idle'
};

export const fetchProducts = createAsyncThunk('catalog/fetchProducts', async (params?: Record<string, unknown>) => {
  const response = await productApi.list(params);
  return response.data.data;
});

export const fetchProductById = createAsyncThunk('catalog/fetchProductById', async (id: string) => {
  const response = await productApi.getById(id);
  return response.data;
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setSelectedProduct(state, action: PayloadAction<Product | undefined>) {
      state.selectedProduct = action.payload;
    },
    toggleWishlist(state, action: PayloadAction<string>) {
      if (state.wishlistIds.includes(action.payload)) {
        state.wishlistIds = state.wishlistIds.filter((id) => id !== action.payload);
      } else {
        state.wishlistIds.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload.length > 0 ? action.payload : demoProducts;
        state.status = 'success';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
      })
      .addMatcher(
        (action) => action.type.startsWith('catalog/') && action.type.endsWith('/rejected'),
        (state) => {
          state.status = 'error';
        }
      );
  }
});

export const { setSelectedProduct, toggleWishlist } = catalogSlice.actions;
export default catalogSlice.reducer;
