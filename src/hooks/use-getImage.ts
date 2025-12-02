import {useCallback, useEffect, useRef, useState} from 'react';

type UseGetImageResult = {
    src: string | null;
    loading: boolean;
    error: Error | null;
    reload: () => void;
};

const inMemoryCache = new Map<string, string>(); // fileId -> objectURL

export default function useGetImage(storedFileId?: string | null): UseGetImageResult {
    const [src, setSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const lastObjectUrlRef = useRef<string | null>(null);
    const reloadKeyRef = useRef(0);

    const reload = useCallback(() => {
        reloadKeyRef.current += 1;
        // trigger effect by updating ref used in deps
        // (no state change needed; effect depends on reloadKeyRef.current via closure)
    }, []);

    useEffect(() => {
        // cleanup previous object URL when id changes or unmount
        return () => {
            if (lastObjectUrlRef.current) {
                URL.revokeObjectURL(lastObjectUrlRef.current);
                lastObjectUrlRef.current = null;
            }
            if (controllerRef.current) {
                controllerRef.current.abort();
                controllerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on unmount to clean up

    useEffect(() => {
        let cancelled = false;

        async function load() {
            // cleanup previous object URL
            if (lastObjectUrlRef.current) {
                URL.revokeObjectURL(lastObjectUrlRef.current);
                lastObjectUrlRef.current = null;
            }

            if (!storedFileId) {
                setSrc(null);
                setLoading(false);
                setError(null);
                return;
            }

            // cached?
            const cached = inMemoryCache.get(storedFileId);
            if (cached) {
                setSrc(cached);
                setLoading(false);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);

            // abort previous
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
            const controller = new AbortController();
            controllerRef.current = controller;

            try {
                // adjust endpoint/query param name if backend expects different key
                const url = `/api/group/storage/getPutDeleteFile?fileId=${encodeURIComponent(storedFileId)}`;
                const res = await fetch(url, {signal: controller.signal});

                if (!res.ok) {
                    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
                }

                const blob = await res.blob();
                if (cancelled) return;

                const objectUrl = URL.createObjectURL(blob);
                lastObjectUrlRef.current = objectUrl;
                inMemoryCache.set(storedFileId, objectUrl);
                setSrc(objectUrl);
                setLoading(false);
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    // aborted -> ignore
                    return;
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
            // do not revoke cached urls here; only revoke lastObjectUrlRef when replacing/cleanup
        };
        // include reloadKeyRef.current to allow manual reloads via reload()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storedFileId, reloadKeyRef.current]);

    return {src, loading, error, reload};
}