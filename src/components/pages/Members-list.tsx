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

export default function MembersList({groupId, groupColor}: {groupId: string | null, groupColor: string}) {
    const {members, isLoading, error, fetchGroupMembers} = useMembers();
    const [searchQuery, setSearchQuery] = useState('');


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
                    // pr: 1,
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
                // mt: 1,
                // mb: 5,
                // display: 'flex',
                // flexDirection: 'column',
                // alignItems: 'center',
                // justifyContent: 'center',
                // minHeight: 'calc(70vh - 300px)',
                // '&::before': {
                //     content: '""',
                //     position: 'fixed',
                //     bottom: 0,
                //     left: 0,
                //     right: 0,
                //     height: '90vh',
                //     pointerEvents: 'none',
                //     zIndex: 0,
                // },
                // '& > *': {
                //     position: 'relative',
                //     zIndex: 1,
                // },
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
                                    <Search size={20} style={{opacity: 0.7}}/>
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
                    border: `1px solid ${groupColor ? groupColor : theme.palette.grey[700]}`,
                    boxShadow: '0 16px 45px rgba(0, 0, 0, 0.35)',
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

