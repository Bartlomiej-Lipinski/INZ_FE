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

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
}

async function removeVercelJwtAndWait() {
  deleteCookie('_vercel_jwt');

  await new Promise(resolve => setTimeout(resolve, 50));

  let attempts = 0;
  while (getCookie('_vercel_jwt') !== null && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 10));
    attempts++;
  }
}

function restoreVercelJwt(token: string | null) {
  if (token && typeof document !== 'undefined') {
    document.cookie = `_vercel_jwt=${token}; path=/;`;
  }
}

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

async function refreshAccessToken(): Promise<{ success: boolean; noRefreshToken?: boolean }> {
  try {
    const vercelJwt = getCookie('_vercel_jwt');
    await removeVercelJwtAndWait();

    const response = await fetch(API_ROUTES.REFRESH, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    restoreVercelJwt(vercelJwt);

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
  const vercelJwt = getCookie('_vercel_jwt');
  await removeVercelJwtAndWait();

  const requestOptions: RequestInit = {
    ...options,
    method: options.method,
    credentials: 'include',
    headers: {
      ...options.headers,
      ...(options.body instanceof FormData
              ? {}
              : {'Content-Type': 'application/json'}
      ),
    },
  };

  let response = await fetch(url, requestOptions);
  restoreVercelJwt(vercelJwt);

  if (response.ok) {
    return response;
  }

  if (response.status === 401 || response.status === 403 || response.status === 500) {
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: async () => {
            const vJwt = getCookie('_vercel_jwt');
            await removeVercelJwtAndWait();
            try {
              const res = await fetch(url, requestOptions);
              restoreVercelJwt(vJwt);
              resolve(res);
            } catch (e) {
              restoreVercelJwt(vJwt);
              reject(e);
            }
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

        const vJwt = getCookie('_vercel_jwt');
        await removeVercelJwtAndWait();
        response = await fetch(url, requestOptions);
        restoreVercelJwt(vJwt);

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