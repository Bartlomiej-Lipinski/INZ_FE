import {GroupFeedItemResponseDto} from "@/lib/types/feedDtos";
import {FeedItemType} from "@/lib/types/FeedItemType";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

interface UserData {
    name: string;
    avatar?: string;
}

export async function enrichItemsWithUserData(
    items: GroupFeedItemResponseDto[]
): Promise<GroupFeedItemResponseDto[]> {
    const userCache = new Map<string, UserData>();

    const fetchUserData = async (userId: string): Promise<UserData> => {
        if (userCache.has(userId)) {
            return userCache.get(userId)!;
        }

        try {
            const userResponse = await fetchWithAuth(
                `${API_ROUTES.GET_USER_BY_ID}?id=${userId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            );

            if (userResponse.ok) {
                const userData = await userResponse.json();
                const avatarUrl =
                    // userData.profilePicture?.url
                    // ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}${userData.profilePicture.url}` :
                    undefined;

                const user: UserData = {
                    name: userData.data.name,
                    avatar: avatarUrl,
                };
                userCache.set(userId, user);
                return user;
            }
        } catch (error) {
            console.error(`Błąd pobierania danych użytkownika ${userId}:`, error);
        }

        const fallbackUser: UserData = {name: 'Nieznany użytkownik'};
        userCache.set(userId, fallbackUser);
        return fallbackUser;
    };

    const enrichedItems = await Promise.all(
        items.map(async (item) => {
            const user = await fetchUserData(item.userId);

            const enrichedComments = await Promise.all(
                item.comments.map(async (comment) => {
                    const commentUser = await fetchUserData(comment.userId);
                    return {
                        ...comment,
                        userName: commentUser.name,
                        userAvatarUrl: commentUser.avatar,
                    };
                })
            );

            return {
                ...item,
                type: typeof item.type === 'number'
                    ? (item.type === 0 ? FeedItemType.POST : item.type === 1 ? FeedItemType.EVENT : FeedItemType.POST)
                    : item.type,
                userName: user.name,
                userAvatarUrl: user.avatar,
                comments: enrichedComments,
            };
        })
    );

    return enrichedItems;
}