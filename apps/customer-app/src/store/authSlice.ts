import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address, UserProfile } from '@bambam/shared';
import { authApi } from '../api/services';
import { setAuthToken } from '../api/client';
import { storage } from '../utils/storage';

interface AuthState {
  token?: string;
  user?: UserProfile;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error?: string;
}

const initialState: AuthState = {
  status: 'idle'
};

export const loginCustomer = createAsyncThunk('auth/loginCustomer', async (payload: { identifier: string; password: string }) => {
  const response = await authApi.login(payload.identifier, payload.password);
  return response.data;
});

export const signupCustomer = createAsyncThunk(
  'auth/signupCustomer',
  async (payload: { fullName: string; email: string; phone: string; password: string }) => {
    const response = await authApi.signup(payload);
    return response.data;
  }
);

// Step 1: ask the backend to send an OTP to the phone. Returns the backend
// payload (which includes devCode when running without an SMS provider).
export const requestOtp = createAsyncThunk('auth/requestOtp', async (payload: { phone: string; fullName?: string }) => {
  const response = await authApi.requestOtp(payload.phone, payload.fullName);
  return response.data;
});

// Step 2: verify the entered OTP; on success this logs the user in.
export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (payload: { phone: string; code: string }) => {
  const response = await authApi.verifyOtp(payload.phone, payload.code);
  return response.data;
});

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (payload: { email: string; fullName: string; googleId: string }) => {
    const response = await authApi.google(payload);
    return response.data;
  }
);

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const token = await storage.getToken();
  if (!token) {
    return null;
  }
  setAuthToken(token);
  const response = await authApi.me();
  return { token, user: response.data.user };
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = undefined;
      state.user = undefined;
      state.status = 'idle';
      state.error = undefined;
      setAuthToken(undefined);
      void storage.clearToken();
    },
    hydrateAuth(state, action: PayloadAction<{ token: string; user: UserProfile }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = 'authenticated';
    },
    // Add or update a delivery address. When `index` is provided the address at
    // that position is replaced, otherwise the address is updated in place at 0
    // (or appended if the user has none yet). Used by the checkout screen so the
    // customer can edit their delivery address before placing an order.
    saveAddress(state, action: PayloadAction<{ address: Address; index?: number }>) {
      if (!state.user) {
        return;
      }
      const { address, index } = action.payload;
      const addresses = state.user.addresses ?? [];
      const target = index ?? 0;
      if (addresses[target]) {
        addresses[target] = address;
      } else {
        addresses.push(address);
      }
      state.user.addresses = addresses;
    }
  },
  extraReducers: (builder) => {
    const fulfilled = (state: AuthState, action: PayloadAction<{ accessToken?: string; token?: string; user: UserProfile }>) => {
      const token = action.payload.accessToken ?? action.payload.token ?? state.token;
      state.token = token;
      state.user = action.payload.user;
      state.status = 'authenticated';
      state.error = undefined;
      if (token) {
        setAuthToken(token);
        void storage.setToken(token);
      }
    };

    builder
      .addCase(loginCustomer.fulfilled, fulfilled)
      // Signup intentionally does NOT auto-login. The account is created, then
      // the user is sent to the login screen to sign in with their credentials.
      .addCase(signupCustomer.fulfilled, (state) => {
        state.status = 'idle';
        state.error = undefined;
      })
      .addCase(verifyOtp.fulfilled, fulfilled)
      .addCase(loginWithGoogle.fulfilled, fulfilled)
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        if (!action.payload) {
          state.status = 'idle';
          return;
        }
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.status = 'authenticated';
      })
      // Any auth login/signup/verify pending -> loading.
      .addMatcher(
        (action) =>
          [loginCustomer.pending.type, signupCustomer.pending.type, verifyOtp.pending.type, loginWithGoogle.pending.type].includes(
            action.type
          ),
        (state) => {
          state.status = 'loading';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state, action: PayloadAction<unknown, string, unknown, Error>) => {
          state.status = 'error';
          state.error = action.error.message;
        }
      );
  }
});

export const { logout, hydrateAuth, saveAddress } = authSlice.actions;
export default authSlice.reducer;
