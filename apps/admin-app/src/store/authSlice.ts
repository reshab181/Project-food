import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { UserProfile } from '@bambam/shared';
import { setAdminAuthToken } from '../api/client';
import { adminAuthApi } from '../api/services';

const TOKEN_KEY = 'bam_bam_admin_token';

interface AdminAuthState {
  token?: string;
  user?: UserProfile;
  error?: string;
  // 'bootstrapping' = silent cold-start restore (no login screen flicker)
  status: 'idle' | 'bootstrapping' | 'loading' | 'authenticated' | 'error';
}

const initialState: AdminAuthState = {
  // Start bootstrapping so the splash guard shows while we check SecureStore
  status: 'bootstrapping'
};

export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async (payload: { identifier: string; password: string }) => {
    const response = await adminAuthApi.login(payload.identifier, payload.password);
    if (!['super_admin', 'staff'].includes(response.data.user.role)) {
      throw new Error('Only super admin and staff accounts can access the management app.');
    }
    return response.data;
  }
);

// Restore session from SecureStore on cold start
export const bootstrapAdminAuth = createAsyncThunk('adminAuth/bootstrap', async () => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) {
    return null;
  }
  setAdminAuthToken(token);
  // Verify token is still valid — re-use the same /auth/me endpoint
  const response = await adminAuthApi.me();
  return { token, user: response.data.user };
});

// Thunk so logout can clear SecureStore before wiping Redux state
export const logoutAdmin = createAsyncThunk('adminAuth/logout', async (_, { dispatch }) => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // best-effort
  }
  setAdminAuthToken(undefined);
  dispatch(authSlice.actions._clearState());
});

const authSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    _clearState(state) {
      state.token = undefined;
      state.user = undefined;
      state.status = 'idle';
      state.error = undefined;
    }
  },
  extraReducers: (builder) => {
    builder
      // ── Login ───────────────────────────────────────────────────────────────
      .addCase(loginAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
        state.status = 'authenticated';
        state.error = undefined;
        setAdminAuthToken(action.payload.accessToken);
        // Persist token for next cold start (fire-and-forget; SecureStore is sync-safe here)
        if (action.payload.accessToken) {
          void SecureStore.setItemAsync(TOKEN_KEY, action.payload.accessToken).catch(() => {
            // best-effort
          });
        }
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error?.message ?? 'Login failed. Please try again.';
      })
      // ── Bootstrap ───────────────────────────────────────────────────────────
      .addCase(bootstrapAdminAuth.fulfilled, (state, action) => {
        if (!action.payload) {
          state.status = 'idle';
          return;
        }
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.status = 'authenticated';
      })
      .addCase(bootstrapAdminAuth.rejected, (state) => {
        // Stored token was invalid — clear it and require re-login
        state.status = 'idle';
        void SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      });
  }
});

export default authSlice.reducer;
