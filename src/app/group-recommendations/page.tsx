"use client";

import React, {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    Link as MuiLink,
    Menu,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {alpha} from '@mui/material/styles';
import {
    Edit2,
    ExternalLink,
    Heart,
    Image as ImageIcon,
    MessageCircle,
    MoreVertical,
    Plus,
    Send,
    Star,
    Trash2,
    X,
} from 'lucide-react';
import GroupHeader from '@/components/layout/Group-header';
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {EntityType} from "@/lib/types/entityType";
import {CommentResponseDto, RecommendationResponseDto, UserResponseDto} from "@/lib/types/recommendationDtos";
import {useImageUrl} from "@/hooks/useImageUrl";

const CATEGORIES = [
    'Książki',
    'Filmy',
    'Seriale',
    'Muzyka',
    'Gry',
    'Aplikacje',
    'Restauracje',
    'Podróże',
    'Inne',
];

function formatTimestamp(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h temu`;
    if (diffDays < 7) return `${diffDays}d temu`;
    return date.toLocaleDateString('pl-PL');
}

function getCategoryColor(category?: string): string {
    const colors: Record<string, string> = {
        'Książki': '#4caf50',
        'Filmy': '#ff9800',
        'Seriale': '#2196f3',
        'Muzyka': '#e91e63',
        'Gry': '#9c27b0',
        'Aplikacje': '#00bcd4',
        'Restauracje': '#ff5722',
        'Podróże': '#fff200',
    };
    return colors[category || ''] || '#757575';
}

function UserAvatar({ user, size, groupColor }: { user?: UserResponseDto; size: number; groupColor?: string }) {
    const avatarUrl = useImageUrl(user?.profilePicture?.id);
    const displayName = user
        ? `${user.name} ${user.surname}`.trim() || user.username
        : 'Nieznany';

    return (
        <Avatar
            src={avatarUrl || undefined}
            title={displayName}
            sx={{
                width: size,
                height: size,
                bgcolor: groupColor || 'grey.500'
            }}
        >
            {user?.name?.[0]?.toUpperCase() || '?'}
        </Avatar>
    );
}

function ReactionAvatar({ user, index }: { user: UserResponseDto; index: number }) {
    const avatarUrl = useImageUrl(user.profilePicture?.id);
    const displayName = `${user.name} ${user.surname}`.trim() || user.username;

    return (
        <Avatar
            src={avatarUrl || undefined}
            title={displayName}
            sx={{
                width: 28,
                height: 28,
                border: '2px solid',
                borderColor: 'background.paper',
                ml: index === 0 ? 0 : -1.1,
                zIndex: 10 - index,
                boxShadow: 1,
            }}
        >
            {user.name?.[0]?.toUpperCase() || '?'}
        </Avatar>
    );
}

function CommentItem({ comment }: { comment: CommentResponseDto }) {
    const avatarUrl = useImageUrl(comment.user?.profilePicture?.id);
    const displayName = comment.user
        ? `${comment.user.name} ${comment.user.surname}`.trim() || comment.user.username
        : 'Nieznany użytkownik';

    return (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <Avatar src={avatarUrl || undefined} sx={{ width: 32, height: 32 }}>
                {comment.user?.name?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
                <Box sx={{ bgcolor: alpha('#fff', 0.05), borderRadius: 2, p: 1.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
                        {displayName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem' }}>{comment.content}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5, ml: 1.5 }}>
                    {formatTimestamp(comment.createdAt)}
                </Typography>
            </Box>
        </Box>
    );
}

function RecommendationImage({storedFileId, alt, sx}: { storedFileId?: string; alt: string; sx?: any }) {
    const imageUrl = useImageUrl(storedFileId);
    return imageUrl ? (
        <CardMedia
            component="img"
            image={imageUrl}
            alt={alt}
            sx={sx}
        />
    ) : null;
}

const ensureArray = <T,>(value: unknown): T[] => Array.isArray(value) ? value : [];

const isRecommendationDto = (value: unknown): value is RecommendationResponseDto => {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const rec = value as RecommendationResponseDto;
    return typeof rec.id === 'string'
        && typeof rec.title === 'string'
        && typeof rec.content === 'string'
        && typeof rec.createdAt === 'string'
        && !!rec.user;
};

const normalizeRecommendation = (rec: RecommendationResponseDto): RecommendationResponseDto => ({
    ...rec,
    comments: ensureArray<CommentResponseDto>(rec?.comments),
    reactions: ensureArray<UserResponseDto>(rec?.reactions),
});

const normalizeRecommendations = (items: unknown): RecommendationResponseDto[] => {
    if (!Array.isArray(items)) {
        return [];
    }
    return items.map((item) => normalizeRecommendation(item as RecommendationResponseDto));
};

function RecommendationsPageContent() {
    const searchParams = useSearchParams();
    const [recommendations, setRecommendations] = useState<RecommendationResponseDto[]>([]);
    const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationResponseDto | null>(null);
    const [isDetailView, setIsDetailView] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingRecommendation, setEditingRecommendation] = useState<RecommendationResponseDto | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; id: string } | null>(null);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [newComment, setNewComment] = useState<Record<string, string>>({});
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);


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
            } catch (error) {
                console.error('Błąd parsowania danych użytkownika:', error);
            }
        }
    }, []);

    const fetchRecommendations = useCallback(async () => {
        if (!groupData.id) return;

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.GET_RECOMMENDATIONS}?groupId=${groupData.id}`,
                { method: 'GET', credentials: 'include' }
            );

            if (response.ok) {
                const data = await response.json();
                const normalized = normalizeRecommendations(data?.data);
                setRecommendations(normalized);
            } else {
                console.error('Błąd podczas pobierania rekomendacji');
                setRecommendations([]);
            }
        } catch (error) {
            console.error('Błąd podczas pobierania rekomendacji:', error);
            setRecommendations([]);
        }
    }, [groupData.id]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        imageUrl: '',
        linkUrl: '',
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleOpenAddDialog = () => {
        setFormData({ title: '', content: '', category: '', imageUrl: '', linkUrl: '' });
        setPreviewUrl(null);
        setAddDialogOpen(true);
    };

    const availableCategories = useMemo(() => {
        const cats = new Set<string>();
        recommendations.forEach(rec => {
            if (rec.category) cats.add(rec.category);
        });
        return Array.from(cats);
    }, [recommendations]);

    const handleOpenEditDialog = (rec: RecommendationResponseDto) => {
        setEditingRecommendation(rec);
        setFormData({
            title: rec.title,
            content: rec.content,
            category: rec.category || '',
            imageUrl: rec.storedFileId || '',
            linkUrl: rec.linkUrl || '',
        });
        setPreviewUrl(rec.storedFileId || null);
        setEditDialogOpen(true);
        handleCloseMenu();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
                setFormData(prev => ({ ...prev, imageUrl: '' }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCloseMenu = () => setMenuAnchor(null);

    const handleAddRecommendation = async () => {
        if (!currentUser || !formData.title.trim() || !formData.content.trim()) return;

        const tempId = `temp-${Date.now()}`;
        const newRec: RecommendationResponseDto = {
            id: tempId,
            title: formData.title,
            content: formData.content,
            category: formData.category || undefined,
            storedFileId: previewUrl || formData.imageUrl || undefined,
            linkUrl: formData.linkUrl || undefined,
            createdAt: new Date().toISOString(),
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
            comments: [],
            reactions: [],
        };

        setRecommendations(prevRecs => [newRec, ...prevRecs]);
        setAddDialogOpen(false);

        const savedFormData = { ...formData };
        const savedSelectedFile = selectedFile;

        setFormData({ title: '', content: '', category: '', imageUrl: '', linkUrl: '' });
        setPreviewUrl(null);
        setSelectedFile(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', savedFormData.title);
            formDataToSend.append('content', savedFormData.content);
            if (savedFormData.category) {
                formDataToSend.append('category', savedFormData.category);
            }
            if (savedFormData.linkUrl) {
                formDataToSend.append('linkUrl', savedFormData.linkUrl);
            }
            if (savedSelectedFile) {
                formDataToSend.append('file', savedSelectedFile);
            } else if (savedFormData.imageUrl) {
                formDataToSend.append('imageUrl', savedFormData.imageUrl);
            }

            const response = await fetchWithAuth(`${API_ROUTES.POST_RECOMMENDATIONS}?groupId=${groupData.id}`,
                {
                    method: 'POST',
                    body: formDataToSend,
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas dodawania rekomendacji');
            }

            const result = await response.json();
            const candidate = result?.data ?? result;

            if (isRecommendationDto(candidate)) {
                const normalizedRecommendation = normalizeRecommendation(candidate);
                setRecommendations(prevRecs =>
                    prevRecs.map(rec =>
                        rec.id === tempId ? normalizedRecommendation : rec
                    )
                );
            } else {
                await fetchRecommendations();
            }
        } catch (error) {
            console.error('Błąd podczas dodawania rekomendacji:', error);
            setRecommendations(prevRecs => prevRecs.filter(rec => rec.id !== tempId));
        }
    };

    const handleEditRecommendation = async () => {
        if (!editingRecommendation || !formData.title.trim() || !formData.content.trim()) return;

        const previousRecommendations = [...recommendations];
        const recId = editingRecommendation.id;

        setRecommendations(prevRecs =>
            prevRecs.map(rec =>
                rec.id === recId
                    ? {
                        ...rec,
                        title: formData.title,
                        content: formData.content,
                        category: formData.category || undefined,
                        storedFileId: previewUrl || formData.imageUrl || undefined,
                        linkUrl: formData.linkUrl || undefined,
                    }
                    : rec
            )
        );

        if (selectedRecommendation?.id === recId) {
            setSelectedRecommendation(prev => prev ? {
                ...prev,
                title: formData.title,
                content: formData.content,
                category: formData.category || undefined,
                imageUrl: previewUrl || formData.imageUrl || undefined,
                linkUrl: formData.linkUrl || undefined,
            } : null);
        }

        setEditDialogOpen(false);
        setEditingRecommendation(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('content', formData.content);
            if (formData.category) {
                formDataToSend.append('category', formData.category);
            }
            if (formData.linkUrl) {
                formDataToSend.append('linkUrl', formData.linkUrl);
            }
            if (selectedFile) {
                formDataToSend.append('file', selectedFile);
            } else if (formData.imageUrl) {
                formDataToSend.append('imageUrl', formData.imageUrl);
            }

            const response = await fetchWithAuth(
                `${API_ROUTES.PUT_RECOMMENDATIONS}?groupId=${groupData.id}&recommendationId=${recId}`,
                {
                    method: 'PUT',
                    body: formDataToSend,
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas edycji rekomendacji');
            }

            setFormData({ title: '', content: '', category: '', imageUrl: '', linkUrl: '' });
            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('Błąd podczas edycji rekomendacji:', error);
            setRecommendations(previousRecommendations);
            if (selectedRecommendation?.id === recId) {
                const originalRec = previousRecommendations.find(r => r.id === recId);
                setSelectedRecommendation(originalRec || null);
            }
        }
    };

    const handleDeleteRecommendation = async () => {
        if (!menuAnchor) return;

        const recId = menuAnchor.id;
        handleCloseMenu();

        const previousRecommendations = [...recommendations];

        setRecommendations(prevRecs => prevRecs.filter(rec => rec.id !== recId));

        if (isDetailView && selectedRecommendation?.id === recId) {
            setIsDetailView(false);
            setSelectedRecommendation(null);
        }

        try {
            const response = await fetchWithAuth(`${API_ROUTES.DELETE_RECOMMENDATIONS}?groupId=${groupData.id}&recommendationId=${recId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas usuwania rekomendacji');
            }
        } catch (error) {
            console.error('Błąd podczas usuwania rekomendacji:', error);
            setRecommendations(previousRecommendations);
        }
    };

    const handleToggleLike = async (recId: string) => {
        if (!currentUser) return;

        const rec = recommendations.find(r => r.id === recId);
        if (!rec) return;

        const userReaction = ensureArray<UserResponseDto>(rec.reactions).find(r => r.id === currentUser.id);
        const isRemoving = !!userReaction;

        const previousRecommendations = [...recommendations];

        try {
            setRecommendations(prevRecs =>
                prevRecs.map(r => {
                    if (r.id === recId) {
                        const safeReactions = ensureArray<UserResponseDto>(r.reactions);
                        if (isRemoving) {
                            return {
                                ...r,
                                reactions: safeReactions.filter(reaction => reaction.id !== currentUser.id)
                            };
                        } else {
                            return {
                                ...r,
                                reactions: [...safeReactions,
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
                    return r;
                })
            );

            const response = await fetchWithAuth(
                `${API_ROUTES.REACTION_POST}?groupId=${groupData.id}&targetId=${recId}&entityType=${EntityType.Recommendation}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas zapisywania reakcji');
            }
        } catch (error) {
            console.error('Błąd podczas zapisywania reakcji:', error);
            setRecommendations(previousRecommendations);
        }
    };

    const handleAddComment = async (recId: string) => {
        if (!currentUser) return;
        const content = newComment[recId]?.trim();
        if (!content) return;

        const tempComment: CommentResponseDto = {
            id: `temp-${Date.now()}`,
            user: {
                id: currentUser.id,
                name: currentUser.name,
                surname: currentUser.surname,
                username: currentUser.username,
                profilePicture: currentUser.profilePicture?.id
                    ? {
                        id: currentUser.profilePicture.id,
                        fileName: currentUser.profilePicture.fileName || '',
                        contentType: currentUser.profilePicture.contentType || '',
                        size: currentUser.profilePicture.size || 0,
                    }
                    : undefined,
            },
            content,
            createdAt: new Date().toISOString(),
        };


        setRecommendations(prevRecs =>
            prevRecs.map(rec =>
                rec.id === recId
                    ? {
                        ...rec,
                        reactions: Array.isArray(rec.reactions) ? rec.reactions : [],
                        comments: Array.isArray(rec.comments) ? [...rec.comments, tempComment] : [tempComment]
                    }
                    : rec
            )
        );

        setNewComment(prev => ({ ...prev, [recId]: '' }));

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.POST_COMMENT}?groupId=${groupData.id}&targetId=${recId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, entityType: "Recommendation" }),
                    credentials: 'include',
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

            setRecommendations(prevRecs =>
                prevRecs.map(rec =>
                    rec.id === recId
                        ? {
                            ...rec,
                            reactions: Array.isArray(rec.reactions) ? rec.reactions : [],
                            comments: Array.isArray(rec.comments) ? rec.comments.map((c) => c.id == tempComment.id ? savedComment : c) : [savedComment]
                        }
                        : rec
                )
            );
        } catch (error) {
            console.error('Błąd podczas dodawania komentarza:', error);
            setRecommendations(prevRecs =>
                prevRecs.map(rec =>
                    rec.id === recId
                        ? { ...rec, comments: rec.comments.filter(c => c.id !== tempComment.id) }
                        : rec
                )
            );
        }
    };

    const handleDeleteComment = async (recId: string, commentId: string) => {
        const previousRecommendations = [...recommendations];

        // Usuń komentarz lokalnie
        setRecommendations(prevRecs =>
            prevRecs.map(rec =>
                rec.id === recId
                    ? { ...rec, comments: rec.comments.filter(c => c.id !== commentId) }
                    : rec
            )
        );

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.DELETE_COMMENT}?groupId=${groupData.id}&targetId=${recId}&commentId=${commentId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas usuwania komentarza');
            }
        } catch (error) {
            console.error('Błąd podczas usuwania komentarza:', error);
            setRecommendations(previousRecommendations);
        }
    };


    const toggleComments = (recId: string) => {
        setExpandedComments(prev => {
            const next = new Set(prev);
            if (next.has(recId)) {
                next.delete(recId);
            } else {
                next.add(recId);
            }
            return next;
        });
    };

    const hasUserLiked = (rec: RecommendationResponseDto) =>
        ensureArray<UserResponseDto>(rec.reactions).some((r) => r.id === currentUser?.id);

    const isUserRecommendation = (rec: RecommendationResponseDto) => rec.user.id === currentUser?.id;

    const filteredRecommendations = selectedCategory === 'all'
        ? recommendations
        : recommendations.filter(rec => rec.category === selectedCategory);

    const currentUserDto: UserResponseDto | undefined = currentUser ? {
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
    } : undefined;

    const renderRecommendationCard = (rec: RecommendationResponseDto) => {
        const userLiked = hasUserLiked(rec);
        const isOwner = isUserRecommendation(rec);
        const isExpanded = expandedComments.has(rec.id);
        const reactions = ensureArray<UserResponseDto>(rec.reactions);
        const comments = ensureArray<CommentResponseDto>(rec.comments);
        const avatarsToShow = reactions.slice(0, 3);
        const displayName = rec.user
            ? `${rec.user.name} ${rec.user.surname}`.trim() || rec.user.username
            : 'Nieznany użytkownik';

        return (
            <Card key={rec.id} sx={{ bgcolor: 'background.paper', borderRadius: 3, position: 'relative' }}>
                {rec.storedFileId && (
                    <RecommendationImage storedFileId={rec.storedFileId} alt={rec.title}
                                         sx={{height: 200, width: '100%'}}/>
                )}

                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
                            <UserAvatar user={rec.user} size={44} groupColor={groupData.color} />
                            <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                    {displayName}
                                </Typography>
                                <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                                    {formatTimestamp(rec.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                        {isOwner && (
                            <IconButton
                                size="small"
                                onClick={(e) => setMenuAnchor({ el: e.currentTarget, id: rec.id })}
                                sx={{alignSelf: 'flex-start', color: 'white'}}
                            >
                                <MoreVertical />
                            </IconButton>
                        )}
                    </Box>

                    {rec.category && (
                        <Chip
                            label={rec.category}
                            size="small"
                            sx={{
                                mb: 2,
                                bgcolor: alpha(getCategoryColor(rec.category), 0.2),
                                color: getCategoryColor(rec.category),
                                fontWeight: 600,
                            }}
                        />
                    )}

                    <Typography
                        sx={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            mb: 1,
                        }}
                    >
                        {rec.title}
                    </Typography>

                    <Typography sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                        {rec.content}
                    </Typography>

                    {rec.linkUrl && (
                        <MuiLink
                            href={rec.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: groupData.color,
                            }}
                        >
                            <ExternalLink size={16} />
                            Link
                        </MuiLink>
                    )}
                </CardContent>

                <CardActions sx={{ px: 3, pb: 2, gap: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            size="small"
                            startIcon={
                                <Heart
                                    size={18}
                                    style={{
                                        fill: userLiked ? 'white' : 'none',
                                        color: userLiked ? 'white' : 'rgba(255, 255, 255, 0.5)'
                                    }}
                                />
                            }
                            onClick={() => handleToggleLike(rec.id)}
                            sx={{
                                bgcolor: groupData.color,
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: groupData.color,
                                    opacity: 0.9,
                                }
                            }}
                        >
                            {reactions.length}
                        </Button>

                        {avatarsToShow.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                {avatarsToShow.map((user, i) => (
                                    <ReactionAvatar key={user.id} user={user} index={i} />
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Button
                        size="small"
                        startIcon={<MessageCircle size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                        onClick={() => toggleComments(rec.id)}
                        sx={{
                            bgcolor: groupData.color,
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: groupData.color,
                                opacity: 0.9,
                            }
                        }}
                    >
                        {comments.length}
                    </Button>
                </CardActions>

                <Collapse in={isExpanded}>
                    <Box sx={{ px: 3, pb: 3 }}>
                        <Box sx={{ bgcolor: alpha('#fff', 0.05), borderRadius: 2, p: 2 }}>
                            {comments.map(comment => (
                                <Box key={comment.id} sx={{ position: 'relative' }}>
                                    <CommentItem comment={comment} />
                                    {comment.user?.id === currentUser?.id && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteComment(rec.id, comment.id)}
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                color: 'error.main',
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}
                            <Box sx={{ display: 'flex', gap: 1.5, mt: comments.length > 0 ? 2 : 0 }}>
                                {currentUserDto && (
                                    <UserAvatar user={currentUserDto} size={32} groupColor={groupData.color} />
                                )}
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Dodaj komentarz..."
                                    value={newComment[rec.id] || ''}
                                    onChange={(e) => setNewComment(prev => ({ ...prev, [rec.id]: e.target.value }))}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddComment(rec.id);
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: groupData.color,
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: groupData.color,
                                            },
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleAddComment(rec.id)}
                                                disabled={!newComment[rec.id]?.trim()}
                                                sx={{
                                                    color: groupData.color,
                                                    '&:hover': {
                                                        bgcolor: `${groupData.color}15`,
                                                    }
                                                }}
                                            >
                                                <Send />
                                            </IconButton>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Collapse>
            </Card>
        );
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', }}>
            <GroupHeader
                title="Rekomendacje"
                leftIcon={<Star size={35} color="white" />}
            />

            <Box sx={{ maxWidth: 1200, width: '90%', mx: 'auto' }}>

                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={handleOpenAddDialog}
                    fullWidth
                    sx={{ mb: 3, bgcolor: groupData.color }}
                >
                    Dodaj rekomendację
                </Button>

                <Box sx={{mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap', bgColor: selectedCategory}}>
                    <Chip
                        label="Wszystkie"
                        onClick={() => setSelectedCategory('all')}
                        color={selectedCategory === 'all' ? 'primary' : 'default'}
                    />
                    {availableCategories.map(cat => (
                        <Chip
                            key={cat}
                            label={cat}
                            onClick={() => setSelectedCategory(cat)}
                            sx={{
                                bgcolor: selectedCategory === cat
                                    ? alpha(getCategoryColor(cat), 0.3)
                                    : 'transparent',
                                color: getCategoryColor(cat),
                                borderColor: getCategoryColor(cat),
                                border: '1px solid',
                            }}
                        />
                    ))}
                </Box>

                <Grid container spacing={3}>
                    {filteredRecommendations.map(rec => (
                        <Grid xs={12} md={4} key={rec.id}>
                        {renderRecommendationCard(rec)}
                        </Grid>
                    ))}
                </Grid>

                <Menu anchorEl={menuAnchor?.el} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
                    <MenuItem onClick={() => {
                        const rec = recommendations.find(r => r.id === menuAnchor?.id);
                        if (rec) handleOpenEditDialog(rec);
                    }}>
                        <Edit2 size={18} style={{ marginRight: 8 }} /> Edytuj
                    </MenuItem>
                    <MenuItem onClick={handleDeleteRecommendation} sx={{ color: 'error.main' }}>
                        <Trash2 size={18} style={{ marginRight: 8 }} /> Usuń
                    </MenuItem>
                </Menu>

                {/* Dialog dodawania */}
                <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Dodaj rekomendację</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Tytuł"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            sx={{
                                mb: 2,
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Treść"
                            multiline
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                }
                            }}
                        />
                        <FormControl fullWidth sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupData.color,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupData.color,
                                },
                            }
                        }}>
                            <InputLabel>Kategoria</InputLabel>
                            <Select
                                value={formData.category}
                                label="Kategoria"
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            >
                                {CATEGORIES.map(cat => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Link (opcjonalnie)"
                            value={formData.linkUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                }
                            }}
                        />
                        <Box sx={{ mb: 2 }}>
                            <input
                                type="file"
                                accept="image/*"
                                id="image-upload"
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="image-upload">
                                <Button
                                    component="span"
                                    startIcon={<ImageIcon size={18} />}
                                    sx={{bgcolor: groupData.color}}
                                >
                                    Dodaj zdjęcie
                                </Button>
                            </label>
                        </Box>
                        {previewUrl && (
                            <Box sx={{ position: 'relative', mb: 2 }}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setPreviewUrl(null);
                                        setSelectedFile(null);
                                    }}
                                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                                >
                                    <X size={16} />
                                </IconButton>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setAddDialogOpen(false)} sx={{bgcolor: 'error.main'}}>Anuluj</Button>
                        <Button
                            variant="contained"
                            onClick={handleAddRecommendation}
                            disabled={!formData.title.trim() || !formData.content.trim()}
                            sx={{ bgcolor: groupData.color }}
                        >
                            Dodaj
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog edycji */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Edytuj rekomendację</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Tytuł"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            sx={{
                                mb: 2,
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Treść"
                            multiline
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                }
                            }}
                        />
                        <FormControl fullWidth sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupData.color,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupData.color,
                                },
                            }
                        }}>
                            <InputLabel>Kategoria</InputLabel>
                            <Select
                                value={formData.category}
                                label="Kategoria"
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            >
                                {CATEGORIES.map(cat => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Link (opcjonalnie)"
                            value={formData.linkUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: groupData.color,
                                    },
                                }
                            }}
                        />
                        <Box sx={{ mb: 2 }}>
                            <input
                                type="file"
                                accept="image/*"
                                id="image-upload-edit"
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="image-upload-edit">
                                <Button
                                    component="span"
                                    startIcon={<ImageIcon size={18} />}
                                    sx={{bgcolor: groupData.color}}
                                >
                                    Zmień zdjęcie
                                </Button>
                            </label>
                        </Box>
                        {previewUrl && (
                            <Box sx={{ position: 'relative', mb: 2 }}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setPreviewUrl(null);
                                        setSelectedFile(null);
                                    }}
                                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                                >
                                    <X size={16} />
                                </IconButton>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setEditDialogOpen(false)} sx={{bgcolor: 'error.main'}}>Anuluj</Button>
                        <Button
                            variant="contained"
                            onClick={handleEditRecommendation}
                            disabled={!formData.title.trim() || !formData.content.trim()}
                            sx={{ bgcolor: groupData.color }}
                        >
                            Zapisz
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}

export default function RecommendationsPage() {
    return (
        <Suspense fallback={<div>Ładowanie...</div>}>
            <RecommendationsPageContent />
        </Suspense>
    );
}

