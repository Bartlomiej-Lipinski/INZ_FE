import { useState } from 'react';
import { Group } from '@/lib/types/group';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { API_ROUTES } from '@/lib/api/api-routes-endpoints';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  traceId?: string;
}

interface GroupResponse {
  id: string;
  name: string;
  color: string;
  code?: string;
}

export function useGroup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getGroupById = async (groupId: string): Promise<Group | null> => {
    if (!groupId) {
      setError('ID grupy jest wymagane');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(`${API_ROUTES.GROUP_BY_ID}/${groupId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Grupa nie została znaleziona');
          return null;
        }
        if (response.status === 403) {
          setError('Brak uprawnień do dostępu do tej grupy');
          return null;
        }
        setError('Nie udało się pobrać grupy');
        return null;
      }

      const json = await response.json() as ApiResponse<GroupResponse>;
      
      if (!json.success || !json.data) {
        setError(json.message || 'Nie udało się pobrać grupy');
        return null;
      }

      const groupData: Group = {
        id: json.data.id,
        name: json.data.name,
        color: json.data.color,
      };

      return groupData;
    } catch (err) {
      console.error('Error fetching group:', err);
      setError('Wystąpił błąd podczas pobierania grupy');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getGroupById,
    loading,
    error,
  };
}
