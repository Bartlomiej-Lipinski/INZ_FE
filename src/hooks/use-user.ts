"use client";

import { useState } from 'react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { API_ROUTES } from '@/lib/api/api-routes-endpoints';

interface ApiResponse {
  success: boolean;
  data?: UserData;
  message?: string;
}

interface UserData {
    id: string;
    email: string;
    username: string;
    name: string;
    surname: string;
    Birthday: string;
    status: string;
    description: string;
    photoUrl: string;
    isTwoFactorEnabled: boolean;
}


interface UseUserResult {
  getUser: (userId: string) => Promise<ApiResponse>;
  isLoading: boolean;
  error: string | null;
  setErrorMessage: (message: string) => void;
}

export function useUser(): UseUserResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUser = async (userId: string): Promise<ApiResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(`${API_ROUTES.USER_BY_ID}/${userId}`, {
        method: 'GET',
      });

      const data = await response.json() as { success: boolean; data?: UserData; message?: string };

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
    } catch (error: unknown) {
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


