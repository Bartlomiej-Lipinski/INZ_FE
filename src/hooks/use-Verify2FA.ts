"use client";

import {useState} from "react";

interface Verify2FARequest {
    email: string;
    code: string;
}

interface ApiResponse {
    success: boolean;
    data?: unknown;
    message?: string;
}

export function Verify2FA() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const verify2FA = async (request: Verify2FARequest): Promise<ApiResponse> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://localhost:7215/api/auth/verify-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: request.email.trim(),
                    code: request.code,
                }),
                credentials: 'include'
            });

            const data = await response.json() as ApiResponse;

            if (response.ok && data.success) {
                return data;
            } else {
                setError(data.message || "Błąd weryfikacji 2FA");
                return {success: false, message: data.message || "Błąd weryfikacji 2FA"};
            }
        } catch(err) {
            console.error('Verify 2FA error:', err);
            setError("Wystąpił błąd podczas weryfikacji 2FA");
            return {success: false, message: "Wystąpił błąd podczas weryfikacji 2FA"};
        } finally {
            setIsLoading(false);
        }
    }

    return {verify2FA, isLoading, error, setErrorMessage: setError};
}