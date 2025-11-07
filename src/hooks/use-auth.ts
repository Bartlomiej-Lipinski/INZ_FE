"use client";

import { useState } from 'react';
import { API_ROUTES } from '@/lib/api/api-routes-endpoints';
import { User, UserCreate } from '@/lib/types/user';
import { useAuthContext } from '@/contexts/AuthContext';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

interface LoginRequest {
  email: string;
  password: string;
  captchaToken?: string;
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

interface AuthHookResult {
  login: (request: LoginRequest) => Promise<ApiResponse>;
  register: (request: UserCreate) => Promise<ApiResponse>;
  setErrorMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function useAuth(): AuthHookResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthContext();

  const login = async (request: LoginRequest): Promise<ApiResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ROUTES.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email.trim(),
          password: request.password,
          captchaToken: request.captchaToken
        }),
        credentials: 'include'
      });

      const data = await response.json() as { success: boolean; data?: string; message?: string };

      if (response.ok && data.success) {
        if (data.data) {
          try {
            const userResponse = await fetchWithAuth(`${API_ROUTES.USER_BY_ID}/${data.data}`, {
              method: 'GET',
            });
            const userData = await userResponse.json();
            if (userResponse.ok && userData.success && userData.data) {
              console.log('User data:', userData.data);
              setUser(userData.data as User);
            }
          } catch (userError) {
            console.error('Error fetching user data:', userError);
          }
        }
        
        return data;
      } else if (response.status === 401) {
        setError("Nieprawidłowy e-mail lub hasło");
        return { success: false };
      } else {
        setError("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
        return { success: false };
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof Error && error.message) {
        setError("Wystąpił błąd połączenia");
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };


  const register = async (request: UserCreate): Promise<ApiResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ROUTES.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email.trim().toLowerCase(),
          name: request.name.trim(),
          surname: request.surname.trim(),
          userName: request.userName,
          birthDate: request.birthDate,
          password: request.password
        }),
      });

      const data = await response.json() as { success: boolean; data?: string; message?: string };

      if (response.ok && data.success) {
        return data;
      } else if (response.status === 400) {
        if (data.message === "Email already exists.") {
          setError("Popraw błędy!");
        } else {
          setError("Wystąpił błąd podczas rejestracji");
        }
       return { success: false, message: data.message };
      } else {
        setError("Wystąpił błąd podczas rejestracji");
        return { success: false };
      }
    } catch (error: unknown) {
      console.error('Register error:', error);
      if (error instanceof Error && error.message) {
        setError("Wystąpił błąd połączenia");
      }
      return { success: false, message: "Błąd połączenia z serwerem" };
    } finally {
      setIsLoading(false);
    }
  };



  const setErrorMessage = (message: string) => {
    setError(message);
  };

  return {
    login,
    register,
    setErrorMessage,
    isLoading,
    error
  };
}

