import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Coupon, DashboardSummary, InventoryItem, Order, Product, UserProfile, demoDashboard, demoInventory, demoOrders, demoProducts } from '@bambam/shared';
import { adminOpsApi } from '../api/services';

interface OpsState {
  dashboard: DashboardSummary;
  orders: Order[];
  products: Product[];
  inventory: InventoryItem[];
  staff: UserProfile[];
  customers: UserProfile[];
  coupons: Coupon[];
  reports: Record<string, unknown>;
  status: 'idle' | 'loading' | 'success' | 'error';
}

const initialState: OpsState = {
  dashboard: demoDashboard,
  orders: demoOrders,
  products: demoProducts,
  inventory: demoInventory,
  staff: [],
  customers: [],
  coupons: [],
  reports: {},
  status: 'idle'
};

export const fetchAdminDashboard = createAsyncThunk('ops/dashboard', async () => (await adminOpsApi.dashboard()).data);
export const fetchAdminOrders = createAsyncThunk('ops/orders', async () => (await adminOpsApi.orders()).data.data);
export const fetchAdminProducts = createAsyncThunk('ops/products', async () => (await adminOpsApi.products()).data.data);
export const createAdminProduct = createAsyncThunk('ops/createProduct', async (payload: Partial<Product>) => (await adminOpsApi.createProduct(payload)).data);
export const updateAdminProduct = createAsyncThunk('ops/updateProduct', async (payload: { id: string; data: Partial<Product> }) => (await adminOpsApi.updateProduct(payload.id, payload.data)).data);
export const fetchInventory = createAsyncThunk('ops/inventory', async () => (await adminOpsApi.inventory()).data.data);
export const fetchStaff = createAsyncThunk('ops/staff', async () => (await adminOpsApi.staff()).data.data);
export const fetchCustomers = createAsyncThunk('ops/customers', async () => (await adminOpsApi.customers()).data.data);
export const fetchCoupons = createAsyncThunk('ops/coupons', async () => (await adminOpsApi.coupons()).data.data);
export const fetchReports = createAsyncThunk('ops/reports', async () => (await adminOpsApi.reports()).data);
export const createStaffMember = createAsyncThunk(
  'ops/createStaff',
  async (payload: { fullName: string; email: string; phone: string; password: string; permissions?: string[] }) =>
    (await adminOpsApi.createStaff(payload)).data
);
export const createCouponOffer = createAsyncThunk(
  'ops/createCoupon',
  async (payload: Partial<Coupon>) => (await adminOpsApi.createCoupon(payload)).data
);
export const adminUpdateOrderStatus = createAsyncThunk(
  'ops/updateOrderStatus',
  async (payload: { orderId: string; status: string }) => (await adminOpsApi.updateOrderStatus(payload.orderId, payload.status)).data
);

const opsSlice = createSlice({
  name: 'ops',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.orders = action.payload.length > 0 ? action.payload : demoOrders;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.products = action.payload.length > 0 ? action.payload : demoProducts;
      })
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        state.products = state.products.map((product) => (product._id === action.payload._id ? action.payload : product));
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.inventory = action.payload.length > 0 ? action.payload : demoInventory;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.staff = action.payload;
      })
      .addCase(createStaffMember.fulfilled, (state, action) => {
        state.staff.unshift(action.payload);
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.coupons = action.payload;
      })
      .addCase(createCouponOffer.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload);
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reports = action.payload;
      })
      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map((order) => (order._id === action.payload._id ? action.payload : order));
      })
      .addMatcher(
        (action) => action.type.startsWith('ops/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('ops/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.status = 'success';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('ops/') && action.type.endsWith('/rejected'),
        (state) => {
          state.status = 'error';
        }
      );
  }
});

export default opsSlice.reducer;
