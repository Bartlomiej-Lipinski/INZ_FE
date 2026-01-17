import React, {useState} from 'react';
import {Avatar, Box, Button, Card, CardActions, CardContent, IconButton, TextField} from '@mui/material';
import {ImagePlus, Send, X} from 'lucide-react';
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {GroupFeedItemResponseDto} from "@/lib/types/feedDtos";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {FeedItemType} from "@/lib/types/FeedItemType";
import {useImageUrl} from "@/hooks/useImageUrl";
import {User} from '@/lib/types/user';
import {usePopup} from '@/hooks/usePopup';
import Popup from '@/components/common/Popup';

interface AddPostFormProps {
    user: User;
    groupColor: string;
    groupId: string;
    onAddPost: (newItem: GroupFeedItemResponseDto) => void;
}

export default function AddPostFormComponent({user, groupId, groupColor, onAddPost}: Readonly<AddPostFormProps>) {
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const avatarUrl = useImageUrl(user.profilePicture?.id || undefined);
    const {popup, hidePopup, showError} = usePopup();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                showError('Plik jest zbyt duży. Maksymalny rozmiar to 10MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                showError('Można dodawać tylko pliki graficzne');
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.onerror = () => {
                showError('Błąd podczas wczytywania podglądu obrazu');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageButtonClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            handleFileSelect({target} as React.ChangeEvent<HTMLInputElement>);
        };
        input.click();
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPostContent.trim() && !selectedFile) {
            showError('Post musi zawierać treść lub zdjęcie');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('description', newPostContent);
            formData.append('groupId', groupId);
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await fetchWithAuth(API_ROUTES.POST_FEED_ITEM, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                showError(errorData.message || 'Nie udało się dodać posta');
                return;
            }

            const result = await response.json();
            onAddPost({
                id: result.data,
                description: newPostContent,
                title: undefined,
                storedFileId: selectedFile ? result.data : undefined,
                temporaryImageUrl: selectedFile ? previewUrl || undefined : undefined,
                type: FeedItemType.POST,
                user: {
                    id: user.id,
                    name: user.name,
                    surname: user.surname,
                    username: user.username,
                    profilePicture: user.profilePicture?.id ? {
                        id: user.profilePicture.id,
                        fileName: '',
                        contentType: '',
                        size: 0
                    } : undefined,
                },
                reactions: [],
                comments: [],
                createdAt: new Date().toISOString(),
            });

            setNewPostContent('');
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Błąd podczas dodawania posta:', error);
            showError('Wystąpił błąd podczas publikowania posta');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {popup.isOpen && (
                <Popup
                    type={popup.type}
                    title={popup.title}
                    message={popup.message}
                    onClose={hidePopup}
                />
            )}

            <Card sx={{mb: 3, bgcolor: 'background.paper', borderRadius: 3}}>
                <form onSubmit={handleSubmit}>
                    <CardContent sx={{pb: 1}}>
                        <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                            <Avatar
                                src={avatarUrl || undefined}
                                sx={{bgcolor: groupColor, width: 44, height: 44}}
                            >
                                {user.name?.[0]?.toUpperCase() || '?'}
                            </Avatar>
                            <TextField
                                fullWidth
                                multiline
                                minRows={2}
                                maxRows={6}
                                placeholder="Napisz coś do grupy..."
                                value={newPostContent}
                                onChange={e => setNewPostContent(e.target.value)}
                                variant="outlined"
                                disabled={isSubmitting}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: groupColor,
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: groupColor,
                                        },
                                    },
                                }}
                            />
                        </Box>
                        {previewUrl && (
                            <Box sx={{position: 'relative', mb: 2}}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 12}}
                                />
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        bgcolor: 'rgba(0,0,0,0.6)',
                                        '&:hover': {bgcolor: 'rgba(0,0,0,0.8)'}
                                    }}
                                    onClick={handleRemoveImage}
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
                                bgcolor: groupColor,
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    color: '#bdbdbd',
                                }
                            }}
                        >
                            <ImagePlus/>
                        </IconButton>
                        <Button
                            variant="contained"
                            endIcon={<Send size={18}/>}
                            type="submit"
                            disabled={(!newPostContent.trim() && !selectedFile) || isSubmitting}
                            sx={{bgcolor: groupColor, '&:hover': {bgcolor: groupColor, opacity: 0.9}}}
                        >
                            {isSubmitting ? 'Publikowanie...' : 'Opublikuj'}
                        </Button>
                    </CardActions>
                </form>
            </Card>
        </>
    );
}