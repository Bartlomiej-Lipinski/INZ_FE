"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
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
import { useJoinRequest } from '@/hooks/use-join-request';
import type { JoinRequest } from '@/hooks/use-join-request';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { API_ROUTES } from '@/lib/api/api-routes-endpoints';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

export default function MembersList({ groupId, groupColor }: { groupId: string | null, groupColor: string }) {
    const { user } = useAuthContext();
    const { members, isLoading, error, fetchGroupMembers } = useMembers();
    const {
        joinRequests,
        joinRequestsAmount,
        isFetchingRequests: isFetchingJoinRequests,
        fetchJoinRequests,
        acceptJoinRequest,
        rejectJoinRequest,
        isMutating: isMutatingJoinRequest,
        error: joinRequestsError,
    } = useJoinRequest();
    const [searchQuery, setSearchQuery] = useState('');
    const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [joinRequestsDialogOpen, setJoinRequestsDialogOpen] = useState(false);
    const [activeJoinRequestAction, setActiveJoinRequestAction] = useState<{
        userId: string;
        action: 'accept' | 'reject';
    } | null>(null);
    const router = useRouter();
    const canManageJoinRequests = user?.role === 'Admin';


    useEffect(() => {
        if (!groupId) {
            setJoinRequestsDialogOpen(false);
            return;
        }
        fetchGroupMembers(groupId).catch((err) => {
            console.error('Nie udało się pobrać członków:', err);
        });
        if (canManageJoinRequests) {
            fetchJoinRequests().catch((err) => {
                console.error('Nie udało się pobrać próśb o dołączenie:', err);
            });
        }
    }, [groupId, fetchGroupMembers, fetchJoinRequests, canManageJoinRequests]);

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

    const pendingJoinRequestUserIds = useMemo(() => {
        if (!groupId) {
            return new Set<string>();
        }

        return new Set(
            joinRequests
                .filter((request) => request.groupId === groupId)
                .map((request) => request.user.id),
        );
    }, [groupId, joinRequests]);

    const joinRequestsBadgeValue = typeof joinRequestsAmount === 'number' ? joinRequestsAmount : '--';
    const shouldShowJoinRequestsSpinner = isFetchingJoinRequests && joinRequestsAmount === null;

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

    const handleOpenJoinRequestsDialog = () => {
        if (!groupId || !canManageJoinRequests) {
            return;
        }

        setJoinRequestsDialogOpen(true);
        // fetchJoinRequests().catch((err) => {
        //     console.error('Nie udało się odświeżyć próśb o dołączenie:', err);
        // });
    };

    const handleCloseJoinRequestsDialog = () => {
        setJoinRequestsDialogOpen(false);
    };

    const handleJoinRequestAction = async (action: 'accept' | 'reject', request: JoinRequest) => {
        if (isMutatingJoinRequest) {
            return;
        }

        setActiveJoinRequestAction({ userId: request.user.id, action });

        const payload = {
            groupId: request.groupId,
            userId: request.user.id,
        };

        const actionHandler = action === 'accept' ? acceptJoinRequest : rejectJoinRequest;
        const actionName = action === 'accept' ? 'akceptowania' : 'odrzucania';

        try {
            const response = await actionHandler(payload);

            if (!response.success) {
                console.error(`Nie udało się dokończyć ${actionName} prośby.`, response.message);
            }
        } catch (err) {
            console.error(`Błąd podczas ${actionName} prośby.`, err);
        } finally {
            setActiveJoinRequestAction(null);
        }
    };

    const isJoinRequestActionInProgress = (userId: string, action: 'accept' | 'reject') =>
        isMutatingJoinRequest &&
        activeJoinRequestAction?.userId === userId &&
        activeJoinRequestAction?.action === action;

    const renderJoinRequestsDialogBody = () => {
        if (isFetchingJoinRequests && joinRequests.length === 0) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        minHeight: 180,
                    }}
                >
                    <CircularProgress size={36} />
                    <Typography color="text.secondary">
                        Ładuję prośby o dołączenie...
                    </Typography>
                </Box>
            );
        }

        if (joinRequestsError) {
            return (
                <Typography
                    sx={{
                        color: 'error.main',
                        textAlign: 'center',
                        py: 1,
                    }}
                >
                    {joinRequestsError}
                </Typography>
            );
        }

        if (joinRequests.length === 0) {
            return (
                <Typography
                    sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        py: 3,
                    }}
                >
                    Brak aktywnych próśb o dołączenie.
                </Typography>
            );
        }

        return (
            <Box
                sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxHeight: 'calc(70vh - 90px)',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${groupColor ? groupColor : theme.palette.primary.main} transparent`,
                })}
            >
                {joinRequests.map((request) => {
                    const { user } = request;
                    const fullName = [user.name, user.surname].filter(Boolean).join(' ').trim();
                    const displayName = fullName || user.username || 'Nieznany użytkownik';
                    const usernameLabel = user.username ? `@${user.username}` : null;
                    const initialsCandidate = `${user.name?.charAt(0) ?? ''}${user.surname?.charAt(0) ?? ''}`;
                    const initials =
                        (initialsCandidate.trim() || user.username?.charAt(0) || '?').toUpperCase();
                    const isAcceptLoading = isJoinRequestActionInProgress(user.id, 'accept');
                    const isRejectLoading = isJoinRequestActionInProgress(user.id, 'reject');

                    return (
                        <Box
                            key={`${request.groupId}-${user.id}`}
                            sx={(theme) => ({
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                // justifyItems: { xs: 'center', sm: 'center' },
                                gap: 2,
                                padding: 1.5,
                                borderRadius: 3,
                                border: `2px solid ${groupColor ? groupColor : theme.palette.grey[500]}`,
                                backgroundColor: theme.palette.grey[900],
                            })}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    flex: 1,
                                    minWidth: 0,
                                }}
                            >
                                <Avatar
                                    sx={(theme) => ({
                                        width: 44,
                                        height: 44,
                                        fontWeight: 600,
                                        bgcolor: groupColor || theme.palette.primary.main,
                                        color: theme.palette.getContrastText(
                                            groupColor || theme.palette.primary.main,
                                        ),
                                    })}
                                >
                                    {initials}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {displayName}
                                    </Typography>
                                    {usernameLabel && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {usernameLabel}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    justifyContent: { xs: 'center', sm: 'flex-end' },
                                    alignItems: { xs: 'center', sm: 'center' },
                                }}
                            >
                                <Button

                                    disabled={isMutatingJoinRequest}
                                    onClick={() => handleJoinRequestAction('accept', request)}
                                    sx={(theme) => ({
                                        // flexShrink: 0,
                                        minWidth: 80,
                                        fontWeight: 600,
                                        height: '40px',
                                        backgroundColor: theme.palette.success.main,
                                    })}
                                >
                                    {isAcceptLoading ? (
                                        <CircularProgress size={16} color="inherit" />
                                    ) : (
                                        'Akceptuj'
                                    )}
                                </Button>
                                <Button
                                    disabled={isMutatingJoinRequest}
                                    onClick={() => handleJoinRequestAction('reject', request)}
                                    sx={(theme) => ({
                                        flexShrink: 0,
                                        minWidth: 90,
                                        height: '40px',
                                        fontWeight: 600,
                                        backgroundColor: theme.palette.error.main,
                                    })}
                                >
                                    {isRejectLoading ? (
                                        <CircularProgress size={16} color="inherit" />
                                    ) : (
                                        'Odrzuć'
                                    )}
                                </Button>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
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
                            isAwaitingApproval={pendingJoinRequestUserIds.has(member.id)}
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
                        {canManageJoinRequests && (
                            <Button
                                startIcon={<UserPlus size={20} style={{ marginLeft: 4 }} />}
                                disabled={!groupId}
                                onClick={handleOpenJoinRequestsDialog}
                                sx={(theme) => ({
                                    backgroundColor: groupColor || theme.palette.primary.main,
                                    color: theme.palette.getContrastText(groupColor || theme.palette.primary.main),
                                    minWidth: 250,
                                    '&:disabled': {
                                        backgroundColor: theme.palette.action.disabledBackground,
                                        color: theme.palette.text.disabled,
                                    },
                                })}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 600 }}>
                                        Prośby o dołączenie
                                    </Typography>
                                    {shouldShowJoinRequestsSpinner ? (
                                        <CircularProgress size={18} />
                                    ) : (
                                        <Box
                                            sx={{
                                                px: 1,
                                                borderRadius: 30,
                                                textAlign: 'center',
                                                fontWeight: 700,
                                                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                                ml: 1,
                                            }}
                                        >
                                            {joinRequestsBadgeValue}
                                        </Box>
                                    )}
                                </Box>
                            </Button>
                        )}
                        <Button
                            startIcon={<Send size={20} />}
                            onClick={handleGenerateInvite}
                            disabled={!groupId || isGeneratingInvite}
                            sx={(theme) => ({
                                backgroundColor: groupColor || theme.palette.primary.main,
                                color: theme.palette.getContrastText(groupColor || theme.palette.primary.main),
                                minWidth: 250,
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
                open={joinRequestsDialogOpen}
                onClose={handleCloseJoinRequestsDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 600 }}>Prośby o dołączenie</DialogTitle>
                <DialogContent dividers>
                    {renderJoinRequestsDialogBody()}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseJoinRequestsDialog}
                        sx={(theme) => ({
                            color: theme.palette.getContrastText(groupColor || theme.palette.primary.main),
                            backgroundColor: groupColor || theme.palette.primary.main,
                            mt: 1,
                        })}
                    >
                        Zamknij
                    </Button>
                </DialogActions>
            </Dialog>

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
                        sx={(theme) => ({
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

