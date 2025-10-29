import { API_ROUTES } from "./api-routes-endpoints";

let isRefreshing = false;
let refreshPromise: Promise<{ success: boolean; noRefreshToken?: boolean }> | null = null;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];
let logoutCallback: (() => void) | null = null;


export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}


//do odświeżania tokena dostępu
async function refreshAccessToken(): Promise<{ success: boolean; noRefreshToken?: boolean }> {
  try {
    const response = await fetch(API_ROUTES.REFRESH, {
      method: 'POST',
      credentials: 'include',
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

//do przetwarzania kolejki nieudanych żądań
function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(null);
    }
  });
  
  failedQueue = [];
}


export async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const requestOptions: RequestInit = {
    ...options,
    method: options.method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };


  let response = await fetch(url, requestOptions);


  if (response.ok) {
    return response;
  }

  if (response.status === 401) {
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({ 
          resolve: (_token: string | null) => {
            fetch(url, requestOptions).then(resolve).catch(reject);
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
        
        response = await fetch(url, requestOptions);
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


