import {API_ROUTES} from "./api-routes-endpoints";

let isRefreshing = false;
let refreshPromise: Promise<{ success: boolean; noRefreshToken?: boolean }> | null = null;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];
let logoutCallback: (() => void) | null = null;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

async function refreshAccessToken(): Promise<{ success: boolean; noRefreshToken?: boolean }> {
  try {
    const refreshToken = getCookie('refresh_token');

    if (!refreshToken) {
      return {success: false, noRefreshToken: true};
    }

    const response = await fetch(API_ROUTES.REFRESH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      if (response.status === 401) {
        try {
          const data = await response.json();
          if (data.message === 'No refresh token') {
            return { success: false, noRefreshToken: true };
          }
        } catch {
          return { success: false, noRefreshToken: true };
        }
      }
      console.warn('Refresh token failed:', response.status, response.statusText);
      return { success: false };
    }
  } catch (error) {
    console.error('Błąd podczas odświeżania tokena:', error);
    return { success: false };
  }
}

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });

  failedQueue = [];
}

export async function fetchWithAuth(
    url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getCookie('access_token');

  const requestOptions: RequestInit = {
    ...options,
    method: options.method,
    headers: {
      ...options.headers,
      ...(options.body instanceof FormData
              ? {}
              : {'Content-Type': 'application/json'}
      ),
      ...(accessToken ? {'Authorization': `Bearer ${accessToken}`} : {}),
    },
  };

  let response = await fetch(url, requestOptions);

  if (response.ok) {
    return response;
  }

  if (response.status === 401 || response.status === 403 || response.status === 500) {
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: () => {
            const newAccessToken = getCookie('access_token');
            const retryOptions = {
              ...requestOptions,
              headers: {
                ...requestOptions.headers,
                ...(newAccessToken ? {'Authorization': `Bearer ${newAccessToken}`} : {}),
              },
            };
            fetch(url, retryOptions).then(resolve).catch(reject);
          },
          reject
        });
      });
    }

    isRefreshing = true;
    refreshPromise = refreshAccessToken();

    try {
      const result = await refreshPromise;

      if (result.noRefreshToken) {
        if (logoutCallback) {
          logoutCallback();
        }

        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }

        processQueue(new Error('Brak refresh token - sesja wygasła'));
        return response;
      }

      if (result.success) {
        processQueue(null);

        const newAccessToken = getCookie('access_token');
        const retryOptions = {
          ...requestOptions,
          headers: {
            ...requestOptions.headers,
            ...(newAccessToken ? {'Authorization': `Bearer ${newAccessToken}`} : {}),
          },
        };

        response = await fetch(url, retryOptions);
        return response;
      } else {
        processQueue(new Error('Nie udało się odświeżyć tokena'));
      }
    } catch (error) {
      processQueue(error);
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }

  return response;
}