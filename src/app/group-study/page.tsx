"use client";

import {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {StudyMaterialsPage} from '@/components/pages/StudyMaterials';
import {FileCategoryResponseDto, StoredFileResponseDto} from '@/lib/types/study-material';
import {API_ROUTES} from '@/lib/api/api-routes-endpoints';
import {fetchWithAuth} from '@/lib/api/fetch-with-auth';

// Mock dane - użyj jako fallback
const MOCK_USER_ID = 'user-1';
const MOCK_IS_ADMIN = true;

export default function GroupMenuPage() {
    const searchParams = useSearchParams();
    const [files, setFiles] = useState<StoredFileResponseDto[]>([]);
    const [categories, setCategories] = useState<FileCategoryResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    const groupData = useMemo(() => {
        const groupId = searchParams?.get('groupId') || '';
        const groupName = searchParams?.get('groupName') || '';
        const groupColor = searchParams?.get('groupColor') || '#9042fb';

        return {
            id: groupId,
            name: decodeURIComponent(groupName),
            color: decodeURIComponent(groupColor),
        };
    }, [searchParams]);

    const fetchMaterials = async (categoryId?: string, uploadedById?: string) => {
        if (!groupData.id) return;

        try {
            const params = new URLSearchParams({groupId: groupData.id});
            if (categoryId) params.append('categoryId', categoryId);
            if (uploadedById) params.append('uploadedById', uploadedById);

            const response = await fetchWithAuth(
                `${API_ROUTES.GET_GROUP_MATERIALS}?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas pobierania materiałów');
            }

            const data = await response.json();
            const files = data.data as StoredFileResponseDto[];
            setFiles(Array.isArray(files) ? files : [files]);
        } catch (error) {
            console.error('Błąd podczas pobierania materiałów:', error);
            setFiles([]);
        }
    };

    const fetchCategories = async () => {
        if (!groupData.id) return;

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.GET_CATEGORIES}?groupId=${groupData.id}`,
                {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas pobierania kategorii');
            }

            const data: FileCategoryResponseDto[] = await response.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Błąd podczas pobierania kategorii:', error);
            setCategories([]);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchCategories(), fetchMaterials()]);
            setLoading(false);
        };

        if (groupData.id) {
            loadData();
        }
    }, [groupData.id]);

    if (loading) {
        return <div>Ładowanie...</div>;
    }

    return (
        <StudyMaterialsPage
            files={files}
            categories={categories}
            userId={MOCK_USER_ID}
            isAdmin={MOCK_IS_ADMIN}
            groupData={groupData}
            onFilesChange={setFiles}
            onCategoriesChange={setCategories}
            onRefreshMaterials={fetchMaterials}
            onRefreshCategories={fetchCategories}
        />
    );
}