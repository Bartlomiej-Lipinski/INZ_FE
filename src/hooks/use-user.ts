import { useState } from 'react';

interface UseUserResult {
  getUser: (userId: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
  setErrorMessage: (message: string) => void;
}

export function useUser(): UseUserResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUser = async (userId: string): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data: any = await response.json();

      if (response.ok && data.success) {
        return data;
      } else if (response.status === 401) {
        console.log('Get user error:', response);
        setError("Nie jesteś zalogowany lub sesja wygasła");
        return { success: false };
      } else if (response.status === 403) {
        console.log('Get user error:', response);
        setError("Nie masz uprawnień do przeglądania tych danych");
        return { success: false };
      } else {
        setError("Wystąpił błąd podczas pobierania danych użytkownika");
        return { success: false };
      }
    } catch (error: any) {
      console.error('Get user error:', error);
      setError("Wystąpił błąd połączenia");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const setErrorMessage = (message: string) => {
    setError(message);
  };

  return { getUser, isLoading, error, setErrorMessage };
}


