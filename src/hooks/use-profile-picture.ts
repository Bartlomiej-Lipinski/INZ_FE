"use client";

import { useCallback } from "react";
import { API_ROUTES } from "@/lib/api/api-routes-endpoints";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

const PROFILE_PICTURE_CACHE_TTL_MS = 60 * 60 * 1000;

type ProfilePictureCacheEntry = {
  blob: Blob;
  expiresAt: number;
};

const profilePictureCache = new Map<string, ProfilePictureCacheEntry>();

const normalizeFileId = (fileId?: string | null): string | null => {
  if (typeof fileId !== "string") {
    return null;
  }
  const normalized = fileId.trim();
  return normalized.length > 0 ? normalized : null;
};

const getCachedProfilePicture = (fileId: string): Blob | null => {
  const normalizedFileId = normalizeFileId(fileId);
  if (!normalizedFileId) {
    return null;
  }

  const cached = profilePictureCache.get(normalizedFileId);
  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    profilePictureCache.delete(normalizedFileId);
    return null;
  }

  return cached.blob;
};

const setCachedProfilePicture = (fileId: string, blob: Blob, expiresAt?: number) => {
  const normalizedFileId = normalizeFileId(fileId);
  if (!normalizedFileId) {
    return;
  }

  const targetExpiresAt = expiresAt ?? Date.now() + PROFILE_PICTURE_CACHE_TTL_MS;
  profilePictureCache.set(normalizedFileId, {
    blob,
    expiresAt: targetExpiresAt,
  });
};

export const clearProfilePictureCache = (fileId?: string) => {
  const normalizedFileId = normalizeFileId(fileId);
  if (normalizedFileId) {
    profilePictureCache.delete(normalizedFileId);
    return;
  }

  profilePictureCache.clear();
};

export const useProfilePicture = () => {
  const fetchProfilePicture = useCallback(async (fileId: string, signal?: AbortSignal): Promise<Blob | null> => {
    const normalizedFileId = normalizeFileId(fileId);
    if (!normalizedFileId) {
      return null;
    }

    const cachedBlob = getCachedProfilePicture(normalizedFileId);
    if (cachedBlob) {
      return cachedBlob;
    }

    try {
      const response = await fetchWithAuth(`${API_ROUTES.GET_FILE_BY_ID}?id=${normalizedFileId}`, {
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
      setCachedProfilePicture(normalizedFileId, blob);
      return blob;
    } catch (error) {
      if ((error as Error)?.name === "AbortError") {
        return null;
      }
      console.error("Fetch profile picture error:", error);
      return null;
    }
  }, []);


  const deleteProfilePicture = useCallback(async (fileId: string | null | undefined): Promise<boolean> => {
    const normalizedFileId = normalizeFileId(fileId);
    if (!normalizedFileId) {
      return true;
    }

    try {
      const response = await fetchWithAuth(`${API_ROUTES.PROFILE_PICTURE}`, {
        method: "DELETE",
        body: JSON.stringify({ fileId: normalizedFileId }),
      });

      let data: { success?: boolean; message?: string } | null = null;
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (error) {
          console.error("Delete profile picture parse error:", error);
        }
      }

      if (!response.ok || data?.success === false) {
        console.error("Delete profile picture error:", data?.message ?? response.statusText);
        return false;
      }

      clearProfilePictureCache(normalizedFileId);
      return true;
    } catch (error) {
      console.error("Delete profile picture request failed:", error);
      return false;
    }
  }, []);


  const getProfilePictureFromCache = useCallback((fileId: string): Blob | null => {
    const normalizedFileId = normalizeFileId(fileId);
    if (!normalizedFileId) {
      return null;
    }
    return getCachedProfilePicture(normalizedFileId);
  }, []);

  
  return {
    fetchProfilePicture,
    getProfilePictureFromCache,
    deleteProfilePicture,
  };
};

