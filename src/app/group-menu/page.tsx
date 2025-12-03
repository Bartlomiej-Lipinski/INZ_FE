"use client";

import React, {useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {
    Bell,
    Calendar,
    CalendarDays,
    CheckSquare,
    ChevronRight,
    Coffee,
    DollarSign,
    Edit2,
    Gamepad2,
    Heart,
    ImagePlus,
    Images,
    Menu as MenuIcon,
    MessageCircle,
    MoreVertical,
    Notebook,
    PieChart,
    Send,
    Settings,
    Star,
    Trash2,
    Trophy,
    Users,
    X,
} from 'lucide-react';
import {FeedItemType} from "@/lib/types/FeedItemType";
import {CommentResponseDto, GroupFeedItemResponseDto} from "@/lib/types/feedDtos";

// Mock dane
const MOCK_USER = {
    id: 'user-1',
    name: 'Ja',
    avatar: 'https://i.pravatar.cc/150?img=1',
};

const MOCK_ITEMS: GroupFeedItemResponseDto[] = [
    {
        id: '1',
        type: FeedItemType.POST,
        description: 'Świetnie się dziś bawiłam na naszym spotkaniu! 🎉',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        userId: 'user-2',
        userName: 'Anna Kowalska',
        userAvatarUrl: 'https://i.pravatar.cc/150?img=2',
        storedFileId: 'file-1',
        comments: [
            {
                id: 'c1',
                content: 'Ja też! Super było! 😊',
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                userId: 'user-3',
                userName: 'Jan Nowak',
                userAvatarUrl: 'https://i.pravatar.cc/150?img=3',
            },
        ],
        reactions: [
            {
                id: 'r1',
                userId: 'user-3',
                userName: 'Jan Nowak',
                reactionType: 'Like',
                createdAt: new Date().toISOString()
            },
            {
                id: 'r2',
                userId: 'user-4',
                userName: 'Maria Kowalczyk',
                reactionType: 'Like',
                createdAt: new Date().toISOString()
            },
            {id: 'r5', userId: 'user-5', userName: 'Kasia', reactionType: 'Like', createdAt: new Date().toISOString()},
        ],
    },
    {
        id: '2',
        type: FeedItemType.EVENT,
        title: 'Wspólne grillowanie',
        description: 'Zapraszamy wszystkich na grilla w sobotę!',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        userId: 'system',
        userName: 'System',
        entityId: 'event-1',
        comments: [],
        reactions: [
            {id: 'r3', userId: 'user-1', userName: 'Ja', reactionType: 'Like', createdAt: new Date().toISOString()},
        ],
    },
    {
        id: '3',
        type: FeedItemType.RECOMMENDATION,
        description: 'Polecam ten film - "Incepcja". Naprawdę warto obejrzeć!',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        userId: 'user-4',
        userName: 'Piotr Wiśniewski',
        userAvatarUrl: 'https://i.pravatar.cc/150?img=4',
        entityId: 'recommendation-1',
        comments: [],
        reactions: [],
    },
];

const MENU_ITEMS = [
    {key: 'news', label: 'NOWOŚCI', icon: Bell, href: '/group-menu/news'},
    {key: 'chat', label: 'CZAT', icon: MessageCircle, href: '/group-menu/chat'},
    {key: 'events', label: 'WYDARZENIA', icon: Coffee, href: '/group-menu/events'},
    {key: 'calendar', label: 'KALENDARZ', icon: CalendarDays, href: '/group-menu/calendar'},
    {key: 'settlements', label: 'ROZLICZENIA', icon: DollarSign, href: '/group-menu/settlements'},
    {key: 'recommendations', label: 'REKOMENDACJE', icon: Star, href: '/group-menu/recommendations'},
    {key: 'tasks', label: 'ZADANIA', icon: CheckSquare, href: '/group-menu/tasks'},
    {key: 'albums', label: 'ALBUM', icon: Images, href: '/group-menu/album'},
    {key: 'games', label: 'GRY', icon: Gamepad2, href: '/group-menu/games'},
    {key: 'study', label: 'NAUKA', icon: Notebook, href: '/group-menu/study'},
    {key: 'members', label: 'CZŁONKOWIE', icon: Users, href: '/group-menu/members'},
    {key: 'settings', label: 'OPCJE GRUPY', icon: Settings, href: '/group-menu/settings'},
] as const;

function getItemIcon(type: FeedItemType) {
    switch (type) {
        case FeedItemType.EVENT:
            return Calendar;
        case FeedItemType.CHALLENGE:
            return Trophy;
        case FeedItemType.POLL:
            return PieChart;
        case FeedItemType.RECOMMENDATION:
            return Star;
        default:
            return null;
    }
}

function getItemColor(type: FeedItemType): string {
    switch (type) {
        case FeedItemType.EVENT:
            return '#ff9800';
        case FeedItemType.CHALLENGE:
            return '#f44336';
        case FeedItemType.POLL:
            return '#2196f3';
        case FeedItemType.RECOMMENDATION:
            return '#ffd700';
        default:
            return '#9042fb';
    }
}

function getItemLabel(type: FeedItemType): string {
    switch (type) {
        case FeedItemType.EVENT:
            return 'Wydarzenie';
        case FeedItemType.CHALLENGE:
            return 'Wyzwanie';
        case FeedItemType.POLL:
            return 'Ankieta';
        case FeedItemType.RECOMMENDATION:
            return 'Rekomendacja';
        default:
            return 'Post';
    }
}

function formatTimestamp(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Teraz';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours}h temu`;
    if (diffDays < 7) return `${diffDays}d temu`;
    return date.toLocaleDateString('pl-PL');
}

export default function GroupBoardPage() {
    const searchParams = useSearchParams();
    const [items, setItems] = useState<GroupFeedItemResponseDto[]>(MOCK_ITEMS);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; itemId: string } | null>(null);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [newComment, setNewComment] = useState<Record<string, string>>({});
    const [editDialog, setEditDialog] = useState<{ open: boolean; item: GroupFeedItemResponseDto | null }>({
        open: false,
        item: null,
    });
    const [editContent, setEditContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const groupData = useMemo(() => {
        const groupId = searchParams?.get('groupId') || '';
        const groupName = searchParams?.get('groupName') || '';
        const groupColor = searchParams?.get('groupColor') || '';
        if (!groupId) return null;
        return {
            id: groupId,
            name: decodeURIComponent(groupName),
            color: groupColor ? decodeURIComponent(groupColor) : undefined,
        };
    }, [searchParams]);

    const groupColor = groupData?.color || '#1976d2'; // fallback primary

    const handleAddPost = async () => {
        if (!newPostContent.trim() && !selectedFile) return;

        setIsSubmitting(true);

        const newItem: GroupFeedItemResponseDto = {
            id: Date.now().toString(),
            type: FeedItemType.POST,
            description: newPostContent,
            createdAt: new Date().toISOString(),
            userId: MOCK_USER.id,
            userName: MOCK_USER.name,
            userAvatarUrl: MOCK_USER.avatar,
            storedFileId: selectedFile ? 'file-' + Date.now() : undefined,
            comments: [],
            reactions: [],
        };

        setItems([newItem, ...items]);
        setNewPostContent('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsSubmitting(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageButtonClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            handleFileSelect({target} as React.ChangeEvent<HTMLInputElement>);
        };
        input.click();
    };

    const handleLike = (itemId: string) => {
        setItems(
            items.map((item) => {
                if (item.id === itemId) {
                    const userReaction = item.reactions.find((r) => r.userId === MOCK_USER.id);

                    if (userReaction) {
                        // Usuń reakcję
                        return {
                            ...item,
                            reactions: item.reactions.filter((r) => r.userId !== MOCK_USER.id),
                        };
                    } else {
                        // Dodaj reakcję
                        return {
                            ...item,
                            reactions: [
                                ...item.reactions,
                                {
                                    id: 'r-' + Date.now(),
                                    userId: MOCK_USER.id,
                                    userName: MOCK_USER.name,
                                    reactionType: 'Like',
                                    createdAt: new Date().toISOString(),
                                },
                            ],
                        };
                    }
                }
                return item;
            })
        );
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
        const content = newComment[itemId]?.trim();
        if (!content) return;

        const comment: CommentResponseDto = {
            id: 'c-' + Date.now(),
            content,
            createdAt: new Date().toISOString(),
            userId: MOCK_USER.id,
            userName: MOCK_USER.name,
            userAvatarUrl: MOCK_USER.avatar,
        };

        setItems(items.map((item) => (item.id === itemId ? {...item, comments: [...item.comments, comment]} : item)));

        setNewComment({...newComment, [itemId]: ''});
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
        setMenuAnchor({el: event.currentTarget, itemId});
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const handleEditPost = () => {
        const item = items.find((i) => i.id === menuAnchor?.itemId);
        if (item) {
            setEditContent(item.description || '');
            setEditDialog({open: true, item});
        }
        handleCloseMenu();
    };

    const handleSaveEdit = async () => {
        if (!editDialog.item) return;

        setItems(items.map((item) => (item.id === editDialog.item?.id ? {...item, description: editContent} : item)));
        setEditDialog({open: false, item: null});
    };

    const handleDeletePost = async () => {
        if (!menuAnchor) return;
        setItems(items.filter((item) => item.id !== menuAnchor.itemId));
        handleCloseMenu();
    };

    const isUserPost = (item: GroupFeedItemResponseDto) => item.userId === MOCK_USER.id;
    const hasUserLiked = (item: GroupFeedItemResponseDto) => item.reactions.some((r) => r.userId === MOCK_USER.id && r.reactionType === 'Like');

    // Mock URL dla zdjęć
    const getImageUrl = (storedFileId?: string) => {
        if (!storedFileId) return null;
        return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500';
    };

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                px: {xs: 2, sm: 3},
                py: {xs: 3, sm: 4},
            }}
        >
            <Box sx={{width: '100%', maxWidth: 700}}>
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
                        variant="h2"
                        sx={{
                            textAlign: 'center',
                            color: 'text.primary',
                            flex: 1,
                            fontSize: {xs: '1.75rem', sm: '2rem'},
                        }}
                    >
                        {groupData?.name || 'Tablica grupy'}
                    </Typography>
                </Box>

                <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    <Box sx={{width: 300, p: 2}} role="presentation">
                        <Typography variant="h6" sx={{mb: 2}}>
                            {groupData?.name || 'Menu grupy'}
                        </Typography>
                        <List>
                            {MENU_ITEMS.map((m) => (
                                <ListItem key={m.key} disablePadding>
                                    <ListItemButton sx={{borderRadius: 1}} href={m.href}>
                                        <ListItemIcon>
                                            <m.icon/>
                                        </ListItemIcon>
                                        <ListItemText primary={m.label}/>
                                        <ChevronRight/>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Drawer>

                {/* Pole dodawania posta */}
                <Card
                    sx={{
                        mb: 3,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                    }}
                >
                    <CardContent sx={{pb: 1}}>
                        <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                            <Avatar src={MOCK_USER.avatar} sx={{width: 40, height: 40}}/>
                            <TextField
                                fullWidth
                                multiline
                                minRows={2}
                                maxRows={6}
                                placeholder="Napisz coś do grupy..."
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                variant="outlined"
                                disabled={isSubmitting}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                    },
                                }}
                            />
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
                                        borderRadius: 12,
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
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
                                    }}
                                >
                                    <X size={20} color="white"/>
                                </IconButton>
                            </Box>
                        )}
                    </CardContent>

                    <CardActions sx={{justifyContent: 'space-between', px: 2, pb: 2}}>
                        <IconButton
                            color="primary"
                            onClick={handleImageButtonClick}
                            disabled={isSubmitting}
                            sx={{
                                bgcolor: alpha(groupColor, 0.08),
                                '&:hover': {bgcolor: alpha(groupColor, 0.16)},
                            }}
                        >
                            <ImagePlus/>
                        </IconButton>
                        <Button
                            variant="contained"
                            endIcon={<Send size={18}/>}
                            onClick={handleAddPost}
                            disabled={(!newPostContent.trim() && !selectedFile) || isSubmitting}
                            sx={{
                                bgcolor: groupColor,
                                '&:hover': {bgcolor: alpha(groupColor, 0.85)},
                            }}
                        >
                            {isSubmitting ? 'Publikowanie...' : 'Opublikuj'}
                        </Button>
                    </CardActions>
                </Card>

                {/* Lista postów */}
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    {items.map((item) => {
                        const ItemIcon = getItemIcon(item.type);
                        const isExpanded = expandedComments.has(item.id);
                        const imageUrl = getImageUrl(item.storedFileId);
                        const userLiked = hasUserLiked(item);

                        // avatars to show near like button (pierwsi trzej reakcjonariusze)
                        const avatarsToShow = item.reactions.slice(0, 3).map((r, i) => ({
                            id: r.userId,
                            name: r.userName,
                            picture: `https://i.pravatar.cc/150?u=${r.userId}`,
                        }));

                        return (
                            <Card
                                key={item.id}
                                sx={{
                                    bgcolor: 'background.paper',
                                    borderRadius: 3,
                                    position: 'relative',
                                }}
                            >
                                {/* Wskaźnik typu */}
                                {item.type !== FeedItemType.POST && ItemIcon && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 16,
                                            right: 16,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            bgcolor: alpha(getItemColor(item.type), 0.2),
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            zIndex: 1,
                                        }}
                                    >
                                        <ItemIcon size={16} color={getItemColor(item.type)}/>
                                        <Typography
                                            sx={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: getItemColor(item.type),
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {getItemLabel(item.type)}
                                        </Typography>
                                    </Box>
                                )}

                                <CardContent>
                                    {/* Nagłówek posta */}
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                        <Box sx={{display: 'flex', gap: 1.5, flex: 1}}>
                                            {item.userAvatarUrl ? (
                                                <Avatar src={item.userAvatarUrl} sx={{width: 44, height: 44}}/>
                                            ) : (
                                                <Box
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: '50%',
                                                        bgcolor: 'primary.main',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Typography sx={{fontWeight: 600, fontSize: '1.25rem'}}>
                                                        {item.userName?.[0] || '?'}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box>
                                                <Typography sx={{fontWeight: 600, fontSize: '1rem'}}>
                                                    {item.userName || 'Nieznany użytkownik'}
                                                </Typography>
                                                <Typography sx={{fontSize: '0.875rem', color: 'text.secondary'}}>
                                                    {formatTimestamp(item.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {isUserPost(item) && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleOpenMenu(e, item.id)}
                                                sx={{alignSelf: 'flex-start'}}
                                            >
                                                <MoreVertical/>
                                            </IconButton>
                                        )}
                                    </Box>

                                    {/* Tytuł */}
                                    {item.title && (
                                        <Typography
                                            sx={{
                                                fontSize: '1.25rem',
                                                fontWeight: 600,
                                                mb: 1,
                                                color: item.type !== FeedItemType.POST ? getItemColor(item.type) : 'text.primary',
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                    )}

                                    {/* Treść */}
                                    {item.description && (
                                        <Typography sx={{mb: imageUrl ? 2 : 0, whiteSpace: 'pre-wrap'}}>
                                            {item.description}
                                        </Typography>
                                    )}

                                    {/* Zdjęcie */}
                                    {imageUrl && (
                                        <Box sx={{mt: 2}}>
                                            <img
                                                src={imageUrl}
                                                alt="Post"
                                                style={{
                                                    width: '100%',
                                                    maxHeight: 400,
                                                    objectFit: 'cover',
                                                    borderRadius: 12,
                                                }}
                                            />
                                        </Box>
                                    )}
                                </CardContent>

                                {/* Akcje */}
                                <CardActions sx={{px: 2, pb: 2, gap: 2, alignItems: 'center'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <Button
                                            size="small"
                                            startIcon={
                                                <Heart
                                                    size={18}
                                                    style={{
                                                        fill: userLiked ? '#ffffff' : 'none', // biały fill gdy polubione
                                                        color: userLiked ? '#ffffff' : undefined, // biały kolor ikony gdy polubione
                                                    }}
                                                />
                                            }
                                            onClick={() => handleLike(item.id)}
                                            sx={{
                                                color: userLiked ? '#ffffff' : 'text.secondary', // liczba like'ów biała gdy polubione
                                                bgcolor: userLiked ? groupColor : 'transparent', // opcjonalne tło, żeby biały był widoczny
                                                '&:hover': {bgcolor: userLiked ? alpha(groupColor, 0.9) : undefined},
                                                textTransform: 'none',
                                            }}
                                        >
                                            {item.reactions.length}
                                        </Button>

                                        {/* Overlapping avatars */}
                                        {avatarsToShow.length > 0 && (
                                            <Box sx={{display: 'flex', alignItems: 'center', ml: 1}}>
                                                {avatarsToShow.map((a, i) => (
                                                    <Avatar
                                                        key={a.id}
                                                        src={a.picture}
                                                        title={a.name}
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            border: '2px solid',
                                                            borderColor: 'background.paper',
                                                            ml: i === 0 ? 0 : -1.1,
                                                            zIndex: 10 - i,
                                                            boxShadow: 1,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </Box>

                                    <Button
                                        size="small"
                                        startIcon={<MessageCircle size={18}/>}
                                        onClick={() => toggleComments(item.id)}
                                        sx={{color: 'text.secondary', textTransform: 'none'}}
                                    >
                                        {item.comments.length}
                                    </Button>
                                </CardActions>

                                {/* Komentarze */}
                                <Collapse in={isExpanded}>
                                    <Box sx={{px: 2, pb: 2}}>
                                        <Box
                                            sx={{
                                                bgcolor: alpha('#fff', 0.05),
                                                borderRadius: 2,
                                                p: 2,
                                            }}
                                        >
                                            {/* Lista komentarzy */}
                                            {item.comments.map((comment) => (
                                                <Box key={comment.id} sx={{display: 'flex', gap: 1.5, mb: 2}}>
                                                    <Avatar src={comment.userAvatarUrl} sx={{width: 32, height: 32}}>
                                                        {comment.userName[0]}
                                                    </Avatar>
                                                    <Box sx={{flex: 1}}>
                                                        <Box
                                                            sx={{
                                                                bgcolor: alpha('#fff', 0.05),
                                                                borderRadius: 2,
                                                                p: 1.5,
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{fontWeight: 600, fontSize: '0.875rem', mb: 0.5}}>
                                                                {comment.userName}
                                                            </Typography>
                                                            <Typography
                                                                sx={{fontSize: '0.875rem'}}>{comment.content}</Typography>
                                                        </Box>
                                                        <Typography
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                color: 'text.secondary',
                                                                mt: 0.5,
                                                                ml: 1.5,
                                                            }}
                                                        >
                                                            {formatTimestamp(comment.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))}

                                            {/* Dodawanie komentarza */}
                                            <Box sx={{display: 'flex', gap: 1.5, mt: item.comments.length > 0 ? 2 : 0}}>
                                                <Avatar src={MOCK_USER.avatar} sx={{width: 32, height: 32}}>
                                                    {MOCK_USER.name[0]}
                                                </Avatar>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder="Dodaj komentarz..."
                                                    value={newComment[item.id] || ''}
                                                    onChange={(e) => setNewComment({
                                                        ...newComment,
                                                        [item.id]: e.target.value
                                                    })}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleAddComment(item.id);
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
                                                                onClick={() => handleAddComment(item.id)}
                                                                disabled={!newComment[item.id]?.trim()}
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
                        );
                    })}
                </Box>

                {/* Menu opcji posta */}
                <Menu
                    anchorEl={menuAnchor?.el}
                    open={Boolean(menuAnchor)}
                    onClose={handleCloseMenu}
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    transformOrigin={{vertical: 'top', horizontal: 'right'}}
                >
                    <MenuItem onClick={handleEditPost}>
                        <Edit2 size={18} style={{marginRight: 8}}/>
                        Edytuj
                    </MenuItem>
                    <MenuItem onClick={handleDeletePost} sx={{color: 'error.main'}}>
                        <Trash2 size={18} style={{marginRight: 8}}/>
                        Usuń
                    </MenuItem>
                </Menu>

                {/* Dialog edycji */}
                <Dialog open={editDialog.open} onClose={() => setEditDialog({open: false, item: null})} maxWidth="sm"
                        fullWidth>
                    <DialogTitle>Edytuj post</DialogTitle>
                    <DialogContent>
                        <TextField fullWidth multiline minRows={4} value={editContent}
                                   onChange={(e) => setEditContent(e.target.value)} sx={{mt: 1}}/>
                    </DialogContent>
                    <DialogActions sx={{px: 3, pb: 2}}>
                        <Button onClick={() => setEditDialog({open: false, item: null})}>Anuluj</Button>
                        <Button variant="contained" onClick={handleSaveEdit}
                                sx={{bgcolor: groupColor, '&:hover': {bgcolor: alpha(groupColor, 0.85)}}}>
                            Zapisz
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}
