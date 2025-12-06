"use client";

import {useCallback, useState} from "react";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {useAuthContext} from "@/contexts/AuthContext";

interface ApiResponse {
    success: boolean;
    data?: boolean;
    message?: string;
}

export function useIsAdmin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {user, setUser} = useAuthContext();

    const updateUserRole = useCallback((isAdmin: boolean) => {
        if (!user) {
            return;
        }

        const desiredRole = isAdmin ? 'Admin' : 'Member';
        if (user.role === desiredRole) {
            return;
        }

        setUser({
            ...user,
            role: desiredRole,
        });
    }, [setUser, user]);

    const verifyIsUserAdmin = useCallback(async (groupid: string): Promise<ApiResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            const url = `${API_ROUTES.IS_ADMIN}?groupid=${encodeURIComponent(groupid)}`;
            const response = await fetchWithAuth(url, {method: 'GET'});

            const data = await response.json() as ApiResponse;

            if (response.ok && data.success) {
                if (typeof data.data === "boolean") {
                    updateUserRole(data.data);
                }
                return data;
            } else {
                setError(data.message || "Błąd weryfikacji uprawnień admina");
                return {success: false, message: data.message || "Błąd weryfikacji uprawnień admina"};
            }
        } catch (err) {
            console.error('Verify admin error:', err);
            setError("Wystąpił błąd podczas weryfikacji uprawnień admina");
            return {success: false, message: "Wystąpił błąd podczas weryfikacji uprawnień admina"};
        } finally {
            setIsLoading(false);
        }
    }, [updateUserRole]);

    return {verifyIsUserAdmin, isLoading, error, setErrorMessage: setError};
}