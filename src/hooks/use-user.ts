"use client";

import { useState } from 'react';
import { API_ROUTES } from '@/lib/api/api-routes-endpoints';
import { UserUpdate, User } from '@/lib/types/user';
import { useAuthContext } from '@/contexts/AuthContext';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

interface ApiResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

interface UserHookResult {
  updateProfile: (request: UserUpdate) => Promise<ApiResponse>;
  isLoading: boolean;
  error: string | null;
  setErrorMessage: (message: string) => void;
}

export function useUser(): UserHookResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useAuthContext();

  const updateProfile = async (request: UserUpdate): Promise<ApiResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const formattedBirthDate = request.birthDate 
        ? request.birthDate.toISOString().split('T')[0]
        : null;

      const response = await fetchWithAuth(`${API_ROUTES.USER_PROFILE}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: request.name,
          surname: request.surname,
          username: request.username,
          birthDate: formattedBirthDate,
          status: request.status,
          description: request.description
        }),
      });

      const data = await response.json() as { success: boolean; data?: unknown; message?: string };

      if (response.ok && data.success) {
        if (user) {
          const updatedUser: User = {
            ...user,
            name: request.name ?? user.name,
            surname: request.surname ?? user.surname,
            birthDate: request.birthDate ?? user.birthDate,
            username: request.username !== undefined ? request.username as string : user.username,
            status: request.status !== undefined ? request.status : user.status,
            description: request.description !== undefined ? request.description : user.description,
          };
          setUser(updatedUser);
        }
        
        return data;
      } else {
        const errorMessage = data.message || 'Nie udało się zaktualizować profilu';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error: unknown) {
      console.error('Update profile error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd połączenia';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const setErrorMessage = (message: string) => {
    setError(message);
  };

  return {
    updateProfile,
    isLoading,
    error,
    setErrorMessage
  };
}

