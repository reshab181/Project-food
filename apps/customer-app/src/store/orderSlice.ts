import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { NotificationPayload, Order, demoOrders } from '@bambam/shared';
import { notificationApi, orderApi, PlaceOrderPayload } from '../api/services';

interface OrderState {
  orders: Order[];
  notifications: NotificationPayload[];
  // Distinct statuses so concurrent fetches don't stomp each other
  status: 'idle' | 'loading' | 'placing' | 'success' | 'error';
}

const initialState: OrderState = {
  orders: demoOrders,
  notifications: [],
  status: 'idle'
};

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  const response = await orderApi.list();
  return response.data.data;
});

export const placeOrder = createAsyncThunk('orders/placeOrder', async (payload: PlaceOrderPayload) => {
  const response = await orderApi.place(payload);
  return response.data;
});

export const fetchNotifications = createAsyncThunk('orders/fetchNotifications', async () => {
  const response = await notificationApi.list();
  return response.data.data;
});

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload.length > 0 ? action.payload : demoOrders;
        state.status = 'success';
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.status = 'error';
      })
      // placeOrder gets its own 'placing' status so the checkout button can
      // show a spinner independently of background fetchOrders calls
      .addCase(placeOrder.pending, (state) => {
        state.status = 'placing';
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
        state.status = 'success';
      })
      .addCase(placeOrder.rejected, (state) => {
        state.status = 'error';
      })
      .addCase(fetchNotifications.pending, (state) => {
        // Don't overwrite 'placing' — notifications load silently in the background
        if (state.status === 'idle' || state.status === 'success') {
          state.status = 'loading';
        }
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        if (state.status === 'loading') {
          state.status = 'success';
        }
      })
      .addCase(fetchNotifications.rejected, (state) => {
        if (state.status === 'loading') {
          state.status = 'error';
        }
      });
  }
});

export default orderSlice.reducer;
