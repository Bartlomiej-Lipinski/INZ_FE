"use client";

import { useCallback, useState } from 'react';
import { API_ROUTES } from '@/lib/api/api-routes-endpoints';
import { UserUpdate, User } from '@/lib/types/user';
import { useAuthContext } from '@/contexts/AuthContext';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

interface ApiResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

interface ProfilePhotoResponse {
  success: boolean;
  data?: ProfilePhotoResponseData;
  message?: string;
}

export interface ProfilePhotoResponseData {
  id?: string;
  fileName: string;
  contentType: string;
  size: number;
  url: string;
}

interface UserHookResult {
  updateProfile: (request: UserUpdate) => Promise<ApiResponse>;
  uploadProfilePicture: (file: File) => Promise<ProfilePhotoResponseData | null>;
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
            name: request.name,
            surname: request.surname,
            birthDate: request.birthDate,
            username: request.username,
            status: request.status,
            description: request.description,
          };
          setUser(updatedUser);
        }
        
        return data;
      } else {
        const errorMessage = 'Nie udało się zaktualizować profilu';
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

  const uploadProfilePicture = useCallback(async (file: File): Promise<ProfilePhotoResponseData | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetchWithAuth(`${API_ROUTES.POST_PROFILE_PICTURE}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json() as ProfilePhotoResponse;

      if (!response.ok || !data.success || !data.data) {
        const message = data?.message ?? 'Nie udało się przesłać zdjęcia profilowego.';
        setError(message);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('Profile photo upload error:', error);
      setError('Wystąpił błąd podczas przesyłania zdjęcia.');
      return null;
    }
  }, [setError]);

  const setErrorMessage = (message: string) => {
    setError(message);
  };

  return {
    updateProfile,
    uploadProfilePicture,
    isLoading,
    error,
    setErrorMessage
  };
}

