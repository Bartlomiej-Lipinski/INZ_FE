"use client";

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {StudyMaterialsPage} from '@/components/pages/StudyMaterials';
import {FileCategoryResponseDto, StoredFileResponseDto} from '@/lib/types/study-material';
import {API_ROUTES} from '@/lib/api/api-routes-endpoints';
import {fetchWithAuth} from '@/lib/api/fetch-with-auth';
import {useIsAdmin} from "@/hooks/use-isAdmin";
import {Box, CircularProgress} from "@mui/material";


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
    const [currentUser, setCurrentUser] = useState<{
        id: string;
        email: string;
        username: string;
        name: string;
        surname: string;
        birthDate?: string;
        status?: string;
        description?: string;
        profilePicture?: {
            id: string;
            fileName?: string;
            contentType?: string;
            size?: number;
            url?: string;
        };
        isTwoFactorEnabled?: boolean;
    } | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const {verifyIsUserAdmin} = useIsAdmin();

    useEffect(() => {
        const userAuth = localStorage.getItem('auth:user');
        if (userAuth) {
            try {
                const userData = JSON.parse(userAuth);
                setCurrentUser({
                    id: userData.id,
                    email: userData.email,
                    username: userData.username,
                    name: userData.name,
                    surname: userData.surname,
                    birthDate: userData.birthDate,
                    status: userData.status,
                    description: userData.description,
                    profilePicture: userData.profilePicture,
                    isTwoFactorEnabled: userData.isTwoFactorEnabled,
                });
                const checkAdmin = async () => {
                    const response = await verifyIsUserAdmin(groupData.id);
                    setIsAdmin(response.success && response.data === true);
                };
                checkAdmin();
            } catch (error) {
                console.error('Błąd parsowania danych użytkownika:', error);
            }
        }
    }, [groupData.id]);

    const fetchMaterials = useCallback(async (categoryId?: string, uploadedById?: string) => {
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
    }, [groupData.id]);

    const fetchCategories = useCallback(async () => {
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

            const data = await response.json();
            const body = data.data as FileCategoryResponseDto[];
            setCategories(Array.isArray(body) ? body : []);
        } catch (error) {
            console.error('Błąd podczas pobierania kategorii:', error);
            setCategories([]);
        }
    }, [groupData.id]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchCategories(), fetchMaterials()]);
            setLoading(false);
        };

        if (groupData.id) {
            loadData();
        }
    }, [fetchCategories, fetchMaterials, groupData.id]);

    if (loading || !currentUser) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <StudyMaterialsPage
            files={files}
            categories={categories}
            userId={currentUser.id}
            isAdmin={isAdmin}
            groupData={groupData}
            onFilesChange={setFiles}
            onCategoriesChange={setCategories}
            onRefreshMaterials={fetchMaterials}
            onRefreshCategories={fetchCategories}
        />
    );
}