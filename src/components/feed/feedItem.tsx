import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Collapse,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {Edit2, Heart, MessageCircle, MoreVertical, Send, Trash2, User} from 'lucide-react';
import {FeedItemType} from '@/lib/types/FeedItemType';
import {CommentResponseDto, GroupFeedItemResponseDto, UserResponseDto} from '@/lib/types/feedDtos';
import {useImageUrl} from "@/hooks/useImageUrl";


function getItemIcon(type: FeedItemType) {
    switch (type) {
        case FeedItemType.EVENT:
            return MessageCircle;
        case FeedItemType.CHALLENGE:
            return Heart;
        case FeedItemType.POLL:
            return MessageCircle;
        case FeedItemType.RECOMMENDATION:
            return Heart;
        case FeedItemType.MEMBER:
            return User;
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
        case FeedItemType.MEMBER:
            return '#81db60';
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
        case FeedItemType.MEMBER:
            return 'Nowy członek';
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

function UserAvatar({user, size, groupColor}: { user: UserResponseDto; size: number; groupColor?: string }) {
    const avatarUrl = useImageUrl(user.profilePicture?.id);
    const displayName = `${user.name} ${user.surname}`.trim() || user.username;

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
            {user.name?.[0]?.toUpperCase() || '?'}
        </Avatar>
    );
}

interface FeedItemProps {
    item: GroupFeedItemResponseDto;
    userId: string;
    currentUser?: UserResponseDto;
    groupColor: string;
    expanded: boolean;
    newComment: string;
    onLike: (itemId: string) => void;
    onToggleComments: (itemId: string) => void;
    onCommentChange: (itemId: string, value: string) => void;
    onAddComment: (itemId: string) => void;
    onOpenMenu: (event: React.MouseEvent<HTMLElement>, itemId: string) => void;
    menuAnchor: { el: HTMLElement; itemId: string } | null;
    onCloseMenu: () => void;
    onEditPost: () => void;
    onDeletePost: () => void;
}

export default function FeedItem({
                                     item,
                                     userId,
                                     currentUser,
                                     groupColor,
                                     expanded,
                                     newComment,
                                     onLike,
                                     onToggleComments,
                                     onCommentChange,
                                     onAddComment,
                                     onOpenMenu,
                                     menuAnchor,
                                     onCloseMenu,
                                     onEditPost,
                                     onDeletePost,
                                 }: FeedItemProps) {
    const ItemIcon = getItemIcon(item.type);
    const imageUrl = useImageUrl(item.storedFileId, item.temporaryImageUrl);

    const userLiked = Array.isArray(item.reactions)
        ? item.reactions.some(r => r.id === userId)
        : false;
    const isUserPost = item.user.id === userId;

    const avatarsToShow = Array.isArray(item.reactions)
        ? item.reactions.slice(0, 3)
        : [];

    const displayName = `${item.user.name} ${item.user.surname}`.trim() || item.user.username || 'Nieznany użytkownik';

    return (
        <Card sx={{bgcolor: 'background.paper', borderRadius: 3, position: 'relative'}}>
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
                        <UserAvatar user={item.user} size={44} groupColor={groupColor}/>
                        <Box>
                            <Typography sx={{fontWeight: 600, fontSize: '1rem'}}>
                                {displayName}
                            </Typography>
                            <Typography sx={{fontSize: '0.875rem', color: 'text.secondary'}}>
                                {formatTimestamp(item.createdAt)}
                            </Typography>
                        </Box>
                    </Box>
                    {isUserPost && item.type === FeedItemType.POST && (
                        <IconButton
                            size="small"
                            onClick={e => onOpenMenu(e, item.id)}
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
                            style={{width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 12}}
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
                                    fill: userLiked ? 'white' : 'none',
                                    color: userLiked ? 'white' : 'rgba(255, 255, 255, 0.5)'
                                }}
                            />
                        }
                        onClick={() => onLike(item.id)}
                        sx={{
                            bgcolor: groupColor,
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: groupColor,
                                opacity: 0.9,
                            }
                        }}
                    >
                        {(item.reactions || []).length}
                    </Button>

                    {/* Overlapping avatars */}
                    {avatarsToShow.length > 0 && (
                        <Box sx={{display: 'flex', alignItems: 'center', ml: 1}}>
                            {avatarsToShow.map((user, i) => (
                                <ReactionAvatar key={user.id} user={user} index={i}/>
                            ))}
                        </Box>
                    )}
                </Box>
                <Button
                    size="small"
                    startIcon={<MessageCircle size={18} style={{color: 'rgba(255, 255, 255, 0.7)'}}/>}
                    onClick={() => onToggleComments(item.id)}
                    sx={{
                        bgcolor: groupColor,
                        color: 'white',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: groupColor,
                            opacity: 0.9,
                        }
                    }}
                >
                    {(item.comments || []).length}
                </Button>
            </CardActions>
            {/* Komentarze */}
            <Collapse in={expanded}>
                <Box sx={{px: 2, pb: 2}}>
                    <Box sx={{bgcolor: alpha('#fff', 0.05), borderRadius: 2, p: 2}}>
                        {/* Lista komentarzy */}
                        {item.comments.map(comment => (
                            <CommentItem key={comment.id} comment={comment}/>
                        ))}

                        {/* Dodawanie komentarza */}
                        <Box sx={{display: 'flex', gap: 1.5, mt: item.comments.length > 0 ? 2 : 0}}>
                            {currentUser && <UserAvatar user={currentUser} size={32} groupColor={groupColor}/>}
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Dodaj komentarz..."
                                value={newComment}
                                onChange={e => onCommentChange(item.id, e.target.value)}
                                onKeyPress={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        onAddComment(item.id);
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: groupColor,
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: groupColor,
                                        },
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            size="small"
                                            onClick={() => onAddComment(item.id)}
                                            disabled={!newComment.trim()}
                                            sx={{
                                                color: groupColor,
                                                '&:hover': {
                                                    bgcolor: `${groupColor}15`,
                                                }
                                            }}
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
            {/* Menu opcji posta */}
            <Menu
                anchorEl={menuAnchor?.el}
                open={Boolean(menuAnchor)}
                onClose={onCloseMenu}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                transformOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <MenuItem onClick={onEditPost}>
                    <Edit2 size={18} style={{marginRight: 8}}/> Edytuj
                </MenuItem>
                <MenuItem onClick={onDeletePost} sx={{color: 'error.main'}}>
                    <Trash2 size={18} style={{marginRight: 8}}/> Usuń
                </MenuItem>
            </Menu>
        </Card>
    );
}


function ReactionAvatar({user, index}: { user: UserResponseDto; index: number }) {
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


function CommentItem({comment}: { comment: CommentResponseDto }) {
    const avatarUrl = useImageUrl(comment.user.profilePicture?.id);
    const displayName = `${comment.user.name} ${comment.user.surname}`.trim() || comment.user.username || 'Nieznany użytkownik';

    return (
        <Box sx={{display: 'flex', gap: 1.5, mb: 2}}>
            <Avatar src={avatarUrl || undefined} sx={{width: 32, height: 32}}>
                {comment.user.name?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{flex: 1}}>
                <Box sx={{bgcolor: alpha('#fff', 0.05), borderRadius: 2, p: 1.5}}>
                    <Typography sx={{fontWeight: 600, fontSize: '0.875rem', mb: 0.5}}>
                        {displayName}
                    </Typography>
                    <Typography sx={{fontSize: '0.875rem'}}>{comment.content}</Typography>
                </Box>
                <Typography sx={{fontSize: '0.75rem', color: 'text.secondary', mt: 0.5, ml: 1.5}}>
                    {formatTimestamp(comment.createdAt)}
                </Typography>
            </Box>
        </Box>
    );
}
