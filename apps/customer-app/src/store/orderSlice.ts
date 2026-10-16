import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { NotificationPayload, Order, demoOrders } from '@bambam/shared';
import { notificationApi, orderApi } from '../api/services';

interface OrderState {
  orders: Order[];
  notifications: NotificationPayload[];
  status: 'idle' | 'loading' | 'success' | 'error';
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

export const placeOrder = createAsyncThunk('orders/placeOrder', async (payload: Partial<Order>) => {
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
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
        state.status = 'success';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addMatcher(
        (action) => action.type.startsWith('orders/') && action.type.endsWith('/rejected'),
        (state) => {
          state.status = 'error';
        }
      );
  }
});

export default orderSlice.reducer;
