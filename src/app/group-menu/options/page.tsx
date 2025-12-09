"use client";

import { useCallback, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import GroupHeader from '@/components/layout/Group-header';
import { LogOut, Settings2, Trash2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMembers } from '@/hooks/use-members';
import { AddGroupModal } from '@/components/modals/add-group-modal';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { API_ROUTES } from '@/lib/api/api-routes-endpoints';

export default function GroupOptionsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const { user } = useAuthContext();
    const { removeGroupMember } = useMembers();
    const [showLeaveGroupConfirm, setShowLeaveGroupConfirm] = useState(false);
    const [isLeavingGroup, setIsLeavingGroup] = useState(false);
    const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);

    const searchParamsString = searchParams.toString();
    const groupId = searchParams?.get('groupId') ?? '';
    const groupNameParam = searchParams?.get('groupName') ?? '';
    const groupColorParam = searchParams?.get('groupColor') ?? '';
    const userId = user?.id ?? '';

    const groupName = groupNameParam ? decodeURIComponent(groupNameParam) : '';
    const groupColor = groupColorParam ? decodeURIComponent(groupColorParam) : theme.palette.primary.main;
    const isAdmin = user?.role === 'Admin';

    // TO-DO: logic to leave group
    const handleLeaveGroupConfirm = useCallback(async () => {
        // if (!groupId || !userId) {
        //     console.warn("Brak wymaganych danych do opuszczenia grupy.");
        //     return;
        // }

        // setIsLeavingGroup(true);

        // try {
        //     const response = await removeGroupMember(groupId, userId);

        //     if (response.success) {
        //         setShowLeaveGroupConfirm(false);
        //         router.push('/');
        //     }
        // } finally {
        //     setIsLeavingGroup(false);
        // }
    }, [groupId, removeGroupMember, router, userId]);

    const handleUpdateGroup = useCallback(async (name: string, color: string) => {
        if (!groupId) {
            console.warn('Brak identyfikatora grupy - przerwano aktualizację.');
            return;
        }

        try {
            const response = await fetchWithAuth(API_ROUTES.GROUP_BY_ID, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: groupId, name, color }),
            });

            if (response.ok) {
                const params = new URLSearchParams(searchParamsString);
                params.set('groupName', name);
                params.set('groupColor', color);
                router.replace(`${pathname}?${params.toString()}`);
            }
        } catch (error) {
            console.error('Nie udało się zaktualizować grupy:', error);
        }
    }, [groupId, pathname, router, searchParamsString]);

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <GroupHeader
                title="Opcje grupy"
                leftIcon={<Settings2 size={35} color="white" />}
            />

            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    px: { xs: 2, sm: 4 },
                    pb: { xs: 6, sm: 8 },
                }}
            >
                <Box
                    sx={(theme) => ({
                        width: '100%',
                        maxWidth: 900,
                        px: { xs: 3, sm: 5 },
                        py: { xs: 3, sm: 4 },
                        borderRadius: 4,
                        border: `1px solid ${groupColor || theme.palette.grey[700]}`,
                        boxShadow: '0 16px 45px rgba(0, 0, 0, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 5,
                        backdropFilter: 'blur(6px)',
                    })}
                >

                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Panel akcji
                    </Typography>


                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 420,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                        }}
                    >
                        {!showLeaveGroupConfirm && (
                            <Button
                                startIcon={<LogOut size={20} />}
                                disabled={!groupId}
                                onClick={() => setShowLeaveGroupConfirm(true)}
                                sx={{
                                    minHeight: 56,
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    bgcolor: theme.palette.grey[700],
                                    color: theme.palette.getContrastText(theme.palette.grey[800]),
                                    '&:hover': {
                                        bgcolor: theme.palette.grey[700],
                                    },
                                }}
                            >
                                Opuść grupę
                            </Button>
                        )}

                        {showLeaveGroupConfirm && (
                            <Box
                                sx={{
                                    width: '100%',
                                    p: { xs: 2.5, sm: 3 },
                                    borderRadius: 2,
                                    border: `1px solid ${theme.palette.warning.light}`,
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    alignItems: 'center',
                                }}
                            >
                                <Typography fontWeight={600} textAlign="center" mb={1.5}>
                                    Czy na pewno chcesz opuścić tę grupę?
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        justifyContent: 'center',
                                        alignItems: 'stretch',
                                        gap: { xs: 1.5, sm: 3 },
                                        width: '100%',
                                    }}
                                >
                                    <Button
                                        fullWidth
                                        disabled={isLeavingGroup}
                                        sx={{
                                            minWidth: { xs: 'auto', sm: 120 },
                                            backgroundColor: theme.palette.grey[800],
                                            border: `1px solid ${theme.palette.grey[700]}`,
                                        }}
                                        onClick={handleLeaveGroupConfirm}
                                    >
                                        {isLeavingGroup ? 'Opuszczanie...' : 'Tak'}
                                    </Button>

                                    <Button
                                        fullWidth
                                        sx={{
                                            minWidth: { xs: 'auto', sm: 120 },
                                            backgroundColor: groupColor,
                                            color: theme.palette.getContrastText(groupColor),
                                        }}
                                        onClick={() => setShowLeaveGroupConfirm(false)}
                                    >
                                        Nie
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        <Button
                            startIcon={<Settings2 size={20} />}
                            disabled={!isAdmin}
                            onClick={() => setIsEditGroupModalOpen(true)}
                            sx={{
                                minHeight: 56,
                                fontWeight: 600,
                                borderRadius: 2,
                                textTransform: 'none',
                                bgcolor: groupColor,
                                color: theme.palette.getContrastText(groupColor),
                                '&:disabled': {
                                    bgcolor: theme.palette.action.disabledBackground,
                                    color: theme.palette.text.disabled,
                                },
                            }}
                        >
                            Zmień dane grupy
                        </Button>

                        <Button
                            startIcon={<Trash2 size={20} />}
                            disabled={!isAdmin}
                            sx={{
                                minHeight: 56,
                                fontWeight: 600,
                                borderRadius: 2,
                                textTransform: 'none',
                                bgcolor: theme.palette.error.main,
                                color: theme.palette.getContrastText(theme.palette.error.main),
                                '&:disabled': {
                                    bgcolor: theme.palette.action.disabledBackground,
                                    color: theme.palette.text.disabled,
                                },
                            }}
                        >
                            Usuń grupę
                        </Button>
                    </Box>

                    {!isAdmin && (
                        <Typography variant="caption" color="white" sx={{ textAlign: 'center' }}>
                            Aby zmienić dane grupy lub ją usunąć, wymagane są uprawnienia administratora.
                        </Typography>
                    )}
                </Box>
            </Box>
            <AddGroupModal
                isOpen={isEditGroupModalOpen}
                onClose={() => setIsEditGroupModalOpen(false)}
                onAdd={handleUpdateGroup}
                mode="update"
                initialGroupName={groupName}
                initialColor={groupColor}
            />
        </Box>
    );
}

