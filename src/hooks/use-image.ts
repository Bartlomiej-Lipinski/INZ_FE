"use client";

import { useCallback } from "react";
import { API_ROUTES } from "@/lib/api/api-routes-endpoints";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

const PROFILE_PICTURE_CACHE_TTL_MS = 5 * 60 * 1000;
const PROFILE_PICTURE_STORAGE_KEY = "profile-picture-cache";

type ProfilePictureCacheEntry = {
  blob: Blob;
  expiresAt: number;
};

const profilePictureCache = new Map<string, ProfilePictureCacheEntry>();

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
  const storedEntries = readStoredProfilePictures();
  const storedEntry = storedEntries[fileId];
  if (!storedEntry) {
    return null;
  }

  if (Date.now() > storedEntry.expiresAt) {
    delete storedEntries[fileId];
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
    delete storedEntries[fileId];
    writeStoredProfilePictures(storedEntries);
    return null;
  }
};

const getCachedProfilePicture = (fileId: string): Blob | null => {
  const cached = profilePictureCache.get(fileId);
  if (!cached) {
    const persisted = getPersistedProfilePicture(fileId);
    if (!persisted) {
      return null;
    }

    setCachedProfilePicture(fileId, persisted.blob, {
      expiresAt: persisted.expiresAt,
      persist: false,
    });
    return persisted.blob;
  }

  if (Date.now() > cached.expiresAt) {
    profilePictureCache.delete(fileId);

    const storedEntries = readStoredProfilePictures();
    if (storedEntries[fileId]) {
      delete storedEntries[fileId];
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
  const expiresAt = options.expiresAt ?? Date.now() + PROFILE_PICTURE_CACHE_TTL_MS;
  profilePictureCache.set(fileId, {
    blob,
    expiresAt,
  });

  if (options.persist === false) {
    return;
  }

  blobToDataUrl(blob)
    .then((dataUrl) => {
      const storedEntries = readStoredProfilePictures();
      storedEntries[fileId] = {
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
  if (fileId) {
    profilePictureCache.delete(fileId);
    const storedEntries = readStoredProfilePictures();
    if (storedEntries[fileId]) {
      delete storedEntries[fileId];
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

  const getProfilePictureFromCache = useCallback((fileId: string): Blob | null => {
    if (!fileId) {
      return null;
    }
    return getCachedProfilePicture(fileId);
  }, []);

  return {
    fetchProfilePicture,
    getProfilePictureFromCache,
  };
};

