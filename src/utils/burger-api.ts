import { getCookie, setCookie } from './cookie';
import { TIngredient, TOrder, TOrdersData, TUser } from './types';

const URL = 'https://norma.nomoreparties.space/api';

const clearAuthTokens = () => {
  localStorage.removeItem('refreshToken');
  setCookie('accessToken', '', { expires: -1 });
};

const checkResponse = <T>(res: Response): Promise<T> => {
  if (res.ok) {
    return res.json();
  }

  return res.json().then((err) => Promise.reject(err));
};

type TServerResponse<T> = {
  success: boolean;
} & T;

type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

const refreshToken = () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token'));
  }

  return fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: refreshToken
    })
  })
    .then((res) => checkResponse<TRefreshResponse>(res))
    .then((refreshData) => {
      if (!refreshData.success) {
        return Promise.reject(refreshData);
      }
      localStorage.setItem('refreshToken', refreshData.refreshToken);
      setCookie(
        'accessToken',
        refreshData.accessToken.replace(/^Bearer /, ''),
        { expires: 1200 }
      );
      console.log('[REFRESH] accessToken:', refreshData.accessToken);
      console.log('[REFRESH] refreshToken:', refreshData.refreshToken);
      return refreshData;
    })
    .catch((error) => {
      clearAuthTokens();
      return Promise.reject(error);
    });
};

const fetchWithRefresh = async <T>(url: RequestInfo, options: RequestInit) => {
  try {
    const res = await fetch(url, options);
    return await checkResponse<T>(res);
  } catch (err) {
    if (err instanceof TypeError) {
      return Promise.reject(err);
    }

    if (
      (err as { message: string }).message === 'jwt expired' ||
      (err as { message: string }).message === 'jwt malformed'
    ) {
      try {
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

export const getIngredientsApi = (): Promise<TIngredient[]> =>
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

export const getOrdersApi = (): Promise<TOrder[]> => {
  const accessToken = getCookie('accessToken');

  if (!accessToken) {
    return Promise.reject(new Error('No access token'));
  }

  const makeRequest = (token: string): Promise<TOrder[]> =>
    fetchWithRefresh<TFeedsResponse>(`${URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        authorization: `Bearer ${token}`
      } as HeadersInit
    }).then((data) => {
      if (data?.success) return data.orders;
      return Promise.reject(data);
    });

  return makeRequest(accessToken);
};

type TNewOrderResponse = TServerResponse<{
  order: TOrder;
  name: string;
}>;

export const orderBurgerApi = (data: string[]) => {
  const accessToken = getCookie('accessToken');

  const makeOrderRequest = (token: string) =>
    fetchWithRefresh<TNewOrderResponse>(`${URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        authorization: `Bearer ${token}`
      } as HeadersInit,
      body: JSON.stringify({
        ingredients: data
      })
    }).then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

  if (!accessToken) {
    return Promise.reject(new Error('No access token'));
  }

  return makeOrderRequest(accessToken);
};

type TOrderResponse = TServerResponse<{
  orders: TOrder[];
}>;

export const getOrderByNumberApi = (number: number) =>
  fetch(`${URL}/orders/${number}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  })
    .then((res) => checkResponse<TOrderResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(data);
    });

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
      if (data?.success) {
        localStorage.setItem('refreshToken', data.refreshToken);
        setCookie('accessToken', data.accessToken, { expires: 1200 });
        return data;
      }
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
      if (!data.success) {
        return Promise.reject(data);
      }
      localStorage.setItem('refreshToken', data.refreshToken);
      setCookie('accessToken', data.accessToken.replace(/^Bearer /, ''), {
        expires: 1200
      });
      console.log('[LOGIN] accessToken:', data.accessToken);
      console.log('[LOGIN] refreshToken:', data.refreshToken);
      return data;
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

  if (!accessToken) {
    return Promise.reject(new Error('No access token'));
  }

  return fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: `Bearer ${accessToken}`
    } as HeadersInit
  }).then((data) => {
    if (data?.success) return data;
    return Promise.reject(data);
  });
};

export const updateUserApi = (user: Partial<TRegisterData>) =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(user)
  }).then((data) => {
    if (data?.success) return data;
    return Promise.reject(data);
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
  })
    .then((res) => checkResponse<TServerResponse<{}>>(res))
    .then((data) => {
      clearAuthTokens();
      return data;
    })
    .catch((error) => {
      clearAuthTokens();
      return Promise.reject(error);
    });

export const forceLogout = () => {
  clearAuthTokens();
};
