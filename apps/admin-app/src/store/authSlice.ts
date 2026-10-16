import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { UserProfile } from '@bambam/shared';
import { setAdminAuthToken } from '../api/client';
import { adminAuthApi } from '../api/services';

interface AdminAuthState {
  token?: string;
  user?: UserProfile;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
}

const initialState: AdminAuthState = {
  status: 'idle'
};

export const loginAdmin = createAsyncThunk('adminAuth/login', async (payload: { identifier: string; password: string }) => {
  const response = await adminAuthApi.login(payload.identifier, payload.password);
  if (!['super_admin', 'staff'].includes(response.data.user.role)) {
    throw new Error('Only super admin and staff accounts can access the management app.');
  }
  return response.data;
});

const authSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    logoutAdmin(state) {
      state.token = undefined;
      state.user = undefined;
      state.status = 'idle';
      setAdminAuthToken(undefined);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
        state.status = 'authenticated';
        setAdminAuthToken(action.payload.accessToken);
      })
      .addMatcher(
        (action) => action.type.startsWith('adminAuth/') && action.type.endsWith('/rejected'),
        (state) => {
          state.status = 'error';
        }
      );
  }
});

export const { logoutAdmin } = authSlice.actions;
export default authSlice.reducer;
