"use client";

import {useState} from "react";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {useAuthContext} from "@/contexts/AuthContext";
import {User} from "@/lib/types/user";

interface Verify2FARequest {
    email: string;
    code: string;
}

interface ApiResponse {
    success: boolean;
    data?: unknown;
    message?: string;
}

export function use2FA() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { user, setUser } = useAuthContext();

    const verify2FA = async (request: Verify2FARequest): Promise<ApiResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_ROUTES.VERIFY_2FA}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: request.email.trim(),
                    code: request.code,
                }),
                credentials: 'include',
            });

            const data = await response.json() as { success: boolean; data?: string; message?: string };

            if (response.ok && data.success) {
                if (data.data) {
                    try {
                        const userResponse = await fetchWithAuth(`${API_ROUTES.USER_BY_ID}/${data.data}`, {
                            method: 'GET',
                        });
                        const userData = await userResponse.json();
                        
                        if (userData.success && userData.data) {
                            setUser(userData.data as User);
                        }
                    } catch (userError) {
                        console.error('Error fetching user data after 2FA verification:', userError);
                    }
                }
                return data;
            } else {
                return {success: false, message: "Kod weryfikacyjny jest niepoprawny lub wygasł"};
            }
        } catch(err) {
            console.error('Verify 2FA error:', err);
            setError("Wystąpił błąd podczas weryfikacji 2FA");
            return {success: false, message: "Wystąpił błąd podczas weryfikacji 2FA"};
        } finally {
            setIsLoading(false);
        }
    }

    const toggle2FA = async (enabled: boolean): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await fetchWithAuth(`${API_ROUTES.STATUS_2FA}`, {
                method: 'PUT',
                body: JSON.stringify({
                    enabled: enabled,
                }),
            });

            const data = await response.json() as ApiResponse;

            if (response.ok && data.success) {
                if (user) {
                    setUser({
                        ...user,
                        isTwoFactorEnabled: enabled,
                    });
                }
                setSuccessMessage(enabled 
                    ? "Dwuetapowa weryfikacja została włączona" 
                    : "Dwuetapowa weryfikacja została wyłączona");
                setTimeout(() => setSuccessMessage(null), 3000);
                return true;
            } else {
                setError(data.message || (enabled 
                    ? "Nie udało się włączyć 2FA" 
                    : "Nie udało się wyłączyć 2FA"));
                return false;
            }
        } catch (err) {
            console.error('Toggle 2FA error:', err);
            setError("Wystąpił błąd podczas zmiany stanu 2FA");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const isEnabled = user?.isTwoFactorEnabled ?? false;

    return {
        verify2FA,
        toggle2FA,
        isEnabled,
        isLoading,
        error,
        successMessage,
        setErrorMessage: setError,
        clearSuccessMessage: () => setSuccessMessage(null),
    };
}