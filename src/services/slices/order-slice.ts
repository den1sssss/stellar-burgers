import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi, clearAuthTokens } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';
import { deleteCookie } from '../../utils/cookie';

interface OrderState {
  currentOrder: TOrder | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  currentOrder: null,
  loading: false,
  error: null
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (ingredients: string[], { rejectWithValue }) => {
    try {
      const response = await orderBurgerApi(ingredients);
      return response.order;
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
        (error as any)?.message || 'Failed to create order'
      );
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.currentOrder = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        // Не показываем ошибку, если это проблема аутентификации
        if (action.payload !== 'Authentication failed') {
          state.error = action.error.message || 'Failed to create order';
        }
      });
  }
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
