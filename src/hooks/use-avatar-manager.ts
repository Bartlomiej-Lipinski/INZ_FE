"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { SAFE_AVATAR_URL_PATTERN } from "@/lib/constants";
import { useProfilePicture } from "@/hooks/use-profile-picture";
import type { User } from "@/lib/types/user";

const getSafeProfilePictureUrl = (url?: string | null) =>
  typeof url === "string" && SAFE_AVATAR_URL_PATTERN.test(url) ? url : null;

type UseAvatarManagerResult = {
  avatarSrc: string | null;
  isImageLoading: boolean;
};

const revokeObjectUrl = (urlRef: MutableRefObject<string | null>) => {
  if (urlRef.current) {
    URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }
};

export const useAvatarManager = (user: User | null): UseAvatarManagerResult => {
  const { fetchProfilePicture, getProfilePictureFromCache } = useProfilePicture();

  const [avatarSrc, setAvatarSrc] = useState<string | null>(() =>
    getSafeProfilePictureUrl(user?.profilePicture?.url),
  );
  const [isImageLoading, setIsImageLoading] = useState(false);

  const remoteObjectUrlRef = useRef<string | null>(null);
  const fetchControllerRef = useRef<AbortController | null>(null);

  const setRemoteAvatar = useCallback((nextSrc: string | null, options: { isObjectUrl?: boolean } = {}) => {
    if (remoteObjectUrlRef.current && remoteObjectUrlRef.current !== nextSrc) {
      URL.revokeObjectURL(remoteObjectUrlRef.current);
      remoteObjectUrlRef.current = null;
    }

    if (options.isObjectUrl && nextSrc) {
      remoteObjectUrlRef.current = nextSrc;
    }

    setAvatarSrc(nextSrc);
  }, []);

  const loadRemoteAvatar = useCallback(() => {
    fetchControllerRef.current?.abort();

    if (!user?.profilePicture) {
      setRemoteAvatar(null);
      setIsImageLoading(false);
      return;
    }

    const pictureId = user.profilePicture.id ?? null;
    const fallbackUrl = getSafeProfilePictureUrl(user.profilePicture.url);

    if (!pictureId) {
      setRemoteAvatar(fallbackUrl);
      setIsImageLoading(false);
      return;
    }

    const cachedBlob = getProfilePictureFromCache(pictureId);
    if (cachedBlob) {
      const objectUrl = URL.createObjectURL(cachedBlob);
      setRemoteAvatar(objectUrl, { isObjectUrl: true });
      setIsImageLoading(false);
      return;
    }

    const controller = new AbortController();
    fetchControllerRef.current = controller;
    setIsImageLoading(true);

    fetchProfilePicture(pictureId, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) {
          return;
        }

        if (!blob) {
          setRemoteAvatar(fallbackUrl);
          return;
        }

        const objectUrl = URL.createObjectURL(blob);
        setRemoteAvatar(objectUrl, { isObjectUrl: true });
      })
      .catch((error) => {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        console.error("Profile photo download error:", error);
        setRemoteAvatar(fallbackUrl);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsImageLoading(false);
        }
      });
  }, [user?.profilePicture, fetchProfilePicture, getProfilePictureFromCache, setRemoteAvatar]);

  useEffect(() => {
    loadRemoteAvatar();
    return () => {
      fetchControllerRef.current?.abort();
      revokeObjectUrl(remoteObjectUrlRef);
    };
  }, [loadRemoteAvatar]);

  return {
    avatarSrc,
    isImageLoading,
  };
};


