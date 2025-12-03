"use client";

import { useCallback } from "react";
import { API_ROUTES } from "@/lib/api/api-routes-endpoints";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

const PROFILE_PICTURE_CACHE_TTL_MS = 5 * 60 * 1000;

type ProfilePictureCacheEntry = {
  blob: Blob;
  expiresAt: number;
};

const profilePictureCache = new Map<string, ProfilePictureCacheEntry>();

const getCachedProfilePicture = (fileId: string): Blob | null => {
  const cached = profilePictureCache.get(fileId);
  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    profilePictureCache.delete(fileId);
    return null;
  }

  return cached.blob;
};

const setCachedProfilePicture = (fileId: string, blob: Blob) => {
  profilePictureCache.set(fileId, {
    blob,
    expiresAt: Date.now() + PROFILE_PICTURE_CACHE_TTL_MS,
  });
};

export const clearProfilePictureCache = (fileId?: string) => {
  if (fileId) {
    profilePictureCache.delete(fileId);
    return;
  }

  profilePictureCache.clear();
};

export const useImage = () => {
  const fetchProfilePicture = useCallback(async (fileId: string, signal?: AbortSignal): Promise<Blob | null> => {
    if (!fileId) {
      return null;
    }

    const cachedBlob = getCachedProfilePicture(fileId);
    if (cachedBlob) {
      return cachedBlob;
    }

    try {
      const response = await fetchWithAuth(`${API_ROUTES.GET_FILE_BY_ID}?id=${fileId}`, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
        signal,
      });

      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();
      setCachedProfilePicture(fileId, blob);
      return blob;
    } catch (error) {
      if ((error as Error)?.name === "AbortError") {
        return null;
      }
      console.error("Fetch profile picture error:", error);
      return null;
    }
  }, []);

  return {
    fetchProfilePicture,
  };
};

