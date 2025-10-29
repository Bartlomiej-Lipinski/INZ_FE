let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];


//Funkcja do odświeżania tokena dostępu

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      // Backend ustawia nowe cookies przez Set-Cookie; nie potrzebujemy tokena w body
      return true;
    } else {
      // Jeśli odświeżanie się nie powiodło, nie przekierowuj automatycznie
      console.warn('Refresh token failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Błąd podczas odświeżania tokena:', error);
    return false;
  }
}

//Funkcja do przetwarzania kolejki nieudanych żądań

function processQueue(error: any) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(null);
    }
  });
  
  failedQueue = [];
}


//Centralna funkcja do wykonywania autoryzowanych żądań HTTP
//Automatycznie obsługuje odświeżanie tokena w przypadku błędu 401

export async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Ustaw domyślne opcje
  const defaultOptions: RequestInit = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const requestOptions = { ...defaultOptions, ...options };


  let response = await fetch(url, requestOptions);

  // Jeśli żądanie się powiodło, zwróć odpowiedź
  if (response.ok) {
    return response;
  }

  // Jeśli otrzymano błąd 401 (Unauthorized)
  if (response.status === 401) {
    // Jeśli już trwa odświeżanie tokena, dodaj żądanie do kolejki
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({ 
          resolve: () => {
            // Po udanym refreshu po prostu ponawiamy żądanie; cookies są już zaktualizowane
            fetch(url, requestOptions).then(resolve).catch(reject);
          }, 
          reject 
        });
      });
    }

    // Rozpocznij proces odświeżania tokena
    isRefreshing = true;
    refreshPromise = refreshAccessToken();

    try {
      const refreshed = await refreshPromise;
      
      if (refreshed) {
        // Przetwórz kolejkę nieudanych żądań
        processQueue(null);
        
        // Ponów oryginalne żądanie (cookies już zawierają nowy token)
        response = await fetch(url, requestOptions);
        return response;
      } else {
        // Jeśli nie udało się odświeżyć tokena, przetwórz kolejkę z błędem
        processQueue(new Error('Nie udało się odświeżyć tokena'));
        throw new Error('Nie udało się odświeżyć tokena');
      }
    } catch (error) {
      // Przetwórz kolejkę z błędem
      processQueue(error);
      throw error;
    } finally {
      // Zakończ proces odświeżania
      isRefreshing = false;
      refreshPromise = null;
    }
  }

  // Jeśli to nie jest błąd 401, zwróć oryginalną odpowiedź
  return response;
}


