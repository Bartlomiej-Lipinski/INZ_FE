import React, {useEffect, useMemo, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material';
import {Brain, Edit2, Menu, PlayCircle, Plus, Trash2,} from 'lucide-react';
import {QuizResponseDto} from '@/lib/types/quiz';
import GroupMenu from "@/components/common/GroupMenu";
import {useSearchParams} from 'next/navigation';


interface QuizListProps {
    quizzes: QuizResponseDto[];
    groupColor: string;
    onCreateQuiz: () => void;
    onEditQuiz: (quiz: QuizResponseDto) => void;
    onTakeQuiz: (quiz: QuizResponseDto) => void;
    onDeleteQuiz: (quizId: string) => void;
}

export default function QuizList({
                                     quizzes,
                                     groupColor,
                                     onCreateQuiz,
                                     onEditQuiz,
                                     onTakeQuiz,
                                     onDeleteQuiz,
                                 }: QuizListProps) {
    const searchParams = useSearchParams();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [deleteDialog, setDeleteDialog] = React.useState<{
        open: boolean;
        quizId: string | null;
    }>({open: false, quizId: null});
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

    const handleDeleteConfirm = () => {
        if (deleteDialog.quizId) {
            onDeleteQuiz(deleteDialog.quizId);
            setDeleteDialog({open: false, quizId: null});
        }
    };

    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 1200, mx: 'auto'}}>
                {/* Header */}
                <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                    <IconButton
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                            bgcolor: '#8D8C8C',
                            '&:hover': {bgcolor: '#666666'},
                            mr: 1,
                        }}
                    >
                        <Menu/>
                    </IconButton>

                    <Typography
                        variant="h4"
                        sx={{
                            textAlign: 'center',
                            flex: 1,
                            fontWeight: 600,
                            fontSize: {xs: '1.75rem', sm: '2rem'},
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                        }}
                    >
                        <Brain size={32}/>
                        Quizy
                    </Typography>
                </Box>

                {/* Drawer */}
                <GroupMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} groupId={groupData.id}
                           groupName={groupData.name} groupColor={groupData.color}/>

                {/* Create button */}
                <Button
                    variant="contained"
                    startIcon={<Plus size={20}/>}
                    onClick={onCreateQuiz}
                    sx={{mb: 3, bgcolor: groupColor}}
                >
                    Nowy quiz
                </Button>

                {/* Quiz list */}
                {quizzes.length === 0 ? (
                    <Card sx={{borderRadius: 3, p: 4, textAlign: 'center'}}>
                        <Brain size={64} style={{opacity: 0.5, margin: '0 auto 16px'}}/>
                        <Typography variant="h6" sx={{mb: 1}}>
                            Brak quizów
                        </Typography>
                        <Typography color="text.secondary" sx={{mb: 3}}>
                            Stwórz pierwszy quiz dla swojej grupy
                        </Typography>
                    </Card>
                ) : (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        {quizzes.map((quiz) => (
                            <Card
                                key={quiz.id}
                                sx={{
                                    borderRadius: 3,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 2
                                    }}>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="h6" sx={{fontWeight: 600, mb: 1}}>
                                                {quiz.title}
                                            </Typography>
                                            {quiz.description && (
                                                <Typography color="text.secondary" sx={{mb: 2}}>
                                                    {quiz.description}
                                                </Typography>
                                            )}
                                            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                                <Chip
                                                    label={`${quiz.questions.length} pytań`}
                                                    size="small"
                                                    sx={{bgcolor: groupColor, color: 'white'}}
                                                />
                                                <Chip
                                                    label={new Date(quiz.createdAt).toLocaleDateString('pl-PL')}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </Box>
                                        <Box sx={{display: 'flex', gap: 1}}>
                                            <IconButton
                                                size="small"
                                                onClick={() => onEditQuiz(quiz)}
                                                sx={{color: 'text.secondary'}}
                                            >
                                                <Edit2 size={20}/>
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => setDeleteDialog({open: true, quizId: quiz.id})}
                                                sx={{color: 'error.main'}}
                                            >
                                                <Trash2 size={20}/>
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<PlayCircle size={20}/>}
                                        onClick={() => onTakeQuiz(quiz)}
                                        sx={{bgcolor: groupColor}}
                                    >
                                        Rozpocznij quiz
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}

                {/* Delete dialog */}
                <Dialog
                    open={deleteDialog.open}
                    onClose={() => setDeleteDialog({open: false, quizId: null})}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>Usuń quiz</DialogTitle>
                    <DialogContent>
                        <Typography>Czy na pewno chcesz usunąć ten quiz? Ta operacja jest nieodwracalna.</Typography>
                    </DialogContent>
                    <DialogActions sx={{px: 3, pb: 2}}>
                        <Button onClick={() => setDeleteDialog({open: false, quizId: null})}>Anuluj</Button>
                        <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
                            Usuń
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}