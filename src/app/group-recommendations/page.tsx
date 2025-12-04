"use client";

import React, {useEffect, useMemo, useState} from 'react';
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
    Grid,
    IconButton,
    InputLabel,
    Link as MuiLink,
    Menu,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {
    ArrowLeft,
    Edit2,
    ExternalLink,
    Heart,
    Image as ImageIcon,
    Link as LinkIcon,
    Menu as MenuIcon,
    MessageCircle,
    MoreVertical,
    Plus,
    Send,
    Trash2,
    X,
} from 'lucide-react';
import GroupMenu from "@/components/common/GroupMenu";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {EntityType} from "@/lib/types/entityType";

// Typy danych
interface ReactionDto {
    userId: string;
}

interface CommentResponseDto {
    id: string;
    userId: string;
    userName?: string;
    userAvatarUrl?: string;
    content: string;
    createdAt: string;
}

interface RecommendationResponseDto {
    id: string;
    title: string;
    content: string;
    category?: string;
    imageUrl?: string;
    linkUrl?: string;
    createdAt: string;
    userId: string;
    comments: CommentResponseDto[];
    reactions: ReactionDto[];
}

// Mock data

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
        'Podróże': '#795548',
    };
    return colors[category || ''] || '#757575';
}

export default function RecommendationsPage() {
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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null);

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
                    name: userData.name,
                    avatar: 'https://i.pravatar.cc/150?img=1',
                    // userData.ProfilePIcture.id ||
                });
            } catch (error) {
                console.error('Błąd parsowania danych użytkownika z localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!groupData.id) return;

            try {
                const response = await fetchWithAuth(
                    `${API_ROUTES.GET_RECOMMENDATIONS}?groupId=${groupData.id}`,
                    {
                        method: 'GET',
                        headers: {'Content-Type': 'application/json'},
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const payload = data.data as RecommendationResponseDto[];
                    setRecommendations(payload);
                } else {
                    console.error('Błąd podczas pobierania rekomendacji');
                    setRecommendations([]);
                }
            } catch (error) {
                console.error('Błąd podczas pobierania rekomendacji:', error);
                setRecommendations([]);
            }
        };

        fetchRecommendations();
    }, [groupData.id]);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        imageUrl: '',
        linkUrl: '',
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleOpenAddDialog = () => {
        setFormData({title: '', content: '', category: '', imageUrl: '', linkUrl: ''});
        setPreviewUrl(null);
        setAddDialogOpen(true);
    };

    const handleOpenEditDialog = (rec: RecommendationResponseDto) => {
        setEditingRecommendation(rec);
        setFormData({
            title: rec.title,
            content: rec.content,
            category: rec.category || '',
            imageUrl: rec.imageUrl || '',
            linkUrl: rec.linkUrl || '',
        });
        setPreviewUrl(rec.imageUrl || null);
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
                setFormData(prev => ({...prev, imageUrl: ''}));
            };
            reader.readAsDataURL(file);
        }
    };


    const handleAddRecommendation = async () => {
        if (!currentUser || !formData.title.trim() || !formData.content.trim()) return;

        const tempId = `temp-${Date.now()}`;
        const newRec: RecommendationResponseDto = {
            id: tempId,
            title: formData.title,
            content: formData.content,
            category: formData.category || undefined,
            imageUrl: previewUrl || formData.imageUrl || undefined,
            linkUrl: formData.linkUrl || undefined,
            createdAt: new Date().toISOString(),
            userId: currentUser.id,
            comments: [],
            reactions: [],
        };

        setRecommendations(prevRecs => [newRec, ...prevRecs]);
        setAddDialogOpen(false);

        const savedFormData = {...formData};
        const savedSelectedFile = selectedFile;

        setFormData({title: '', content: '', category: '', imageUrl: '', linkUrl: ''});
        setPreviewUrl(null);
        setSelectedFile(null);

        try {
            const formData = new FormData();
            formData.append('title', savedFormData.title);
            formData.append('content', savedFormData.content);
            if (savedFormData.category) {
                formData.append('category', savedFormData.category);
            }
            if (savedFormData.linkUrl) {
                formData.append('linkUrl', savedFormData.linkUrl);
            }
            if (savedSelectedFile) {
                formData.append('file', savedSelectedFile);
            } else if (savedFormData.imageUrl) {
                formData.append('imageUrl', savedFormData.imageUrl);
            }

            const response = await fetchWithAuth(`${API_ROUTES.POST_RECOMMENDATIONS}?groupId=${groupData.id}`,
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas dodawania rekomendacji');
            }

            const result = await response.json();

            setRecommendations(prevRecs =>
                prevRecs.map(rec =>
                    rec.id === tempId ? {...rec, id: result.data} : rec
                )
            );
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
                        imageUrl: previewUrl || formData.imageUrl || undefined,
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
                    credentials: 'include',
                    body: formDataToSend,
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas edycji rekomendacji');
            }

            setFormData({title: '', content: '', category: '', imageUrl: '', linkUrl: ''});
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

        // Optymistyczna aktualizacja - usuń z listy
        setRecommendations(prevRecs => prevRecs.filter(rec => rec.id !== recId));

        // Jeśli usuwamy aktualnie wybraną rekomendację, wróć do listy
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

        const userReaction = rec.reactions.find(r => r.userId === currentUser.id);
        const isRemoving = !!userReaction;

        const previousRecommendations = [...recommendations];

        try {
            setRecommendations(prevRecs =>
                prevRecs.map(r => {
                    if (r.id === recId) {
                        if (isRemoving) {
                            return {
                                ...r,
                                reactions: r.reactions.filter(reaction => reaction.userId !== currentUser.id)
                            };
                        } else {
                            return {
                                ...r,
                                reactions: [...r.reactions, {userId: currentUser.id}],
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
                    headers: {'Content-Type': 'application/json'},
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
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatarUrl: currentUser.avatar,
            content,
            createdAt: new Date().toISOString(),
        };

        setRecommendations(prevRecs =>
            prevRecs.map(rec =>
                rec.id === recId
                    ? {...rec, comments: [...rec.comments, tempComment]}
                    : rec
            )
        );

        setNewComment(prev => ({...prev, [recId]: ''}));

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.POST_COMMENT}?groupId=${groupData.id}&targetId=${recId}`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                    body: JSON.stringify({content, entityType: "Recommendation"}),
                }
            );

            if (!response.ok) {
                throw new Error('Błąd podczas dodawania komentarza');
            }

            const result = await response.json();

            setRecommendations(prevRecs =>
                prevRecs.map(rec =>
                    rec.id === recId
                        ? {
                            ...rec,
                            comments: rec.comments.map(c =>
                                c.id === tempComment.id ? {...c, id: result.data} : c
                            ),
                        }
                        : rec
                )
            );
        } catch (error) {
            console.error('Błąd podczas dodawania komentarza:', error);
            setRecommendations(prevRecs =>
                prevRecs.map(rec =>
                    rec.id === recId
                        ? {...rec, comments: rec.comments.filter(c => c.id !== tempComment.id)}
                        : rec
                )
            );
            setNewComment(prev => ({...prev, [recId]: content}));
        }
    };


    const handleDeleteComment = (recId: string, commentId: string) => {
        setRecommendations(
            recommendations.map((rec) =>
                rec.id === recId
                    ? {...rec, comments: rec.comments.filter((c) => c.id !== commentId)}
                    : rec
            )
        );
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setMenuAnchor({el: event.currentTarget, id});
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const toggleComments = (recId: string) => {
        setExpandedComments((prev) => {
            const next = new Set(prev);
            if (next.has(recId)) {
                next.delete(recId);
            } else {
                next.add(recId);
            }
            return next;
        });
    };

    const handleViewDetails = (rec: RecommendationResponseDto) => {
        setSelectedRecommendation(rec);
        setIsDetailView(true);
    };

    const handleBackToList = () => {
        setIsDetailView(false);
        setSelectedRecommendation(null);
    };

    // Synchronizuj selectedRecommendation z listą
    useEffect(() => {
        if (selectedRecommendation) {
            const updated = recommendations.find((r) => r.id === selectedRecommendation.id);
            if (updated) {
                setSelectedRecommendation(updated);
            }
        }
    }, [recommendations]);

    const hasUserLiked = (rec: RecommendationResponseDto) =>
        rec.reactions.some((r) => r.userId === currentUser?.id);

    const isUserRecommendation = (rec: RecommendationResponseDto) => rec.userId === currentUser?.id;

    // Filtrowanie rekomendacji
    const filteredRecommendations = selectedCategory === 'all'
        ? recommendations
        : recommendations.filter(rec => rec.category === selectedCategory);

    // Lista rekomendacji
    if (!isDetailView) {
        return (
            <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
                <Box sx={{maxWidth: 1200, mx: 'auto'}}>
                    {/* Nagłówek z wysuwanym menu */}
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                        <IconButton
                            onClick={() => setDrawerOpen(true)}
                            sx={{
                                bgcolor: '#8D8C8C',
                                '&:hover': {bgcolor: '#666666'},
                                mr: 1,
                            }}
                        >
                            <MenuIcon/>
                        </IconButton>

                        <Typography
                            variant="h4"
                            sx={{
                                textAlign: 'center',
                                flex: 1,
                                fontWeight: 600,
                                fontSize: {xs: '1.75rem', sm: '2rem'},
                            }}
                        >
                            Rekomendacje
                        </Typography>
                    </Box>

                    <GroupMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} groupId={groupData.id}
                               groupName={groupData.name} groupColor={groupData.color}/>

                    <Button
                        variant="contained"
                        startIcon={<Plus size={20}/>}
                        onClick={handleOpenAddDialog}
                        fullWidth
                        sx={{
                            bgcolor: groupData.color || 'primary.main',
                            py: 1.5,
                            mb: 3,
                            '&:hover': {
                                bgcolor: groupData.color || 'primary.dark',
                                opacity: 0.9,
                            },
                        }}
                    >
                        Dodaj rekomendację
                    </Button>

                    {/* Filtrowanie po kategoriach */}
                    <Box sx={{mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center'}}>
                        <Typography variant="body2" sx={{fontWeight: 600, mr: 1}}>
                            Kategorie:
                        </Typography>
                        <Chip
                            label="Wszystkie"
                            onClick={() => setSelectedCategory('all')}
                            color={selectedCategory === 'all' ? 'primary' : 'default'}
                            sx={{bgcolor: groupData.color, fontWeight: selectedCategory === 'all' ? 600 : 400}}
                        />
                        {CATEGORIES.map((cat) => {
                            const count = recommendations.filter(r => r.category === cat).length;
                            if (count === 0) return null;

                            return (
                                <Chip
                                    key={cat}
                                    label={`${cat} (${count})`}
                                    onClick={() => setSelectedCategory(cat)}
                                    sx={{
                                        bgcolor: selectedCategory === cat ? alpha(getCategoryColor(cat), 0.2) : undefined,
                                        color: selectedCategory === cat ? getCategoryColor(cat) : undefined,
                                        fontWeight: selectedCategory === cat ? 600 : 400,
                                        borderColor: selectedCategory === cat ? getCategoryColor(cat) : undefined,
                                    }}
                                    variant={selectedCategory === cat ? 'filled' : 'outlined'}
                                />
                            );
                        })}
                    </Box>

                    {filteredRecommendations.length === 0 ? (
                        <Box sx={{textAlign: 'center', py: 8}}>
                            <Typography variant="h6" color="text.secondary">
                                Brak rekomendacji w tej kategorii
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredRecommendations.map((rec) => {
                                const userLiked = hasUserLiked(rec);
                                const isOwner = isUserRecommendation(rec);
                                return (
                                    <Grid size={{xs: 12, sm: 6, md: 4}} key={rec.id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 3,
                                                position: 'relative',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 6,
                                                },
                                            }}
                                            onClick={() => handleViewDetails(rec)}
                                        >
                                            {rec.imageUrl && (
                                                <CardMedia
                                                    component="img"
                                                    height="180"
                                                    image={rec.imageUrl}
                                                    alt={rec.title}
                                                    sx={{objectFit: 'cover'}}
                                                />
                                            )}

                                            {isOwner && (
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        bgcolor: 'rgba(0,0,0,0.6)',
                                                        '&:hover': {bgcolor: 'rgba(0,0,0,0.8)'},
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenMenu(e, rec.id);
                                                    }}
                                                >
                                                    <MoreVertical size={18} color="white"/>
                                                </IconButton>
                                            )}

                                            <CardContent sx={{flexGrow: 1}}>
                                                {rec.category && (
                                                    <Chip
                                                        label={rec.category}
                                                        size="small"
                                                        sx={{
                                                            mb: 1,
                                                            bgcolor: alpha(getCategoryColor(rec.category), 0.2),
                                                            color: getCategoryColor(rec.category),
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                )}

                                                <Typography variant="h6" sx={{mb: 1, fontWeight: 600}}>
                                                    {rec.title}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        mb: 1,
                                                    }}
                                                >
                                                    {rec.content}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary">
                                                    {formatTimestamp(rec.createdAt)}
                                                </Typography>
                                            </CardContent>

                                            <CardActions sx={{px: 2, pb: 2}}>
                                                <Button
                                                    size="small"
                                                    startIcon={
                                                        <Heart
                                                            size={18}
                                                            style={{
                                                                fill: userLiked ? '#e91e63' : 'none',
                                                                color: userLiked ? '#e91e63' : undefined,
                                                            }}
                                                        />
                                                    }
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleLike(rec.id);
                                                    }}
                                                    sx={{color: userLiked ? '#e91e63' : 'text.secondary'}}
                                                >
                                                    {rec.reactions.length}
                                                </Button>

                                                <Button
                                                    size="small"
                                                    startIcon={<MessageCircle size={18}/>}
                                                    sx={{color: 'text.secondary'}}
                                                >
                                                    {rec.comments.length}
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}

                    {/* Dialog dodawania */}
                    <Dialog
                        open={addDialogOpen}
                        onClose={() => setAddDialogOpen(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Dodaj rekomendację</DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                label="Tytuł"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                sx={{mt: 2, mb: 2}}
                            />

                            <TextField
                                fullWidth
                                label="Treść"
                                multiline
                                rows={4}
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                sx={{mb: 2}}
                            />

                            <FormControl fullWidth sx={{mb: 2}}>
                                <InputLabel>Kategoria</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Kategoria"
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <MenuItem value="">Brak</MenuItem>
                                    {CATEGORIES.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            {cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Link"
                                placeholder="https://..."
                                value={formData.linkUrl}
                                onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                                sx={{mb: 2}}
                                InputProps={{
                                    startAdornment: <LinkIcon size={18} style={{marginRight: 8}}/>,
                                }}
                            />

                            <Box sx={{mb: 2}}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<ImageIcon/>}
                                    fullWidth
                                >
                                    Dodaj zdjęcie
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                </Button>
                            </Box>

                            {previewUrl && (
                                <Box sx={{position: 'relative', mb: 2}}>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        style={{
                                            width: '100%',
                                            maxHeight: 300,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            bgcolor: 'rgba(0,0,0,0.6)',
                                            '&:hover': {bgcolor: 'rgba(0,0,0,0.8)'},
                                        }}
                                        onClick={() => {
                                            setPreviewUrl(null);
                                        }}
                                    >
                                        <X size={20} color="white"/>
                                    </IconButton>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{px: 3, pb: 2}}>
                            <Button onClick={() => setAddDialogOpen(false)}>Anuluj</Button>
                            <Button
                                variant="contained"
                                onClick={handleAddRecommendation}
                                disabled={!formData.title.trim() || !formData.content.trim()}
                            >
                                Dodaj
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>

                {/* Menu opcji */}
                <Menu
                    anchorEl={menuAnchor?.el}
                    open={Boolean(menuAnchor)}
                    onClose={handleCloseMenu}
                >
                    <MenuItem
                        onClick={() => {
                            const rec = recommendations.find((r) => r.id === menuAnchor?.id);
                            if (rec) handleOpenEditDialog(rec);
                        }}
                    >
                        <Edit2 size={18} style={{marginRight: 8}}/>
                        Edytuj
                    </MenuItem>
                    <MenuItem onClick={handleDeleteRecommendation} sx={{color: 'error.main'}}>
                        <Trash2 size={18} style={{marginRight: 8}}/>
                        Usuń
                    </MenuItem>
                </Menu>

                {/* Dialog dodawania */}
                <Dialog
                    open={addDialogOpen}
                    onClose={() => setAddDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Dodaj rekomendację</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Tytuł"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            sx={{mt: 2, mb: 2}}
                        />

                        <TextField
                            fullWidth
                            label="Treść"
                            multiline
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            sx={{mb: 2}}
                        />

                        <FormControl fullWidth sx={{mb: 2}}>
                            <InputLabel>Kategoria</InputLabel>
                            <Select
                                value={formData.category}
                                label="Kategoria"
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <MenuItem value="">Brak</MenuItem>
                                {CATEGORIES.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Link"
                            placeholder="https://..."
                            value={formData.linkUrl}
                            onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                            sx={{mb: 2}}
                            InputProps={{
                                startAdornment: <LinkIcon size={18} style={{marginRight: 8}}/>,
                            }}
                        />

                        <Box sx={{mb: 2}}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<ImageIcon/>}
                                fullWidth
                            >
                                Dodaj zdjęcie
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </Button>
                        </Box>

                        {previewUrl && (
                            <Box sx={{position: 'relative', mb: 2}}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: 300,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        bgcolor: 'rgba(0,0,0,0.6)',
                                        '&:hover': {bgcolor: 'rgba(0,0,0,0.8)'},
                                    }}
                                    onClick={() => {
                                        setPreviewUrl(null);
                                    }}
                                >
                                    <X size={20} color="white"/>
                                </IconButton>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{px: 3, pb: 2}}>
                        <Button onClick={() => setAddDialogOpen(false)}>Anuluj</Button>
                        <Button
                            variant="contained"
                            onClick={handleAddRecommendation}
                            disabled={!formData.title.trim() || !formData.content.trim()}
                        >
                            Dodaj
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog edycji */}
                <Dialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Edytuj rekomendację</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Tytuł"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            sx={{mt: 2, mb: 2}}
                        />

                        <TextField
                            fullWidth
                            label="Treść"
                            multiline
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            sx={{mb: 2}}
                        />

                        <FormControl fullWidth sx={{mb: 2}}>
                            <InputLabel>Kategoria</InputLabel>
                            <Select
                                value={formData.category}
                                label="Kategoria"
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <MenuItem value="">Brak</MenuItem>
                                {CATEGORIES.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Link"
                            placeholder="https://..."
                            value={formData.linkUrl}
                            onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                            sx={{mb: 2}}
                            InputProps={{
                                startAdornment: <LinkIcon size={18} style={{marginRight: 8}}/>,
                            }}
                        />

                        <Box sx={{mb: 2}}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<ImageIcon/>}
                                fullWidth
                            >
                                Zmień zdjęcie
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </Button>
                        </Box>

                        {previewUrl && (
                            <Box sx={{position: 'relative', mb: 2}}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: 300,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        bgcolor: 'rgba(0,0,0,0.6)',
                                        '&:hover': {bgcolor: 'rgba(0,0,0,0.8)'},
                                    }}
                                    onClick={() => {
                                        setPreviewUrl(null);
                                    }}
                                >
                                    <X size={20} color="white"/>
                                </IconButton>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{px: 3, pb: 2}}>
                        <Button onClick={() => setEditDialogOpen(false)}>Anuluj</Button>
                        <Button
                            variant="contained"
                            onClick={handleEditRecommendation}
                            disabled={!formData.title.trim() || !formData.content.trim()}
                        >
                            Zapisz
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    // Widok szczegółów rekomendacji
    const rec = selectedRecommendation!;
    const userLiked = hasUserLiked(rec);
    const isOwner = isUserRecommendation(rec);
    const isExpanded = expandedComments.has(rec.id);

    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                {/* Nagłówek z przyciskiem powrotu i menu */}
                <Box sx={{display: 'flex', alignItems: 'center', mb: 3, gap: 1}}>
                    <IconButton
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                            bgcolor: '#8D8C8C',
                            '&:hover': {bgcolor: '#666666'},
                        }}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <Button
                        startIcon={<ArrowLeft/>}
                        onClick={handleBackToList}
                    >
                        Powrót do listy
                    </Button>
                </Box>


                <Card sx={{borderRadius: 3}}>
                    {rec.imageUrl && (
                        <CardMedia
                            component="img"
                            height="400"
                            image={rec.imageUrl}
                            alt={rec.title}
                            sx={{objectFit: 'cover'}}
                        />
                    )}

                    <CardContent sx={{p: 3}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
                            <Box sx={{flex: 1}}>
                                {rec.category && (
                                    <Chip
                                        label={rec.category}
                                        sx={{
                                            mb: 2,
                                            bgcolor: alpha(getCategoryColor(rec.category), 0.2),
                                            color: getCategoryColor(rec.category),
                                            fontWeight: 600,
                                        }}
                                    />
                                )}

                                <Typography variant="h4" sx={{mb: 1, fontWeight: 600}}>
                                    {rec.title}
                                </Typography>

                                <Typography variant="caption" color="text.secondary">
                                    {formatTimestamp(rec.createdAt)}
                                </Typography>
                            </Box>

                            {isOwner && (
                                <IconButton onClick={(e) => handleOpenMenu(e, rec.id)}>
                                    <MoreVertical/>
                                </IconButton>
                            )}
                        </Box>

                        <Typography variant="body1" sx={{whiteSpace: 'pre-wrap', mb: 3}}>
                            {rec.content}
                        </Typography>

                        {rec.linkUrl && (
                            <MuiLink
                                href={rec.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mb: 2,
                                }}
                            >
                                <ExternalLink size={16}/>
                                Otwórz link
                            </MuiLink>
                        )}
                    </CardContent>

                    <CardActions sx={{px: 3, pb: 2, gap: 2}}>
                        <Button
                            startIcon={
                                <Heart
                                    size={20}
                                    style={{
                                        fill: userLiked ? '#e91e63' : 'none',
                                        color: userLiked ? '#e91e63' : undefined,
                                    }}
                                />
                            }
                            onClick={() => handleToggleLike(rec.id)}
                            sx={{color: userLiked ? '#e91e63' : 'text.secondary'}}
                        >
                            {rec.reactions.length}
                        </Button>

                        <Button
                            startIcon={<MessageCircle size={20}/>}
                            onClick={() => toggleComments(rec.id)}
                            sx={{color: 'text.secondary'}}
                        >
                            {rec.comments.length}
                        </Button>
                    </CardActions>

                    {/* Sekcja komentarzy */}
                    <Collapse in={isExpanded}>
                        <Box sx={{px: 3, pb: 3}}>
                            <Box sx={{bgcolor: alpha('#fff', 0.05), borderRadius: 2, p: 2}}>
                                {rec.comments.map((comment) => (
                                    <Box key={comment.id} sx={{mb: 2}}>
                                        <Box
                                            sx={{
                                                bgcolor: alpha('#fff', 0.05),
                                                borderRadius: 2,
                                                p: 2,
                                            }}
                                        >
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                <Typography sx={{fontWeight: 600, fontSize: '0.875rem'}}>
                                                    {comment.userId === currentUser?.id ? 'Ty' : `Użytkownik ${comment.userId}`}
                                                </Typography>
                                                {(comment.userId === currentUser?.id || isOwner) && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteComment(rec.id, comment.id)}
                                                    >
                                                        <Trash2 size={16}/>
                                                    </IconButton>
                                                )}
                                            </Box>
                                            <Typography sx={{fontSize: '0.875rem', mb: 0.5}}>
                                                {comment.content}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatTimestamp(comment.createdAt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}

                                <Box sx={{display: 'flex', gap: 1.5, mt: rec.comments.length > 0 ? 2 : 0}}>
                                    <Avatar sx={{width: 32, height: 32}}>U</Avatar>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Dodaj komentarz..."
                                        value={newComment[rec.id] || ''}
                                        onChange={(e) => setNewComment({...newComment, [rec.id]: e.target.value})}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment(rec.id);
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                            },
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleAddComment(rec.id)}
                                                    disabled={!newComment[rec.id]?.trim()}
                                                >
                                                    <Send/>
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Collapse>
                </Card>

                {/* Menu opcji w widoku szczegółów */}
                <Menu
                    anchorEl={menuAnchor?.el}
                    open={Boolean(menuAnchor)}
                    onClose={handleCloseMenu}
                >
                    <MenuItem
                        onClick={() => {
                            handleOpenEditDialog(rec);
                        }}
                    >
                        <Edit2 size={18} style={{marginRight: 8}}/>
                        Edytuj
                    </MenuItem>
                    <MenuItem onClick={handleDeleteRecommendation} sx={{color: 'error.main'}}>
                        <Trash2 size={18} style={{marginRight: 8}}/>
                        Usuń
                    </MenuItem>
                </Menu>

                {/* Dialog edycji w widoku szczegółów */}
                <Dialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Edytuj rekomendację</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Tytuł"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            sx={{mt: 2, mb: 2}}
                        />

                        <TextField
                            fullWidth
                            label="Treść"
                            multiline
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            sx={{mb: 2}}
                        />

                        <FormControl fullWidth sx={{mb: 2}}>
                            <InputLabel>Kategoria</InputLabel>
                            <Select
                                value={formData.category}
                                label="Kategoria"
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <MenuItem value="">Brak</MenuItem>
                                {CATEGORIES.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Link"
                            placeholder="https://..."
                            value={formData.linkUrl}
                            onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                            sx={{mb: 2}}
                            InputProps={{
                                startAdornment: <LinkIcon size={18} style={{marginRight: 8}}/>,
                            }}
                        />

                        <Box sx={{mb: 2}}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<ImageIcon/>}
                                fullWidth
                            >
                                Zmień zdjęcie
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </Button>
                        </Box>

                        {previewUrl && (
                            <Box sx={{position: 'relative', mb: 2}}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: 300,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        bgcolor: 'rgba(0,0,0,0.6)',
                                        '&:hover': {bgcolor: 'rgba(0,0,0,0.8)'},
                                    }}
                                    onClick={() => {
                                        setPreviewUrl(null);
                                    }}
                                >
                                    <X size={20} color="white"/>
                                </IconButton>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{px: 3, pb: 2}}>
                        <Button onClick={() => setEditDialogOpen(false)}>Anuluj</Button>
                        <Button
                            variant="contained"
                            onClick={handleEditRecommendation}
                            disabled={!formData.title.trim() || !formData.content.trim()}
                        >
                            Zapisz
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}
