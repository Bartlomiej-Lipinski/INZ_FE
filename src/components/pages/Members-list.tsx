"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import { Search, X, UserPlus, Send } from 'lucide-react';

import MemberItem from '@/components/common/Member-item';
import { useMembers } from '@/hooks/use-members';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { API_ROUTES } from '@/lib/api/api-routes-endpoints';
import { useRouter } from 'next/navigation';

export default function MembersList({ groupId, groupColor }: { groupId: string | null, groupColor: string }) {
    const { members, isLoading, error, fetchGroupMembers } = useMembers();
    const [searchQuery, setSearchQuery] = useState('');
    const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const router = useRouter();


    useEffect(() => {
        if (!groupId) {
            return;
        }
        fetchGroupMembers(groupId).catch((err) => {
            console.error('Nie udało się pobrać członków:', err);
        });
    }, [groupId, fetchGroupMembers]);

    const filteredMembers = useMemo(() => {
        if (!searchQuery.trim()) {
            return members;
        }
        const normalizedQuery = searchQuery.toLowerCase().trim();
        return members.filter((member) => {
            const fullName = `${member.name ?? ''} ${member.surname ?? ''}`.toLowerCase();
            const username = member.username?.toLowerCase() ?? '';
            return fullName.includes(normalizedQuery) || username.includes(normalizedQuery);
        });
    }, [members, searchQuery]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const extractInviteCode = (rawValue: unknown): string | null => {
        if (typeof rawValue !== 'string') {
            return null;
        }

        const match = rawValue.match(/\b(\d{5})\b/);
        return match?.[1] ?? null;
    };

    const handleGenerateInvite = async () => {
        if (!groupId || isGeneratingInvite) {
            return;
        }

        setIsGeneratingInvite(true);
        setGenerateError(null);

        try {
            const response = await fetchWithAuth(API_ROUTES.GENERATE_JOIN_GROUP_CODE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ groupId }),
            });

            type GenerateCodeResponse = {
                success?: boolean,
                data?: unknown,
                message?: string,
            };

            const payload: GenerateCodeResponse = await response.json().catch(() => ({} as GenerateCodeResponse));

            if (!response.ok || !payload?.success) {
                throw new Error(payload?.message ?? 'Nie udało się wygenerować kodu zaproszenia');
            }


            const derivedCode = extractInviteCode(payload.data);

            if (!derivedCode) {
                throw new Error('Nie udało się odczytać wygenerowanego kodu');
            }

            setInviteCode(derivedCode);
            setInviteDialogOpen(true);
            setCopyStatus('idle');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
            setGenerateError(message);
        } finally {
            setIsGeneratingInvite(false);
        }
    };

    const handleMemberClick = useCallback(() => {
        router.push('/group-menu/members/profile');
    }, []);

    const handleCloseDialog = () => {
        setInviteDialogOpen(false);
        setCopyStatus('idle');
    };

    const handleCopyInviteCode = async () => {
        if (!inviteCode) {
            return;
        }

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(inviteCode);
            } else {
                const tempInput = document.createElement('input');
                tempInput.value = inviteCode;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
            }
            setCopyStatus('success');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } catch {
            setCopyStatus('error');
        }
    };

    if (isLoading && members.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(70vh - 300px)',
                }}
            >
                <CircularProgress size={48} />
            </Box>
        );
    }

    const renderListContent = () => {
        if (!groupId) {
            return (
                <Typography
                    sx={{
                        color: 'text.secondary',
                        fontSize: '20px',
                        textAlign: 'center',
                    }}
                >
                    Wybierz grupę, aby zobaczyć członków.
                </Typography>
            );
        }

        if (error) {
            return (
                <Typography
                    sx={{
                        color: 'error.main',
                        fontSize: '18px',
                        textAlign: 'center',
                    }}
                >
                    {error}
                </Typography>
            );
        }

        if (members.length === 0) {
            return (
                <Typography
                    sx={{
                        color: 'text.secondary',
                        fontSize: '20px',
                        textAlign: 'center',
                    }}
                >
                    Brak członków w tej grupie.
                </Typography>
            );
        }

        if (filteredMembers.length === 0 && searchQuery.trim()) {
            return (
                <Typography
                    sx={{
                        color: 'grey.300',
                        fontSize: '20px',
                        textAlign: 'center',
                    }}
                >
                    Nie znaleziono członka spełniającego kryteria wyszukiwania.
                </Typography>
            );
        }

        return (
            <Box
                sx={(theme) => ({
                    display: 'grid',
                    gridTemplateColumns:
                        filteredMembers.length === 1
                            ? '1fr'
                            : {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                            },
                    gap: 3,
                    width: '100%',
                    maxWidth: filteredMembers.length === 1 ? '400px' : '800px',
                    maxHeight: 'calc(70vh - 170px)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    pt: 0.5,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        bgcolor: 'grey.700',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `${groupColor ? groupColor : theme.palette.primary.main} !important`,
                        borderRadius: '4px',
                    },
                })}
            >
                {filteredMembers.map((member) => (
                    <Box
                        key={member.id}
                        sx={{
                            minWidth: 0,
                            width: '100%',
                            maxWidth: '100%',
                        }}
                    >
                        <MemberItem
                            member={member}
                            onClick={handleMemberClick}
                        />
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <>
            <Box
            sx={{
                position: 'relative',
                justifyItems: 'center',
                maxWidth: '80%',
                mx: 'auto',
            }}
        >
            <Box
                sx={{
                    width: '80%',
                    maxWidth: '300px',
                    mx: 'auto',
                    mb: 3,
                    textAlign: 'center',
                }}
            >


                <TextField
                    fullWidth
                    placeholder="Wyszukaj członka"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    sx={(theme) => ({
                        '& .MuiOutlinedInput-root': {
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: groupColor || theme.palette.primary.main,
                            },
                        },
                    })}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} style={{ opacity: 0.7 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleClearSearch}
                                        edge="end"
                                        size="small"
                                        sx={{
                                            color: 'text.secondary',
                                            '&:hover': {
                                                color: 'text.primary',
                                            },
                                        }}
                                    >
                                        <X size={18} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        },
                    }}
                />
            </Box>



            <Box
                sx={(theme) => ({
                    width: '100%',
                    maxWidth: 900,
                    px: { xs: 3, sm: 5 },
                    py: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    border: `1px solid ${groupColor ? groupColor : theme.palette.grey[700]}`,
                    boxShadow: '0 16px 45px rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2.5,
                    backdropFilter: 'blur(6px)',
                })}
            >

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                        mb: 3,
                    }}
                >
                    <Button
                        startIcon={<UserPlus size={20} style={{ marginRight: 4 }} />}
                        sx={(theme) => ({
                            backgroundColor: groupColor || theme.palette.primary.main,
                            color: theme.palette.getContrastText(groupColor || theme.palette.primary.main),
                            minWidth: 220,
                        })}
                    >
                        Prośby o dołączenie
                    </Button>
                    <Button
                        startIcon={<Send size={20} style={{ marginRight: 4 }} />}
                        onClick={handleGenerateInvite}
                        disabled={!groupId || isGeneratingInvite}
                        sx={(theme) => ({
                            backgroundColor: groupColor || theme.palette.primary.main,
                            color: theme.palette.getContrastText(groupColor || theme.palette.primary.main),
                            minWidth: 220,
                            '&:disabled': {
                                backgroundColor: theme.palette.action.disabledBackground,
                                color: theme.palette.text.disabled,
                            },
                        })}
                    >
                        {isGeneratingInvite ? 'Generuję kod...' : 'Zaproszenie do grupy'}
                    </Button>
                </Box>
                {generateError && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'error.main',
                            textAlign: 'center',
                            mb: 1,
                        }}
                    >
                        {generateError}
                    </Typography>
                )}
                {renderListContent()}
            </Box>
        </Box>
            <Dialog
                open={inviteDialogOpen}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Skopiuj zaproszenie</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        pb: 1,
                    }}
                >
                    <Typography variant="body1" color="text.secondary">
                        Kod zaproszeniowy - ważny przez 5 minut
                    </Typography>
                    <Box
                        sx={(theme) => ({
                            width: '60%',
                            borderRadius: 30,
                            backgroundColor: 'transparent',
                            textAlign: 'center',
                            px: 2,
                            py: 1.5,
                            fontWeight: 600,
                            letterSpacing: 8,
                            border: '2px solid',
                            borderColor: groupColor || theme.palette.primary.main,
                        })}
                    >
                        {inviteCode}
                    </Box>
                    <Button
                        onClick={handleCopyInviteCode}
                        disabled={!inviteCode}
                        sx={(theme) => (    {
                            mt: 1,
                            minWidth: 140,
                            backgroundColor: groupColor || theme.palette.primary.main,
                            color: theme.palette.getContrastText(groupColor || theme.palette.primary.main),
                        })}
                    >
                        {copyStatus === 'success'
                            ? 'Skopiowano!'
                            : copyStatus === 'error'
                                ? 'Spróbuj ponownie'
                                : 'Kopiuj'}
                    </Button>
                    {copyStatus === 'error' && (
                        <Typography variant="caption" color="error.main">
                            Nie udało się skopiować kodu.
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

