import {useEffect, useState} from 'react';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";

const imageCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

export function useImageUrl(storedFileId?: string, temporaryUrl?: string): string | null {
    const [imageUrl, setImageUrl] = useState<string | null>(() => {
        if (temporaryUrl) return temporaryUrl;
        if (storedFileId && imageCache.has(storedFileId)) {
            return imageCache.get(storedFileId)!;
        }
        return null;
    });

    useEffect(() => {
        if (temporaryUrl) {
            setImageUrl(temporaryUrl);
            return;
        }

        if (!storedFileId) {
            setImageUrl(null);
            return;
        }

        if (imageCache.has(storedFileId)) {
            setImageUrl(imageCache.get(storedFileId)!);
            return;
        }

        if (pendingRequests.has(storedFileId)) {
            pendingRequests.get(storedFileId)!.then(url => {
                if (url) setImageUrl(url);
            });
            return;
        }

        const fetchPromise = (async (): Promise<string | null> => {
            try {
                const response = await fetchWithAuth(`${API_ROUTES.GET_FILE_BY_ID}?id=${storedFileId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Nie udało się pobrać obrazu');
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                imageCache.set(storedFileId, objectUrl);
                return objectUrl;
            } catch (error) {
                console.error('Błąd podczas pobierania obrazu:', error);
                return null;
            } finally {
                pendingRequests.delete(storedFileId);
            }
        })();

        pendingRequests.set(storedFileId, fetchPromise);

        fetchPromise.then(url => {
            if (url) setImageUrl(url);
        });

    }, [storedFileId, temporaryUrl]);

    return imageUrl;
}

export function clearImageCache() {
    imageCache.forEach(url => URL.revokeObjectURL(url));
    imageCache.clear();
    pendingRequests.clear();
}