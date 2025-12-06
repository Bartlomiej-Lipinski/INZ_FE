import {useEffect, useState} from 'react';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";

export function useImageUrl(storedFileId?: string, temporaryUrl?: string): string | null {
    const [imageUrl, setImageUrl] = useState<string | null>(temporaryUrl || null);

    useEffect(() => {
        if (temporaryUrl) {
            setImageUrl(temporaryUrl);
            return;
        }
        if (!storedFileId) {
            setImageUrl(null);
            return;
        }

        let objectUrl: string | null = null;

        const fetchImage = async () => {
            try {
                const response = await fetchWithAuth(`${API_ROUTES.GET_FILE_BY_ID}?id=${storedFileId}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Nie udało się pobrać obrazu');
                }

                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
            } catch (error) {
                console.error('Błąd podczas pobierania obrazu:', error);
                setImageUrl(null);
            }
        };

        fetchImage();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [storedFileId]);

    return imageUrl;
}