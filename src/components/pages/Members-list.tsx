"use client";

import {useEffect, useMemo, useState} from 'react';
import {
    Box,
    CircularProgress,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import {Search, X} from 'lucide-react';

import MemberItem from '@/components/common/Member-item';
import {useMembers} from '@/hooks/use-members';

export default function MembersList() {
    const {members, isLoading, error, fetchGroupMembers} = useMembers();
    const [searchQuery, setSearchQuery] = useState('');
    const [groupId, setGroupId] = useState<string | null>(null);
    const [groupName, setGroupName] = useState<string>('');
    const [groupColor, setGroupColor] = useState<string>('');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const storedGroupId = localStorage.getItem('groupId');
        const storedGroupName = localStorage.getItem('groupName') ?? '';
        const storedGroupColor = localStorage.getItem('groupColor') ?? '';

        setGroupId(storedGroupId);
        setGroupName(storedGroupName);
        setGroupColor(storedGroupColor);
    }, []);

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

    const accentColor = groupColor || '#7C3AED';

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
                <CircularProgress size={48}/>
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
                        color: 'text.secondary',
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
                    pr: 1,
                    pt: 0.5,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        bgcolor: 'grey.700',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `${theme.palette.primary.main} !important`,
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
                        <MemberItem member={member}/>
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <Box
            sx={{
                position: 'relative',
                justifyItems: 'center',
                maxWidth: '80%',
                mx: 'auto',
                mt: 1,
                mb: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(70vh - 300px)',
                '&::before': {
                    content: '""',
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '90vh',
                    background: `radial-gradient(ellipse 150% 100% at bottom center, ${accentColor}80 0%, ${accentColor}30 40%, transparent 70%)`,
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                '& > *': {
                    position: 'relative',
                    zIndex: 1,
                },
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
                <Typography
                    sx={{
                        color: 'text.secondary',
                        fontSize: '18px',
                        mb: 1,
                    }}
                >
                    {groupName ? `Członkowie grupy ${groupName}` : 'Lista członków'}
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Wyszukaj członka"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} style={{color: 'inherit', opacity: 0.7}}/>
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
                                        <X size={18}/>
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
                    px: {xs: 3, sm: 5},
                    py: {xs: 3, sm: 4},
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.grey[700]}`,
                    boxShadow: '0 16px 45px rgba(0, 0, 0, 0.35)',
                    color: theme.palette.text.primary,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2.5,
                    backdropFilter: 'blur(6px)',
                })}
            >
                {renderListContent()}
            </Box>
        </Box>
    );
}

