import { setCookie, getCookie, deleteCookie } from './cookie';
import { TIngredient, TOrder, TOrdersData, TUser } from './types';

const URL = process.env.BURGER_API_URL || '/api';

// Utility function to clear all authentication tokens
export const clearAuthTokens = () => {
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
  console.log('Auth tokens cleared');
};

// Utility function to check if tokens exist and are valid
export const checkTokenValidity = () => {
  const accessToken = getCookie('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenLength: accessToken?.length || 0,
    refreshTokenLength: refreshToken?.length || 0
  };
};

// Debug function to check token status
export const debugTokens = () => {
  const accessToken = getCookie('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  console.log('=== Token Debug Info ===');
  console.log('Access Token exists:', !!accessToken);
  console.log('Refresh Token exists:', !!refreshToken);

  if (accessToken) {
    console.log('Access Token length:', accessToken.length);
    console.log('Access Token preview:', accessToken.substring(0, 20) + '...');
    console.log('Access Token valid JWT:', isValidJWT(accessToken));
  }

  if (refreshToken) {
    console.log('Refresh Token length:', refreshToken.length);
    console.log(
      'Refresh Token preview:',
      refreshToken.substring(0, 20) + '...'
    );
    console.log('Refresh Token valid JWT:', isValidJWT(refreshToken));
  }

  console.log('========================');
};

// Utility function to validate JWT token format
export const isValidJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    console.warn('JWT validation: token is empty or not a string');
    return false;
  }

  // JWT tokens should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn('JWT validation: token does not have 3 parts', {
      parts: parts.length
    });
    return false;
  }

  // Check that each part exists and is not empty
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i] || parts[i].trim() === '') {
      console.warn(`JWT validation: part ${i} is empty`);
      return false;
    }
  }

  // Basic format check - parts should contain only base64 characters
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  for (let i = 0; i < parts.length; i++) {
    if (!base64Regex.test(parts[i])) {
      console.warn(`JWT validation: part ${i} contains invalid characters`);
      return false;
    }
  }

  return true;
};

const checkResponse = <T>(res: Response): Promise<T> => {
  if (res.ok) {
    return res.json();
  }

  return res.json().then((err) => {
    // Log JWT errors for debugging
    if (err.message === 'jwt malformed' || err.message === 'jwt expired') {
      console.warn('JWT Error:', err.message, 'Status:', res.status);
      // Автоматически очищаем токены при JWT ошибках
      clearAuthTokens();
    }
    return Promise.reject(err);
  });
};

type TServerResponse<T> = {
  success: boolean;
} & T;

type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

export const refreshToken = (): Promise<TRefreshResponse> => {
  const refreshTokenValue = localStorage.getItem('refreshToken');

  if (!refreshTokenValue) {
    return Promise.reject(new Error('No refresh token'));
  }

  return fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: refreshTokenValue
    })
  })
    .then((res) => checkResponse<TRefreshResponse>(res))
    .then((refreshData) => {
      if (!refreshData.success) {
        return Promise.reject(refreshData);
      }
      localStorage.setItem('refreshToken', refreshData.refreshToken);
      setCookie('accessToken', refreshData.accessToken, { expires: 1200 }); // 20 минут
      return refreshData;
    })
    .catch((error) => {
      // If refresh fails, clear tokens
      clearAuthTokens();
      return Promise.reject(error);
    });
};

export const fetchWithRefresh = async <T>(
  url: RequestInfo,
  options: RequestInit
) => {
  try {
    const res = await fetch(url, options);
    return await checkResponse<T>(res);
  } catch (err) {
    // Проверяем, что это ошибка сети или CORS
    if (err instanceof TypeError) {
      // Это ошибка сети или CORS, не пытаемся обновлять токен
      return Promise.reject(err);
    }

    // Проверяем JWT ошибки
    if (
      (err as { message: string }).message === 'jwt expired' ||
      (err as { message: string }).message === 'jwt malformed'
    ) {
      try {
        console.log('JWT error detected, attempting token refresh...');
        const refreshData = await refreshToken();
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            authorization: `Bearer ${refreshData.accessToken}`
          } as HeadersInit
        };
        const res = await fetch(url, newOptions);
        return await checkResponse<T>(res);
      } catch (refreshError) {
        // Если обновление токена не удалось, очищаем все токены
        console.warn('Token refresh failed, clearing tokens');
        clearAuthTokens();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
};

type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

type TFeedsResponse = TServerResponse<{
  orders: TOrder[];
  total: number;
  totalToday: number;
}>;

type TOrdersResponse = TServerResponse<{
  data: TOrder[];
}>;

export const getIngredientsApi = () =>
  fetch(`${URL}/ingredients`)
    .then((res) => checkResponse<TIngredientsResponse>(res))
    .then((data) => {
      if (data?.success) return data.data;
      return Promise.reject(data);
    });

export const getFeedsApi = () =>
  fetch(`${URL}/orders/all`)
    .then((res) => checkResponse<TFeedsResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

export const getOrdersApi = () => {
  const accessToken = getCookie('accessToken');

  if (!accessToken) {
    return Promise.reject(new Error('No access token'));
  }

  return fetchWithRefresh<TFeedsResponse>(`${URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: `Bearer ${accessToken}`
    } as HeadersInit
  }).then((data) => {
    if (data?.success) return data.orders;
    return Promise.reject(data);
  });
};

type TNewOrderResponse = TServerResponse<{
  order: TOrder;
  name: string;
}>;

export const orderBurgerApi = (data: string[]) => {
  const accessToken = getCookie('accessToken');

  // Only check if token exists, let the server handle validation
  if (!accessToken) {
    console.warn('orderBurgerApi: No access token available');
    clearAuthTokens();
    return Promise.reject(new Error('No access token'));
  }

  return fetchWithRefresh<TNewOrderResponse>(`${URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: `Bearer ${accessToken}`
    } as HeadersInit,
    body: JSON.stringify({
      ingredients: data
    })
  }).then((data) => {
    if (data?.success) return data;
    return Promise.reject(data);
  });
};

type TOrderResponse = TServerResponse<{
  orders: TOrder[];
}>;

export const getOrderByNumberApi = (number: number) =>
  fetch(`${URL}/orders/${number}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => checkResponse<TOrderResponse>(res));

export type TRegisterData = {
  email: string;
  name: string;
  password: string;
};

type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: TUser;
}>;

export const registerUserApi = (data: TRegisterData) =>
  fetch(`${URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

export type TLoginData = {
  email: string;
  password: string;
};

export const loginUserApi = (data: TLoginData) =>
  fetch(`${URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

export const forgotPasswordApi = (data: { email: string }) =>
  fetch(`${URL}/password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

export const resetPasswordApi = (data: { password: string; token: string }) =>
  fetch(`${URL}/password-reset/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

type TUserResponse = TServerResponse<{ user: TUser }>;

export const getUserApi = () => {
  const accessToken = getCookie('accessToken');
  const refreshTokenValue = localStorage.getItem('refreshToken');

  // Debug tokens if needed
  if (process.env.NODE_ENV === 'development') {
    debugTokens();
  }

  if (!accessToken && !refreshTokenValue) {
    console.warn('getUserApi: No tokens available');
    return Promise.reject(new Error('No access token'));
  }

  if (!accessToken && refreshTokenValue) {
    // If no access token but refresh token exists, try to refresh first
    console.log('getUserApi: No access token, attempting refresh');
    return refreshToken()
      .then(() => {
        const newAccessToken = getCookie('accessToken');
        if (!newAccessToken) {
          return Promise.reject(new Error('Failed to refresh token'));
        }
        return fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
          headers: {
            authorization: `Bearer ${newAccessToken}`
          } as HeadersInit
        });
      })
      .catch((error) => {
        // If refresh fails, clear tokens and reject
        console.warn('getUserApi: Refresh failed, clearing tokens');
        clearAuthTokens();
        return Promise.reject(error);
      });
  }

  // Use existing access token
  console.log('getUserApi: Using existing access token');
  return fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    headers: {
      authorization: `Bearer ${accessToken}`
    } as HeadersInit
  });
};

export const updateUserApi = (user: Partial<TRegisterData>) =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: `Bearer ${getCookie('accessToken')}`
    } as HeadersInit,
    body: JSON.stringify(user)
  });

export const logoutApi = () =>
  fetch(`${URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  }).then((res) => checkResponse<TServerResponse<{}>>(res));

// Force logout and redirect to login
export const forceLogout = () => {
  clearAuthTokens();
  // Redirect to login page
  window.location.href = '/login';
};

// Utility function to clear tokens from browser console
export const clearTokensFromConsole = () => {
  console.log('Clearing all auth tokens...');
  clearAuthTokens();
  console.log('Tokens cleared. Please refresh the page and login again.');
};
