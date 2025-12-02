// TypeScript
import {useCallback, useEffect, useRef, useState} from 'react';
import {fetchWithAuth} from '@/lib/api/fetch-with-auth';
import {API_ROUTES} from '@/lib/api/api-routes-endpoints';

type UseGetUserProfilePictureResult = {
    src: string | null;
    loading: boolean;
    error: Error | null;
    reload: () => void;
};

const inMemoryCache = new Map<string, string>(); // fileId -> objectURL

export default function useGetUserProfilePicture(
    fileId?: string | null,
): UseGetUserProfilePictureResult {
    const [src, setSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const controllerRef = useRef<AbortController | null>(null);
    const lastObjectUrlRef = useRef<string | null>(null);

    const reload = useCallback(() => {
        setReloadKey(k => k + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function tryFetch(fallbackUrl: string, signal?: AbortSignal) {
            const res = await fetchWithAuth("${API_ROUTES.GET_FILE_BY_ID}?fileId=${fileId}", {signal});
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return res;
        }

        async function load() {
            // cleanup previous object URL
            if (lastObjectUrlRef.current) {
                URL.revokeObjectURL(lastObjectUrlRef.current);
                lastObjectUrlRef.current = null;
            }

            // pozwalamy na "0"
            if (fileId == null || fileId === '') {
                setSrc(null);
                setLoading(false);
                setError(null);
                return;
            }

            // cached?
            const cached = inMemoryCache.get(fileId);
            if (cached) {
                setSrc(cached);
                setLoading(false);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);

            if (controllerRef.current) {
                controllerRef.current.abort();
            }
            const controller = new AbortController();
            controllerRef.current = controller;

            // build URL zgodny ze Swagger: NEXT_PUBLIC_API_URL (fallback window.location.origin) + /files/{id}
            const envBase = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
            const runtimeBase = typeof window !== 'undefined' ? window.location.origin : '';
            const baseApi = (envBase ?? runtimeBase).replace(/\/$/, '');
            const urlPrimary = `${baseApi}/files/${encodeURIComponent(fileId)}`;

            try {
                const res = await tryFetch(urlPrimary, controller.signal);
                const blob = await res.blob();
                if (cancelled) return;

                const objectUrl = URL.createObjectURL(blob);
                lastObjectUrlRef.current = objectUrl;
                inMemoryCache.set(fileId, objectUrl);
                setSrc(objectUrl);
                setLoading(false);
                return;
            } catch (err: unknown) {
                if ((err as { name?: string })?.name === 'AbortError') return;

                // fallback: stary endpoint z query param (relatywny)
                try {
                    const fallbackUrl = `${API_ROUTES.GET_FILE_BY_ID}?id=${encodeURIComponent(fileId)}`;
                    const res2 = await tryFetch(fallbackUrl, controller.signal);
                    const blob2 = await res2.blob();
                    if (cancelled) return;
                    const objectUrl2 = URL.createObjectURL(blob2);
                    lastObjectUrlRef.current = objectUrl2;
                    inMemoryCache.set(fileId, objectUrl2);
                    setSrc(objectUrl2);
                    setLoading(false);
                    return;
                } catch {
                    // fallthrough to set error
                }

                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setLoading(false);
                    setSrc(null);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
            if (controllerRef.current) {
                controllerRef.current.abort();
                controllerRef.current = null;
            }
            if (lastObjectUrlRef.current) {
                URL.revokeObjectURL(lastObjectUrlRef.current);
                lastObjectUrlRef.current = null;
            }
        };
    }, [fileId, reloadKey]);

    return {src, loading, error, reload};
}