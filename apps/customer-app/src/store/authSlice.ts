import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@bambam/shared';
import { authApi } from '../api/services';
import { setAuthToken } from '../api/client';
import { storage } from '../utils/storage';

interface AuthState {
  token?: string;
  user?: UserProfile;
  pushToken?: string;
  // 'bootstrapping' = silent token restore on cold start (no UI loading spinner)
  status: 'idle' | 'bootstrapping' | 'loading' | 'authenticated' | 'error';
  error?: string;
}

const initialState: AuthState = {
  // Start in bootstrapping so the splash guard renders until we know auth state
  status: 'bootstrapping'
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

export const loginWithOtp = createAsyncThunk('auth/loginWithOtp', async (payload: { phone: string; fullName?: string }) => {
  const response = await authApi.otp(payload.phone, payload.fullName);
  return response.data;
});

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (payload: { email: string; fullName: string; googleId: string }) => {
    const response = await authApi.google(payload);
    return response.data;
  }
);

export const addCustomerAddress = createAsyncThunk('auth/addAddress', async (payload: UserProfile['addresses'][number]) => {
  const response = await authApi.addAddress(payload);
  return response.data.user;
});

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const token = await storage.getToken();
  if (!token) {
    return null;
  }
  setAuthToken(token);
  const response = await authApi.me();
  return { token, user: response.data.user };
});

// Standalone thunk so logout can deregister the push token before clearing state
export const logoutCustomer = createAsyncThunk<void, string | undefined>(
  'auth/logout',
  async (pushToken, { dispatch }) => {
    if (pushToken) {
      try {
        await authApi.deregisterPushToken(pushToken);
      } catch {
        // best-effort — proceed with logout regardless
      }
    }
    try {
      await storage.clearToken();
    } catch {
      // best-effort
    }
    setAuthToken(undefined);
    dispatch(authSlice.actions._clearState());
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Internal action used only by logoutCustomer thunk
    _clearState(state) {
      state.token = undefined;
      state.user = undefined;
      state.pushToken = undefined;
      state.status = 'idle';
      state.error = undefined;
    },
    setPushToken(state, action: PayloadAction<string>) {
      state.pushToken = action.payload;
    },
    hydrateAuth(state, action: PayloadAction<{ token: string; user: UserProfile }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = 'authenticated';
    }
  },
  extraReducers: (builder) => {
    const fulfilled = (state: AuthState, action: PayloadAction<{ accessToken?: string; token?: string; user: UserProfile }>) => {
      // Backend may return either accessToken or token depending on endpoint
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
      // All interactive login/signup thunks show a loading state
      .addCase(loginCustomer.pending, (state) => { state.status = 'loading'; state.error = undefined; })
      .addCase(signupCustomer.pending, (state) => { state.status = 'loading'; state.error = undefined; })
      .addCase(loginWithOtp.pending, (state) => { state.status = 'loading'; state.error = undefined; })
      .addCase(loginWithGoogle.pending, (state) => { state.status = 'loading'; state.error = undefined; })
      .addCase(loginCustomer.fulfilled, fulfilled)
      .addCase(signupCustomer.fulfilled, fulfilled)
      .addCase(loginWithOtp.fulfilled, fulfilled)
      .addCase(loginWithGoogle.fulfilled, fulfilled)
      .addCase(addCustomerAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user = action.payload;
        }
      })
      // Bootstrap: silent restore, stays in 'bootstrapping' until resolved
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        if (!action.payload) {
          state.status = 'idle';
          return;
        }
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.status = 'authenticated';
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        // Token was invalid — treat as logged-out
        state.status = 'idle';
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('auth/') &&
          action.type.endsWith('/rejected') &&
          action.type !== 'auth/bootstrap/rejected',
        (state, action: PayloadAction<unknown, string, unknown, Error>) => {
          state.status = 'error';
          state.error = action.error?.message ?? 'Something went wrong. Please try again.';
        }
      );
  }
});

export const { hydrateAuth, setPushToken } = authSlice.actions;
export default authSlice.reducer;
