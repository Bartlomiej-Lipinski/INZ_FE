 "use client";

 import {useCallback, useState} from "react";
 import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
 import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
 import { GroupMember } from "@/lib/types/user";

 export interface GroupMembersResponse {
     success: boolean;
     data?: GroupMember[] | GroupMember;
     message?: string | null;
     traceId?: string;
 }

 interface UseMembersResult {
     members: GroupMember[];
     isLoading: boolean;
     error: string | null;
     fetchGroupMembers: (groupId: string) => Promise<GroupMembersResponse>;
     clearMembers: () => void;
     setErrorMessage: (message: string | null) => void;
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

     return {
         members,
         isLoading,
         error,
         fetchGroupMembers,
         clearMembers,
         setErrorMessage: setError,
     };
 }
