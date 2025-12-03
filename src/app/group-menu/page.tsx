"use client";

import React, {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Box, IconButton, Typography} from '@mui/material';
import {Menu as MenuIcon} from 'lucide-react';
import {FeedItemType} from "@/lib/types/FeedItemType";
import {CommentResponseDto, GroupFeedItemResponseDto} from "@/lib/types/feedDtos";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import GroupMenu from '@/components/common/GroupMenu';
import AddPostForm from '@/components/feed/addPostForm';
import FeedList from '@/components/feed/feedlist';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {EntityType} from "@/lib/types/entityType";


export default function GroupBoardPage() {
    const searchParams = useSearchParams();
    const [items, setItems] = useState<GroupFeedItemResponseDto[]>([]);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [newComment, setNewComment] = useState<Record<string, string>>({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [page] = useState(0);
    const [pageSize] = useState(10);
    const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; itemId: string } | null>(null);



    useEffect(() => {
        const userAuth = localStorage.getItem('auth:user');
        if (userAuth) {
            try {
                const userData = JSON.parse(userAuth);
                setCurrentUser({
                    id: userData.id,
                    name: userData.name,
                    avatar: 'https://i.pravatar.cc/150?img=1',
                    // userData.ProfilePIcture.id ||
                });
            } catch (error) {
                console.error('Błąd parsowania danych użytkownika z localStorage:', error);
            }
        }
    }, []);

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

    useEffect(() => {
        const fetchFeedItems = async () => {
            if (!groupData.id) return;
            try {
                const response = await fetchWithAuth(
                    `${API_ROUTES.GET_FEED_ITEMS}?groupId=${groupData.id}&page=${page}&pageSize=${pageSize}`,
                    {
                        method: 'GET',
                        headers: {'Content-Type': 'application/json'},
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const payload = data.data as GroupFeedItemResponseDto[];
                    // const enrichedItems = await enrichItemsWithUserData(payload);
                    setItems(payload);
                } else {
                    console.error('Błąd podczas pobierania feedu nie respons ok');
                    setItems([]);
                }
            } catch (error) {
                console.error('Błąd podczas pobierania feedu:', error);
                setItems([]);
            }
        };
        fetchFeedItems();
    }, [groupData.id, page, pageSize]);

    const groupColor = groupData?.color || '#1976d2';

    const handleLike = async (itemId: string) => {
        if (!currentUser) return;

        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const userReaction = item.reactions.find((r) => r.userId === currentUser.id);
        const isRemoving = !!userReaction;

        const previousItems = [...items];

        try {
            setItems(
                items.map((item) => {
                    if (item.id === itemId) {
                        if (isRemoving) {
                            return {...item, reactions: item.reactions.filter((r) => r.userId !== currentUser.id)};
                        } else {
                            return {
                                ...item,
                                reactions: [
                                    ...item.reactions,
                                    {
                                        id: `temp-${Date.now()}`,
                                        userId: currentUser.id,
                                        userName: currentUser.name,
                                        reactionType: 'Like' as const,
                                        createdAt: new Date().toISOString()
                                    },
                                ],
                            };
                        }
                    }
                    return item;
                })
            );

            const response = await fetchWithAuth(`${API_ROUTES.REACTION_POST}?groupId=${groupData.id}&targetId=${itemId}&entityType=${EntityType.GroupFeedItem}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Błąd podczas zapisywania reakcji');
            }

        } catch (error) {
            console.error('Błąd podczas zapisywania reakcji:', error);
            setItems(previousItems);
        }
    };

    const toggleComments = (itemId: string) => {
        setExpandedComments((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    const handleAddComment = async (itemId: string) => {
        if (!currentUser) return;
        const content = newComment[itemId]?.trim();
        if (!content) return;

        const tempComment: CommentResponseDto = {
            id: `temp-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatarUrl: currentUser.avatar,
        };

        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        reactions: Array.isArray(item.reactions) ? item.reactions : [],
                        comments: Array.isArray(item.comments)
                            ? [...item.comments, tempComment]
                            : [tempComment]
                    }
                    : item
            )
        );

        setNewComment((prev) => ({...prev, [itemId]: ''}));

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.POST_COMMENT}?groupId=${groupData.id}&targetId=${itemId}`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                    body: JSON.stringify({content, entityType: "GroupFeedItem"}),
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas dodawania komentarza');
            }

            const result = await response.json();

            const savedComment: CommentResponseDto = {
                ...tempComment,
                id: result.data,
            };

            setItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === itemId
                        ? {
                            ...item,
                            reactions: Array.isArray(item.reactions) ? item.reactions : [],
                            comments: Array.isArray(item.comments)
                                ? item.comments.map((c) => c.id === tempComment.id ? savedComment : c)
                                : [savedComment]
                        }
                        : item
                )
            );
        } catch (error) {
            console.error('Błąd podczas dodawania komentarza:', error);

            setItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === itemId
                        ? {
                            ...item,
                            reactions: Array.isArray(item.reactions) ? item.reactions : [],
                            comments: Array.isArray(item.comments)
                                ? item.comments.filter((c) => c.id !== tempComment.id)
                                : []
                        }
                        : item
                )
            );

            setNewComment((prev) => ({...prev, [itemId]: content}));
        }
    };


    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
        setMenuAnchor({el: event.currentTarget, itemId});
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const handleEditPost = () => {
        if (!menuAnchor) return;
        console.log('Edytuj post:', menuAnchor.itemId);
        handleCloseMenu();
    };

    const handleDeletePost = async () => {
        if (!menuAnchor) return;

        const itemId = menuAnchor.itemId;
        handleCloseMenu();

        const previousItems = [...items];

        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.DELETE_FEED_ITEM}?groupId=${groupData.id}&feedItemId=${itemId}`,
                {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas usuwania posta');
            }
        } catch (error) {
            console.error('Błąd podczas usuwania posta:', error);
            setItems(previousItems);
        }
    };


    if (!currentUser) {
        return (
            <Box sx={{
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Typography>Ładowanie danych użytkownika...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            px: {xs: 2, sm: 3},
            py: {xs: 3, sm: 4}
        }}>
            <Box sx={{width: "100%", maxWidth: 700}}>
                <Box sx={{display: "flex", alignItems: "center", mb: 4}}>
                    <IconButton onClick={() => setDrawerOpen(true)}
                                sx={{bgcolor: "#8D8C8C", "&:hover": {bgcolor: "#666666"}, mr: 1}}>
                        <MenuIcon/>
                    </IconButton>

                    <Typography variant="h2" sx={{
                        textAlign: "center",
                        color: "text.primary",
                        flex: 1,
                        fontSize: {xs: "1.75rem", sm: "2rem"}
                    }}>
                        {groupData?.name || "Tablica grupy"}
                    </Typography>
                </Box>

                <GroupMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} groupId={groupData.id}
                           groupName={groupData.name} groupColor={groupData.color}/>

                <AddPostForm
                    user={currentUser}
                    groupColor={groupColor}
                    groupId={groupData.id}
                    onAddPost={(newItem) => {
                        const tempPost: GroupFeedItemResponseDto = {
                            ...newItem,
                            id: newItem.id || `temp-${Date.now()}`,
                            userId: currentUser.id,
                            userName: currentUser.name,
                            userAvatarUrl: currentUser.avatar,
                            reactions: [],
                            comments: [],
                            createdAt: new Date().toISOString(),
                            type: newItem.type || FeedItemType.POST,
                            description: newItem.description || '',
                            title: newItem.title,
                            storedFileId: newItem.storedFileId,
                        };

                        setItems((prevItems) => [tempPost, ...prevItems]);
                    }}
                />


                <FeedList
                    items={items}
                    groupColor={groupColor}
                    expandedComments={expandedComments}
                    userId={currentUser.id}
                    onLike={handleLike}
                    onToggleComments={toggleComments}
                    onOpenMenu={handleOpenMenu}
                    newComment={newComment}
                    onCommentChange={(id, value) => setNewComment({...newComment, [id]: value})}
                    onAddComment={handleAddComment}
                    menuAnchor={menuAnchor}
                    onCloseMenu={handleCloseMenu}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                />
            </Box>
        </Box>
    );
}