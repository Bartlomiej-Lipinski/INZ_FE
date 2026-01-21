'use client';

import {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import {PieChart, Plus, X} from 'lucide-react';
import {PollResponseDto} from "@/lib/types/ankiety";
import {PollCreate} from "@/lib/types/poll";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import PollCardComponent from '@/app/group-polls/PollCard-component';
import GroupHeader from '@/components/layout/Group-header';
import {usePopup} from '@/hooks/usePopup';
import Popup from '@/components/common/Popup';

function PollsPageContent() {
    const {popup, hidePopup, showError} = usePopup();
    const searchParams = useSearchParams();
    const [polls, setPolls] = useState<PollResponseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [createDialog, setCreateDialog] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [newOptions, setNewOptions] = useState<string[]>(['', '']);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; pollId: string | null }>({
        open: false,
        pollId: null,
    });

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

    const loadPolls = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`${API_ROUTES.POLL_CREATE_GETALL}?groupId=${groupData.id}`, {
                method: 'GET'
            });
            if (response.ok) {
                const r = await response.json();
                const data = r.data as PollResponseDto[];
                setPolls(Array.isArray(data) ? data : []);
            } else {
                const errorData = await response.json().catch(() => ({}));
                showError(errorData.message || 'Nie udało się pobrać ankiet');
                setPolls([]);
            }
        } catch (error) {
            console.error('Error fetching polls:', error);
            showError('Błąd połączenia podczas pobierania ankiet');
            setPolls([]);
        } finally {
            setLoading(false);
        }
    }, [groupData.id, showError]);

    useEffect(() => {
        const userId = localStorage.getItem('auth:user');
        if (userId) {
            try {
                const userData = JSON.parse(userId);
                setCurrentUserId(userData.id);
            } catch (error) {
                console.error('Error parsing user data:', error);
                showError('Błąd podczas wczytywania danych użytkownika');
            }
        }
    }, [showError]);

    useEffect(() => {
        if (groupData.id) {
            loadPolls();
        }
    }, [loadPolls, groupData.id]);

    const handleVote = async (pollId: string, optionId: string) => {
        try {
            const response = await fetchWithAuth(API_ROUTES.POLL_VOTE, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    groupId: groupData.id,
                    pollId,
                    optionId,
                }),
            });

            if (response.ok) {
                await loadPolls();
            } else {
                const errorData = await response.json().catch(() => ({}));
                showError(errorData.message || 'Nie udało się oddać głosu');
            }
        } catch (error) {
            console.error('Error voting:', error);
            showError('Błąd podczas oddawania głosu');
        }
    };

    const handleAddOption = () => {
        setNewOptions([...newOptions, '']);
    };

    const handleRemoveOption = (index: number) => {
        if (newOptions.length > 2) {
            setNewOptions(newOptions.filter((_, i) => i !== index));
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const updated = [...newOptions];
        updated[index] = value;
        setNewOptions(updated);
    };

    const handleCreatePoll = async () => {
        const validOptions = newOptions.filter(opt => opt.trim());

        if (!newQuestion.trim()) {
            showError('Pytanie nie może być puste');
            return;
        }

        if (validOptions.length < 2) {
            showError('Ankieta musi mieć przynajmniej 2 opcje');
            return;
        }

        const pollData: PollCreate = {
            question: newQuestion,
            options: validOptions.map(text => ({
                id: '',
                text,
                votedUsers: [{id: ''}]
            }))
        };

        try {
            const response = await fetchWithAuth(API_ROUTES.POLL_CREATE_GETALL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    groupId: groupData.id,
                    ...pollData,
                }),
            });

            if (response.ok) {
                setCreateDialog(false);
                setNewQuestion('');
                setNewOptions(['', '']);
                await loadPolls();
            } else {
                const errorData = await response.json().catch(() => ({}));
                showError(errorData.message || 'Nie udało się utworzyć ankiety');
            }
        } catch (error) {
            console.error('Error creating poll:', error);
            showError('Błąd podczas tworzenia ankiety');
        }
    };

    const handleDeletePoll = async () => {
        if (!deleteDialog.pollId) return;

        try {
            const response = await fetchWithAuth(API_ROUTES.POLL_DELETE_GET_PUT, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    groupId: groupData.id,
                    pollId: deleteDialog.pollId,
                }),
            });

            if (response.ok) {
                setDeleteDialog({open: false, pollId: null});
                await loadPolls();
            } else {
                const errorData = await response.json().catch(() => ({}));
                showError(errorData.message || 'Nie udało się usunąć ankiety');
            }
        } catch (error) {
            console.error('Error deleting poll:', error);
            showError('Błąd podczas usuwania ankiety');
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(70vh - 300px)',
                }}
            >
                <Typography>Ładowanie...</Typography>
            </Box>
        );
    }

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

            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <GroupHeader
                    title="Ankiety"
                    leftIcon={<PieChart size={32}/>}
                />

                <Box sx={{width: '90%', maxWidth: 800}}>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={20}/>}
                        onClick={() => setCreateDialog(true)}
                        fullWidth
                        sx={{
                            bgcolor: groupData.color,
                            py: 1.5,
                            mb: 3,
                            '&:hover': {
                                bgcolor: groupData.color,
                                opacity: 0.9,
                            }
                        }}
                    >
                        Nowa ankieta
                    </Button>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        {polls.map((poll) => (
                            <Box key={poll.id}>
                                <PollCardComponent
                                    poll={poll}
                                    onVote={handleVote}
                                    onDelete={(pollId) => setDeleteDialog({open: true, pollId})}
                                    groupColor={groupData.color}
                                    isOwner={poll.createdByUserId === currentUserId}
                                    currentUserId={currentUserId}
                                />
                            </Box>
                        ))}
                    </Box>

                    <Dialog
                        open={createDialog}
                        onClose={() => setCreateDialog(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Nowa ankieta</DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                label="Pytanie"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                margin="normal"
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
                            />

                            <Typography variant="subtitle2" sx={{mb: 2, fontWeight: 600}}>
                                Opcje odpowiedzi
                            </Typography>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                {newOptions.map((option, index) => (
                                    <Box key={index} sx={{display: 'flex', gap: 1}}>
                                        <TextField
                                            fullWidth
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Opcja ${index + 1}`}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 3,
                                                }
                                            }}
                                        />
                                        {newOptions.length > 2 && (
                                            <IconButton
                                                onClick={() => handleRemoveOption(index)}
                                                color="error"
                                            >
                                                <X size={20}/>
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                            </Box>

                            <Button
                                startIcon={<Plus size={18}/>}
                                onClick={handleAddOption}
                                sx={{mt: 2, color: white, bgColor: groupData.color}}
                            >
                                Dodaj opcję
                            </Button>
                        </DialogContent>
                        <DialogActions sx={{px: 3, pb: 2}}>
                            <Button
                                onClick={() => setCreateDialog(false)}
                                sx={{color: '#ffffff', bgcolor: groupData.color}}
                            >
                                Anuluj
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleCreatePoll}
                                disabled={!newQuestion.trim() || newOptions.filter(opt => opt.trim()).length < 2}
                                sx={{bgcolor: groupData.color}}
                            >
                                Utwórz
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={deleteDialog.open}
                        onClose={() => setDeleteDialog({open: false, pollId: null})}
                        maxWidth="xs"
                        fullWidth
                    >
                        <DialogTitle>Usuń ankietę</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Czy na pewno chcesz usunąć tę ankietę? Tej operacji nie można cofnąć.
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{px: 3, pb: 2}}>
                            <Button
                                sx={{backgroundColor: groupData.color}}
                                onClick={() => setDeleteDialog({open: false, pollId: null})}
                            >
                                Anuluj
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                sx={{backgroundColor: '#f44336'}}
                                onClick={handleDeletePoll}
                            >
                                Usuń
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </>
    );
}

export default function PollsPage() {
    return (
        <Suspense fallback={<div>Ładowanie...</div>}>
            <PollsPageContent />
        </Suspense>
    );
}

