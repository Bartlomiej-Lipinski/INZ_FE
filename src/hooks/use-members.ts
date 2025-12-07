 "use client";

 import {useCallback, useState} from "react";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import { GroupMember } from "@/lib/types/user";

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string | null;
    traceId?: string;
}

export type GroupMembersResponse = ApiResponse<GroupMember[] | GroupMember>;

 interface UseMembersResult {
     members: GroupMember[];
     isLoading: boolean;
     error: string | null;
     fetchGroupMembers: (groupId: string) => Promise<GroupMembersResponse>;
     clearMembers: () => void;
     setErrorMessage: (message: string | null) => void;
    grantAdminPrivileges: (groupId: string, userId: string) => Promise<ApiResponse<unknown>>;
    removeGroupMember: (groupId: string, userId: string) => Promise<ApiResponse<unknown>>;
 }

 export function useMembers(): UseMembersResult {
     const [members, setMembers] = useState<GroupMember[]>([]);
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     const fetchGroupMembers = useCallback(async (groupId: string): Promise<GroupMembersResponse> => {
         if (!groupId) {
             const message = "Brak identyfikatora grupy.";
             setError(message);
             return {success: false, message};
         }

         setIsLoading(true);
         setError(null);

         try {
             const response = await fetchWithAuth(API_ROUTES.GET_GROUP_MEMBERS, {
                 method: "POST",
                 body: JSON.stringify({groupId}),
             });

             const data = await response.json().catch(() => ({})) as GroupMembersResponse;

             if (response.ok && data.success) {
                 const normalizedMembers = Array.isArray(data.data)
                     ? data.data
                     : data.data
                         ? [data.data]
                         : [];

                 setMembers(normalizedMembers);
                 return {...data, data: normalizedMembers};
             }

             const message = data.message ?? "Nie udało się pobrać członków grupy.";
             setError(message);
             return {success: false, message, traceId: data.traceId};
         } catch (err) {
             console.error("Fetch group members error:", err);
             const message = "Wystąpił błąd podczas pobierania członków grupy.";
             setError(message);
             return {success: false, message};
         } finally {
             setIsLoading(false);
         }
     }, []);

     const clearMembers = () => {
         setMembers([]);
     };

    const grantAdminPrivileges = useCallback(async (groupId: string, userId: string): Promise<ApiResponse<unknown>> => {
        if (!groupId || !userId) {
            const message = "Brak identyfikatora grupy lub użytkownika.";
            setError(message);
            return {success: false, message};
        }

        setError(null);

        try {
            const response = await fetchWithAuth(API_ROUTES.GRANT_ADMIN_PRIVILEGES, {
                method: "POST",
                body: JSON.stringify({groupId, userId}),
            });

            const data = await response.json().catch(() => ({})) as ApiResponse<unknown>;

            if (response.ok && data.success) {
                return data;
            }

            const message = data.message ?? "Nie udało się nadać uprawnień administratora.";
            setError(message);
            return {success: false, message, traceId: data.traceId};
        } catch (err) {
            console.error("Grant admin privileges error:", err);
            const message = "Wystąpił błąd podczas nadawania uprawnień administratora.";
            setError(message);
            return {success: false, message};
        }
    }, []);

    const removeGroupMember = useCallback(async (groupId: string, userId: string): Promise<ApiResponse<unknown>> => {
        if (!groupId || !userId) {
            const message = "Brak identyfikatora grupy lub użytkownika.";
            setError(message);
            return {success: false, message};
        }

        setError(null);

        try {
            const response = await fetchWithAuth(API_ROUTES.REMOVE_GROUP_MEMBER, {
                method: "DELETE",
                body: JSON.stringify({groupId, userId}),
            });

            const data = await response.json().catch(() => ({})) as ApiResponse<unknown>;

            if (response.ok && data.success) {
                setMembers((prev) => prev.filter((member) => member.id !== userId));
                return data;
            }

            const message = data.message ?? "Nie udało się usunąć użytkownika z grupy.";
            setError(message);
            return {success: false, message, traceId: data.traceId};
        } catch (err) {
            console.error("Remove group member error:", err);
            const message = "Wystąpił błąd podczas usuwania członka grupy.";
            setError(message);
            return {success: false, message};
        }
    }, []);

     return {
         members,
         isLoading,
         error,
         fetchGroupMembers,
         clearMembers,
         setErrorMessage: setError,
        grantAdminPrivileges,
        removeGroupMember,
     };
 }
