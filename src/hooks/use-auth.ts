import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/constants';

interface LoginRequest {
  email: string;
  password: string;
  captchaToken?: string;
}

interface RegisterRequest {
  email: string;
  name: string;
  surname: string;
  userName: string;
  birthDate: string;
  password: string;
}

interface AuthHookResult {
  login: (request: LoginRequest) => Promise<any>;
  register: (request: RegisterRequest) => Promise<any>;
  setErrorMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function useAuth(): AuthHookResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const login = async (request: LoginRequest): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
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

      const data: any = await response.json();

      if (response.ok && data.success) {
        return data;
      } else if (response.status === 401) {
        setError("Nieprawidłowy e-mail lub hasło");
        return { success: false };
      } else {
        setError("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
        return { success: false };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (!error.message) {
        setError("Wystąpił błąd połączenia");
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };


  const register = async (request: RegisterRequest): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
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

      const data: any = await response.json();

      if (response.ok && data.success) {
        return data;
      } else if (response.status === 400) {
        if (data.message === "Email already exists.") {
          setError("Popraw błędy!");
        } else {
          setError("Wystąpił błąd podczas rejestracji");
        }
       return { success: false };
      } else {
        setError("Wystąpił błąd podczas rejestracji");
        return { success: false };
      }
    } catch (error: any) {
      console.error('Register error:', error);
      if (!error?.message) {
        setError("Błąd połączenia z serwerem");
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

