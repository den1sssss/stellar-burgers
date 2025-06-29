import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getFeedsApi,
  getOrdersApi,
  clearAuthTokens
} from '../../utils/burger-api';
import { TOrder } from '../../utils/types';
import { deleteCookie } from '../../utils/cookie';

interface FeedState {
  orders: TOrder[];
  userOrders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
}

const initialState: FeedState = {
  orders: [],
  userOrders: [],
  total: 0,
  totalToday: 0,
  loading: false,
  error: null
};

export const fetchFeeds = createAsyncThunk('feed/fetchFeeds', getFeedsApi);

export const fetchUserOrders = createAsyncThunk(
  'feed/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await getOrdersApi();
    } catch (error) {
      // Если ошибка связана с аутентификацией, очищаем токены
      if (
        (error as any)?.message === 'jwt expired' ||
        (error as any)?.message === 'jwt malformed' ||
        (error as any)?.message === 'Token is invalid' ||
        (error as any)?.message === 'You should be authorised' ||
        (error as any)?.message === 'No refresh token'
      ) {
        clearAuthTokens();
        return rejectWithValue('Authentication failed');
      }
      return rejectWithValue(
        (error as any)?.message || 'Failed to fetch user orders'
      );
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    updateOrders: (state, action) => {
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
    },
    updateUserOrders: (state, action) => {
      state.userOrders = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch public feeds
      .addCase(fetchFeeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        // Не показываем ошибку, если это проблема аутентификации
        if (action.payload !== 'Authentication failed') {
          state.error = action.error.message || 'Failed to fetch user orders';
        }
      });
  }
});

export const { updateOrders, updateUserOrders } = feedSlice.actions;
export default feedSlice.reducer;
