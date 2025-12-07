"use client";

import {useCallback, useState} from "react";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";

export interface JoinRequestProfilePicture {
    url: string;
    fileName: string;
    contentType: string;
    size: number;
}

export interface JoinRequestUser {
    id: string;
    name: string;
    surname: string;
    username: string | null;
    profilePicture: JoinRequestProfilePicture | null;
}

export interface JoinRequest {
    groupId: string;
    groupName: string;
    user: JoinRequestUser;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string | null;
    traceId?: string;
}

interface JoinRequestAmountPayload {
    amount: number;
}

interface AcceptRejectPayload {
    groupId: string;
    userId: string;
}

interface UseJoinRequestResult {
    joinRequests: JoinRequest[];
    joinRequestsAmount: number | null;
    isFetchingRequests: boolean;
    isRefreshingAmount: boolean;
    isMutating: boolean;
    error: string | null;
    fetchJoinRequests: () => Promise<ApiResponse<JoinRequest[]>>;
    refreshJoinRequestsAmount: () => Promise<ApiResponse<JoinRequestAmountPayload>>;
    acceptJoinRequest: (payload: AcceptRejectPayload) => Promise<ApiResponse<string | null>>;
    rejectJoinRequest: (payload: AcceptRejectPayload) => Promise<ApiResponse<string | null>>;
    clearJoinRequests: () => void;
    setErrorMessage: (message: string | null) => void;
}

export function useJoinRequest(): UseJoinRequestResult {
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [joinRequestsAmount, setJoinRequestsAmount] = useState<number | null>(null);
    const [isFetchingRequests, setIsFetchingRequests] = useState(false);
    const [isRefreshingAmount, setIsRefreshingAmount] = useState(false);
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const removeRequestFromState = useCallback((groupId: string, userId: string) => {
        setJoinRequests((prev) =>
            prev.filter((request) => !(request.groupId === groupId && request.user.id === userId))
        );
        setJoinRequestsAmount((prev) =>
            typeof prev === "number" ? Math.max(prev - 1, 0) : prev
        );
    }, []);

    const fetchJoinRequests = useCallback(async (): Promise<ApiResponse<JoinRequest[]>> => {
        setIsFetchingRequests(true);
        setError(null);

        type RawJoinRequestsResponse = ApiResponse<JoinRequest[] | JoinRequest | undefined>;

        try {
            const response = await fetchWithAuth(API_ROUTES.GET_JOIN_REQUESTS, {method: "GET"});
            const payload: RawJoinRequestsResponse = await response.json().catch(() => ({} as RawJoinRequestsResponse));

            if (response.ok && payload.success) {
                const normalizedData = Array.isArray(payload.data)
                    ? payload.data
                    : payload.data
                        ? [payload.data]
                        : [];

                setJoinRequests(normalizedData);
                setJoinRequestsAmount(normalizedData.length);

                return {...payload, data: normalizedData};
            }

            const message = payload.message ?? "Nie udało się pobrać próśb o dołączenie.";
            setError(message);
            return {success: false, message, traceId: payload.traceId};
        } catch (err) {
            console.error("Fetch join requests error:", err);
            const message = "Wystąpił błąd podczas pobierania próśb o dołączenie.";
            setError(message);
            return {success: false, message};
        } finally {
            setIsFetchingRequests(false);
        }
    }, []);

    const refreshJoinRequestsAmount = useCallback(async (): Promise<ApiResponse<JoinRequestAmountPayload>> => {
        setIsRefreshingAmount(true);
        setError(null);

        try {
            const response = await fetchWithAuth(API_ROUTES.GET_JOIN_REQUESTS_AMOUNT, {method: "GET"});
            const payload: ApiResponse<JoinRequestAmountPayload> = await response.json().catch(() => ({} as ApiResponse<JoinRequestAmountPayload>));

            if (response.ok && payload.success && typeof payload.data?.amount === "number") {
                setJoinRequestsAmount(payload.data.amount);
                return payload;
            }

            const message = payload.message ?? "Nie udało się pobrać liczby próśb o dołączenie.";
            setError(message);
            return {success: false, message, traceId: payload.traceId};
        } catch (err) {
            console.error("Fetch join requests amount error:", err);
            const message = "Wystąpił błąd podczas pobierania liczby próśb o dołączenie.";
            setError(message);
            return {success: false, message};
        } finally {
            setIsRefreshingAmount(false);
        }
    }, []);

    const acceptJoinRequest = useCallback(async (payload: AcceptRejectPayload): Promise<ApiResponse<string | null>> => {
        setIsMutating(true);
        setError(null);

        try {
            const response = await fetchWithAuth(API_ROUTES.ACCEPT_JOIN_REQUEST, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const data: ApiResponse<string | null> = await response.json().catch(() => ({} as ApiResponse<string | null>));

            if (response.ok && data.success) {
                removeRequestFromState(payload.groupId, payload.userId);
                return data;
            }

            const message = data.message ?? "Nie udało się zaakceptować prośby.";
            setError(message);
            return {success: false, message, traceId: data.traceId};
        } catch (err) {
            console.error("Accept join request error:", err);
            const message = "Wystąpił błąd podczas akceptowania prośby.";
            setError(message);
            return {success: false, message};
        } finally {
            setIsMutating(false);
        }
    }, [removeRequestFromState]);

    const rejectJoinRequest = useCallback(async (payload: AcceptRejectPayload): Promise<ApiResponse<string | null>> => {
        setIsMutating(true);
        setError(null);

        try {
            const response = await fetchWithAuth(API_ROUTES.REJECT_JOIN_REQUEST, {
                method: "DELETE",
                body: JSON.stringify(payload),
            });

            const data: ApiResponse<string | null> = await response.json().catch(() => ({} as ApiResponse<string | null>));

            if (response.ok && data.success) {
                removeRequestFromState(payload.groupId, payload.userId);
                return data;
            }

            const message = data.message ?? "Nie udało się odrzucić prośby.";
            setError(message);
            return {success: false, message, traceId: data.traceId};
        } catch (err) {
            console.error("Reject join request error:", err);
            const message = "Wystąpił błąd podczas odrzucania prośby.";
            setError(message);
            return {success: false, message};
        } finally {
            setIsMutating(false);
        }
    }, [removeRequestFromState]);

    const clearJoinRequests = () => {
        setJoinRequests([]);
        setJoinRequestsAmount(null);
    };

    return {
        joinRequests,
        joinRequestsAmount,
        isFetchingRequests,
        isRefreshingAmount,
        isMutating,
        error,
        fetchJoinRequests,
        refreshJoinRequestsAmount,
        acceptJoinRequest,
        rejectJoinRequest,
        clearJoinRequests,
        setErrorMessage: setError,
    };
}

