"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { API_ROUTES } from '@/lib/api/api-routes-endpoints';
import { UserUpdate, User } from '@/lib/types/user';
import { useAuthContext } from '@/contexts/AuthContext';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

interface ApiResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

export interface ProfilePhotoResponse {
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
  uploadProfilePicture: (file: File) => Promise<ProfilePhotoResponse>;
  fetchAuthenticatedUser: (userId?: string) => Promise<User | null>;
  isLoading: boolean;
  error: string | null;
  setErrorMessage: (message: string) => void;
}

export function useUser(): UserHookResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useAuthContext();
  const userIdRef = useRef<string | null>(user?.id ?? null);

  useEffect(() => {
    userIdRef.current = user?.id ?? null;
  }, [user?.id]);

  const updateProfile = async (request: UserUpdate): Promise<ApiResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const formattedBirthDate = request.birthDate 
        ? request.birthDate.toISOString().split('T')[0]
        : null;

      const payload: Record<string, unknown> = {
        name: request.name,
        surname: request.surname,
        username: request.username,
        birthDate: formattedBirthDate,
        status: request.status,
        description: request.description
      };

      if (Object.prototype.hasOwnProperty.call(request, 'profilePictureId')) {
        payload.profilePictureId = request.profilePictureId;
      }

      const response = await fetchWithAuth(`${API_ROUTES.USER_PROFILE}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const data = await response.json() as { success: boolean; data?: unknown; message?: string };

      if (response.ok && data.success) {
        if (user) {
          const shouldClearProfilePicture = Object.prototype.hasOwnProperty.call(request, 'profilePictureId') &&
            request.profilePictureId === null;

          const updatedUser: User = {
            ...user,
            name: request.name,
            surname: request.surname,
            birthDate: request.birthDate,
            username: request.username,
            status: request.status,
            description: request.description,
            profilePicture: shouldClearProfilePicture ? null : user.profilePicture,
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

  const uploadProfilePicture = useCallback(async (file: File): Promise<ProfilePhotoResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetchWithAuth(`${API_ROUTES.PROFILE_PICTURE}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json() as ProfilePhotoResponse;

      if (!response.ok || !data.success || !data.data) {
        const message = data?.message ?? 'Nie udało się przesłać zdjęcia profilowego.';
        setError(message);
        return { success: false, message };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Profile photo upload error:', error);
      const message = 'Wystąpił błąd podczas przesyłania zdjęcia.';
      setError(message);
      return { success: false, message };
    }
  }, [setError]);



  const fetchAuthenticatedUser = useCallback(async (userId?: string): Promise<User | null> => {
    const targetUserId = userId ?? userIdRef.current;

    if (!targetUserId) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(`${API_ROUTES.USER_BY_ID}/${targetUserId}`, {
        method: 'GET',
      });

      const data = await response.json() as { success: boolean; data?: User; message?: string };

      if (response.ok && data.success && data.data) {
        setUser(data.data);
        return data.data;
      }

      const errorMessage = data.message ?? 'Nie udało się pobrać danych użytkownika.';
      setError(errorMessage);
      return null;
    } catch (error) {
      console.error('Fetch authenticated user error:', error);
      setError('Wystąpił błąd podczas pobierania danych użytkownika.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const setErrorMessage = (message: string) => {
    setError(message);
  };

  return {
    updateProfile,
    uploadProfilePicture,
    fetchAuthenticatedUser,
    isLoading,
    error,
    setErrorMessage
  };
}

