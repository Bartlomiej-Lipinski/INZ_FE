"use client";

import React, {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from '@mui/material';
import {ArrowLeft, ArrowRight} from 'lucide-react';
import GroupHeader from '@/components/layout/Group-header';
import {FeedItemType} from "@/lib/types/FeedItemType";
import {CommentResponseDto, GroupFeedItemResponseDto} from "@/lib/types/feedDtos";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import AddPostForm from '@/components/feed/addPostForm';
import FeedList from '@/components/feed/feedlist';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {EntityType} from "@/lib/types/entityType";
import {User} from "@/lib/types/user";

const mapFeedItemType = (type: number | string): FeedItemType => {
    if (typeof type === 'string') return type as FeedItemType;

    const typeMap: Record<number, FeedItemType> = {
        0: FeedItemType.POST,
        1: FeedItemType.EVENT,
        2: FeedItemType.CHALLENGE,
        3: FeedItemType.POLL,
        4: FeedItemType.RECOMMENDATION,
        5: FeedItemType.MEMBER,
    };
    return typeMap[type] ?? FeedItemType.POST;
};

type StoredProfilePicture = null | (Partial<NonNullable<User['profilePicture']>> & { id?: string });
type StoredUser = Partial<User> & { birthDate?: string | Date; profilePicture?: StoredProfilePicture };
type CurrentUser = User & { username: string };

const hasProfilePicture = (picture?: StoredProfilePicture): picture is StoredProfilePicture & { id: string } => {
    return Boolean(picture && picture.id);
};

const normalizeStoredUser = (data: StoredUser | null | undefined): CurrentUser | null => {
    if (!data || !data.id || !data.email || !data.name || !data.surname) {
        return null;
    }

    const parsedBirthDate = data.birthDate ? new Date(data.birthDate) : new Date(0);
    const birthDate = Number.isNaN(parsedBirthDate.getTime()) ? new Date(0) : parsedBirthDate;

    const profilePicture = hasProfilePicture(data.profilePicture)
        ? {
            id: data.profilePicture.id,
            fileName: data.profilePicture.fileName ?? '',
            contentType: data.profilePicture.contentType ?? '',
            size: data.profilePicture.size ?? 0,
            url: data.profilePicture.url ?? '',
        }
        : null;

    return {
        id: data.id,
        email: data.email,
        username: data.username ?? '',
        name: data.name,
        surname: data.surname,
        birthDate,
        status: data.status ?? null,
        description: data.description ?? null,
        profilePicture,
        isTwoFactorEnabled: data.isTwoFactorEnabled ?? false,
        role: data.role,
    };
};

export default function GroupBoardPage() {
    const searchParams = useSearchParams();
    const [items, setItems] = useState<GroupFeedItemResponseDto[]>([]);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [newComment, setNewComment] = useState<Record<string, string>>({});
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; itemId: string } | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<GroupFeedItemResponseDto | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [isEditing, setIsEditing] = useState(false);


    useEffect(() => {
        const userAuth = localStorage.getItem('auth:user');
        if (!userAuth) {
            return;
        }

        try {
            const rawUser = JSON.parse(userAuth) as StoredUser;
            const normalized = normalizeStoredUser(rawUser);
            if (normalized) {
                setCurrentUser(normalized);
            }
        } catch (error) {
            console.error('Błąd parsowania danych użytkownika:', error);
            setCurrentUser(null);
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
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const payload = data.data as GroupFeedItemResponseDto[];
                    const mappedItems = payload.map(item => ({
                        ...item,
                        type: mapFeedItemType(item.type),
                    }));

                    setItems(mappedItems);
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

        const userReaction = item.reactions.find((r) => r.id === currentUser.id);
        const isRemoving = !!userReaction;

        const previousItems = [...items];

        try {
            setItems(
                items.map((item) => {
                    if (item.id === itemId) {
                        if (isRemoving) {
                            return { ...item, reactions: item.reactions.filter((r) => r.id !== currentUser.id) };
                        } else {
                            return {
                                ...item,
                                reactions: [
                                    ...item.reactions,
                                    {
                                        id: currentUser.id,
                                        name: currentUser.name,
                                        surname: currentUser.surname,
                                        username: currentUser.username,
                                        profilePicture: currentUser.profilePicture ? {
                                            id: currentUser.profilePicture.id,
                                            fileName: currentUser.profilePicture.fileName || '',
                                            contentType: currentUser.profilePicture.contentType || '',
                                            size: currentUser.profilePicture.size || 0,
                                        } : undefined,
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
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Błąd reakcji');
            }
        } catch (error) {
            console.error('Błąd:', error);
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
            user: {
                id: currentUser.id,
                name: currentUser.name,
                surname: currentUser.surname,
                username: currentUser.username,
                profilePicture: currentUser.profilePicture ? {
                    id: currentUser.profilePicture.id,
                    fileName: currentUser.profilePicture.fileName || '',
                    contentType: currentUser.profilePicture.contentType || '',
                    size: currentUser.profilePicture.size || 0,
                } : undefined,
            },
            content,
            createdAt: new Date().toISOString(),
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

        setNewComment((prev) => ({ ...prev, [itemId]: '' }));

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.POST_COMMENT}?groupId=${groupData.id}&targetId=${itemId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ content, entityType: "GroupFeedItem" }),
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

            setNewComment((prev) => ({ ...prev, [itemId]: content }));
        }
    };


    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
        setMenuAnchor({ el: event.currentTarget, itemId });
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const handleEditPost = () => {
        if (!menuAnchor) return;

        const post = items.find(item => item.id === menuAnchor.itemId);
        if (post) {
            setEditingPost(post);
            setEditContent(post.description || '');
            setEditTitle(post.title || '');
            setEditDialogOpen(true);
        }
        handleCloseMenu();
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setEditingPost(null);
        setEditContent('');
        setEditTitle('');
    };

    const handleEditSubmit = async () => {
        if (!editingPost || !editContent.trim()) return;

        setIsEditing(true);
        const previousItems = [...items];

        // Optymistyczna aktualizacja
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === editingPost.id
                    ? { ...item, description: editContent, title: editTitle || undefined }
                    : item
            )
        );

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.PUT_FEED_ITEM}?groupId=${groupData.id}&feedItemId=${editingPost.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        description: editContent,
                        title: editTitle || null,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas edycji posta');
            }

            handleEditDialogClose();
        } catch (error) {
            console.error('Błąd podczas edycji posta:', error);
            setItems(previousItems);
        } finally {
            setIsEditing(false);
        }
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
                    headers: { 'Content-Type': 'application/json' },
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
                <Typography>Ładowanie danych...</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <GroupHeader
                title={groupData?.name?.trim() || "Tablica grupy"}
            />

            <Box sx={{ width: "90%", maxWidth: 700 }}>
                <AddPostForm
                    user={currentUser}
                    groupColor={groupColor}
                    groupId={groupData.id}
                    onAddPost={(newItem) => {
                        const tempPost: GroupFeedItemResponseDto = {
                            ...newItem,
                            id: newItem.id || `temp-${Date.now()}`,
                            user: {
                                id: currentUser.id,
                                name: currentUser.name,
                                surname: currentUser.surname,
                                username: currentUser.username,
                                profilePicture: currentUser.profilePicture ? {
                                    id: currentUser.profilePicture.id,
                                    fileName: currentUser.profilePicture.fileName || '',
                                    contentType: currentUser.profilePicture.contentType || '',
                                    size: currentUser.profilePicture.size || 0,
                                } : undefined,
                            },
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
                    onCommentChange={(id, value) => setNewComment({ ...newComment, [id]: value })}
                    onAddComment={handleAddComment}
                    menuAnchor={menuAnchor}
                    onCloseMenu={handleCloseMenu}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                />
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 2, gap: 1}}>
                    <Button
                        variant="outlined"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        sx={{bgcolor: groupColor, color: 'white'}}
                        title="Poprzednia strona"
                    >
                        <ArrowLeft size={20}/>
                    </Button>
                    <Typography sx={{alignSelf: 'center'}}>{page}</Typography>
                    <Button
                        variant="outlined"
                        disabled={items.length < pageSize}
                        onClick={() => setPage(page + 1)}
                        sx={{bgcolor: groupColor, color: 'white'}}
                        title="Następna strona"
                    >
                        <ArrowRight size={20}/>
                    </Button>
                </Box>
            </Box>
            <Dialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Edytuj post</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Tytuł (opcjonalnie)"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        margin="normal"
                        disabled={isEditing}
                    />
                    <TextField
                        fullWidth
                        label="Treść"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        multiline
                        minRows={3}
                        maxRows={6}
                        margin="normal"
                        disabled={isEditing}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose} disabled={isEditing}>
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        disabled={!editContent.trim() || isEditing}
                        sx={{ bgcolor: groupColor }}
                    >
                        {isEditing ? 'Zapisywanie...' : 'Zapisz'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}