"use client";

import { useCallback } from "react";
import { API_ROUTES } from "@/lib/api/api-routes-endpoints";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

const PROFILE_PICTURE_CACHE_TTL_MS = 60 * 60 * 1000;
const PROFILE_PICTURE_STORAGE_KEY = "profile-picture-cache";

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

type StoredProfilePictureEntry = {
  dataUrl: string;
  expiresAt: number;
};

const isStorageAvailable = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readStoredProfilePictures = (): Record<string, StoredProfilePictureEntry> => {
  if (!isStorageAvailable()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_PICTURE_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, StoredProfilePictureEntry>;
    return parsed ?? {};
  } catch (error) {
    console.error("Read profile picture cache error:", error);
    return {};
  }
};

const writeStoredProfilePictures = (next: Record<string, StoredProfilePictureEntry>) => {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(PROFILE_PICTURE_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("Write profile picture cache error:", error);
  }
};

const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, data] = dataUrl.split(",");
  const mimeMatch = /data:(.*?);base64/.exec(header);
  const mimeType = mimeMatch?.[1] ?? "application/octet-stream";
  const binaryString = window.atob(data);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const getPersistedProfilePicture = (fileId: string): ProfilePictureCacheEntry | null => {
  const normalizedFileId = normalizeFileId(fileId);
  if (!normalizedFileId) {
    return null;
  }

  const storedEntries = readStoredProfilePictures();
  const storedEntry = storedEntries[normalizedFileId];
  if (!storedEntry) {
    return null;
  }

  if (Date.now() > storedEntry.expiresAt) {
    delete storedEntries[normalizedFileId];
    writeStoredProfilePictures(storedEntries);
    return null;
  }

  try {
    const blob = dataUrlToBlob(storedEntry.dataUrl);
    return {
      blob,
      expiresAt: storedEntry.expiresAt,
    };
  } catch (error) {
    console.error("Deserialize profile picture cache error:", error);
    delete storedEntries[normalizedFileId];
    writeStoredProfilePictures(storedEntries);
    return null;
  }
};

const getCachedProfilePicture = (fileId: string): Blob | null => {
  const normalizedFileId = normalizeFileId(fileId);
  if (!normalizedFileId) {
    return null;
  }

  const cached = profilePictureCache.get(normalizedFileId);
  if (!cached) {
    const persisted = getPersistedProfilePicture(normalizedFileId);
    if (!persisted) {
      return null;
    }

    setCachedProfilePicture(normalizedFileId, persisted.blob, {
      expiresAt: persisted.expiresAt,
      persist: false,
    });
    return persisted.blob;
  }

  if (Date.now() > cached.expiresAt) {
    profilePictureCache.delete(normalizedFileId);

    const storedEntries = readStoredProfilePictures();
    if (storedEntries[normalizedFileId]) {
      delete storedEntries[normalizedFileId];
      writeStoredProfilePictures(storedEntries);
    }

    return null;
  }

  return cached.blob;
};

const setCachedProfilePicture = (
  fileId: string,
  blob: Blob,
  options: { expiresAt?: number; persist?: boolean } = {}
) => {
  const normalizedFileId = normalizeFileId(fileId);
  if (!normalizedFileId) {
    return;
  }

  const expiresAt = options.expiresAt ?? Date.now() + PROFILE_PICTURE_CACHE_TTL_MS;
  profilePictureCache.set(normalizedFileId, {
    blob,
    expiresAt,
  });

  if (options.persist === false) {
    return;
  }

  blobToDataUrl(blob)
    .then((dataUrl) => {
      const storedEntries = readStoredProfilePictures();
      storedEntries[normalizedFileId] = {
        dataUrl,
        expiresAt,
      };
      writeStoredProfilePictures(storedEntries);
    })
    .catch((error) => {
      console.error("Persist profile picture error:", error);
    });
};

export const clearProfilePictureCache = (fileId?: string) => {
  const normalizedFileId = normalizeFileId(fileId);
  if (normalizedFileId) {
    profilePictureCache.delete(normalizedFileId);
    const storedEntries = readStoredProfilePictures();
    if (storedEntries[normalizedFileId]) {
      delete storedEntries[normalizedFileId];
      writeStoredProfilePictures(storedEntries);
    }
    return;
  }

  profilePictureCache.clear();
  if (isStorageAvailable()) {
    window.localStorage.removeItem(PROFILE_PICTURE_STORAGE_KEY);
  }
};

export const useImage = () => {
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

  const getProfilePictureFromCache = useCallback((fileId: string): Blob | null => {
    const normalizedFileId = normalizeFileId(fileId);
    if (!normalizedFileId) {
      return null;
    }
    return getCachedProfilePicture(normalizedFileId);
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

  const restoreProfilePictureCache = useCallback(
    async (fileId: string | null | undefined): Promise<void> => {
      const normalizedFileId = normalizeFileId(fileId);
      if (!normalizedFileId) {
        return;
      }

      try {
        await fetchProfilePicture(normalizedFileId);
      } catch (error) {
        console.error("Restore profile picture cache failed:", error);
      }
    },
    [fetchProfilePicture],
  );

  return {
    fetchProfilePicture,
    getProfilePictureFromCache,
    deleteProfilePicture,
    restoreProfilePictureCache,
  };
};

