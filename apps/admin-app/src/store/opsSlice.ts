import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  Coupon,
  DashboardSummary,
  InventoryItem,
  Order,
  Product,
  UserProfile,
  demoDashboard,
  demoInventory,
  demoOrders,
  demoProducts
} from '@bambam/shared';
import { adminOpsApi } from '../api/services';

// Per-operation loading flags replace the single shared `status` field.
// Previously one boolean covered all thunks, so concurrent dispatches
// (e.g. dashboard load triggering orders + products + inventory in parallel)
// produced non-deterministic loading state as each thunk overwrote the flag.
interface LoadingFlags {
  dashboard: boolean;
  orders: boolean;
  products: boolean;
  inventory: boolean;
  staff: boolean;
  customers: boolean;
  coupons: boolean;
  reports: boolean;
  // mutation flags
  creatingProduct: boolean;
  updatingProduct: boolean;
  creatingStaff: boolean;
  creatingCoupon: boolean;
  updatingOrderStatus: boolean;
}

interface OpsState {
  dashboard: DashboardSummary;
  orders: Order[];
  products: Product[];
  inventory: InventoryItem[];
  staff: UserProfile[];
  customers: UserProfile[];
  coupons: Coupon[];
  reports: Record<string, unknown>;
  loading: LoadingFlags;
  // Last error message (if any) for UI display
  error?: string;
}

const initialLoading: LoadingFlags = {
  dashboard: false,
  orders: false,
  products: false,
  inventory: false,
  staff: false,
  customers: false,
  coupons: false,
  reports: false,
  creatingProduct: false,
  updatingProduct: false,
  creatingStaff: false,
  creatingCoupon: false,
  updatingOrderStatus: false
};

const initialState: OpsState = {
  dashboard: demoDashboard,
  orders: demoOrders,
  products: demoProducts,
  inventory: demoInventory,
  staff: [],
  customers: [],
  coupons: [],
  reports: {},
  loading: initialLoading
};

// ── Thunks ──────────────────────────────────────────────────────────────────

export const fetchAdminDashboard = createAsyncThunk(
  'ops/dashboard',
  async () => (await adminOpsApi.dashboard()).data
);
export const fetchAdminOrders = createAsyncThunk(
  'ops/orders',
  async () => (await adminOpsApi.orders()).data.data
);
export const fetchAdminProducts = createAsyncThunk(
  'ops/products',
  async () => (await adminOpsApi.products()).data.data
);
export const createAdminProduct = createAsyncThunk(
  'ops/createProduct',
  async (payload: Partial<Product>) => (await adminOpsApi.createProduct(payload)).data
);
export const updateAdminProduct = createAsyncThunk(
  'ops/updateProduct',
  async (payload: { id: string; data: Partial<Product> }) =>
    (await adminOpsApi.updateProduct(payload.id, payload.data)).data
);
export const fetchInventory = createAsyncThunk(
  'ops/inventory',
  async () => (await adminOpsApi.inventory()).data.data
);
export const fetchStaff = createAsyncThunk(
  'ops/staff',
  async () => (await adminOpsApi.staff()).data.data
);
export const fetchCustomers = createAsyncThunk(
  'ops/customers',
  async () => (await adminOpsApi.customers()).data.data
);
export const fetchCoupons = createAsyncThunk(
  'ops/coupons',
  async () => (await adminOpsApi.coupons()).data.data
);
export const fetchReports = createAsyncThunk(
  'ops/reports',
  async () => (await adminOpsApi.reports()).data
);
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
  async (payload: { orderId: string; status: string }) =>
    (await adminOpsApi.updateOrderStatus(payload.orderId, payload.status)).data
);

// ── Slice ────────────────────────────────────────────────────────────────────

const opsSlice = createSlice({
  name: 'ops',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── Dashboard ──────────────────────────────────────────────────────────
      .addCase(fetchAdminDashboard.pending, (state) => { state.loading.dashboard = true; state.error = undefined; })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => { state.dashboard = action.payload; state.loading.dashboard = false; })
      .addCase(fetchAdminDashboard.rejected, (state, action) => { state.loading.dashboard = false; state.error = action.error.message; })

      // ── Orders ────────────────────────────────────────────────────────────
      .addCase(fetchAdminOrders.pending, (state) => { state.loading.orders = true; state.error = undefined; })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.orders = action.payload.length > 0 ? action.payload : demoOrders;
        state.loading.orders = false;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => { state.loading.orders = false; state.error = action.error.message; })

      .addCase(adminUpdateOrderStatus.pending, (state) => { state.loading.updatingOrderStatus = true; state.error = undefined; })
      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
        state.loading.updatingOrderStatus = false;
      })
      .addCase(adminUpdateOrderStatus.rejected, (state, action) => {
        state.loading.updatingOrderStatus = false;
        state.error = action.error.message;
      })

      // ── Products ──────────────────────────────────────────────────────────
      .addCase(fetchAdminProducts.pending, (state) => { state.loading.products = true; state.error = undefined; })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.products = action.payload.length > 0 ? action.payload : demoProducts;
        state.loading.products = false;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => { state.loading.products = false; state.error = action.error.message; })

      .addCase(createAdminProduct.pending, (state) => { state.loading.creatingProduct = true; state.error = undefined; })
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        state.loading.creatingProduct = false;
      })
      .addCase(createAdminProduct.rejected, (state, action) => {
        state.loading.creatingProduct = false;
        state.error = action.error.message;
      })

      .addCase(updateAdminProduct.pending, (state) => { state.loading.updatingProduct = true; state.error = undefined; })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        state.products = state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );
        state.loading.updatingProduct = false;
      })
      .addCase(updateAdminProduct.rejected, (state, action) => {
        state.loading.updatingProduct = false;
        state.error = action.error.message;
      })

      // ── Inventory ─────────────────────────────────────────────────────────
      .addCase(fetchInventory.pending, (state) => { state.loading.inventory = true; state.error = undefined; })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.inventory = action.payload.length > 0 ? action.payload : demoInventory;
        state.loading.inventory = false;
      })
      .addCase(fetchInventory.rejected, (state, action) => { state.loading.inventory = false; state.error = action.error.message; })

      // ── Staff ─────────────────────────────────────────────────────────────
      .addCase(fetchStaff.pending, (state) => { state.loading.staff = true; state.error = undefined; })
      .addCase(fetchStaff.fulfilled, (state, action) => { state.staff = action.payload; state.loading.staff = false; })
      .addCase(fetchStaff.rejected, (state, action) => { state.loading.staff = false; state.error = action.error.message; })

      .addCase(createStaffMember.pending, (state) => { state.loading.creatingStaff = true; state.error = undefined; })
      .addCase(createStaffMember.fulfilled, (state, action) => {
        state.staff.unshift(action.payload);
        state.loading.creatingStaff = false;
      })
      .addCase(createStaffMember.rejected, (state, action) => {
        state.loading.creatingStaff = false;
        state.error = action.error.message;
      })

      // ── Customers ─────────────────────────────────────────────────────────
      .addCase(fetchCustomers.pending, (state) => { state.loading.customers = true; state.error = undefined; })
      .addCase(fetchCustomers.fulfilled, (state, action) => { state.customers = action.payload; state.loading.customers = false; })
      .addCase(fetchCustomers.rejected, (state, action) => { state.loading.customers = false; state.error = action.error.message; })

      // ── Coupons ───────────────────────────────────────────────────────────
      .addCase(fetchCoupons.pending, (state) => { state.loading.coupons = true; state.error = undefined; })
      .addCase(fetchCoupons.fulfilled, (state, action) => { state.coupons = action.payload; state.loading.coupons = false; })
      .addCase(fetchCoupons.rejected, (state, action) => { state.loading.coupons = false; state.error = action.error.message; })

      .addCase(createCouponOffer.pending, (state) => { state.loading.creatingCoupon = true; state.error = undefined; })
      .addCase(createCouponOffer.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload);
        state.loading.creatingCoupon = false;
      })
      .addCase(createCouponOffer.rejected, (state, action) => {
        state.loading.creatingCoupon = false;
        state.error = action.error.message;
      })

      // ── Reports ───────────────────────────────────────────────────────────
      .addCase(fetchReports.pending, (state) => { state.loading.reports = true; state.error = undefined; })
      .addCase(fetchReports.fulfilled, (state, action) => { state.reports = action.payload; state.loading.reports = false; })
      .addCase(fetchReports.rejected, (state, action) => { state.loading.reports = false; state.error = action.error.message; });
  }
});

export default opsSlice.reducer;
