"use client";

import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSearchParams } from 'next/navigation';
import GroupHeader from '@/components/layout/Group-header';
import { LogOut, Settings2, Trash2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

export default function GroupOptionsPage() {
    const searchParams = useSearchParams();
    const theme = useTheme();
    const { user } = useAuthContext();
    const [showLeaveGroupConfirm, setShowLeaveGroupConfirm] = useState(false);

    const groupId = searchParams?.get('groupId') ?? '';
    const groupColorParam = searchParams?.get('groupColor') ?? '';

    const groupColor = groupColorParam ? decodeURIComponent(groupColorParam) : theme.palette.primary.main;
    const isAdmin = user?.role === 'Admin';

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
                                        sx={{
                                            minWidth: { xs: 'auto', sm: 120 },
                                            backgroundColor: theme.palette.grey[800],
                                            border: `1px solid ${theme.palette.grey[700]}`,
                                        }}
                                        onClick={() => {
                                            // TO-DO: logic to leave group
                                            setShowLeaveGroupConfirm(false);
                                        }}
                                    >
                                        Tak
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
        </Box>
    );
}

