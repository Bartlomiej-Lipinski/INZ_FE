"use client";

import {useCallback, useEffect, useMemo, useState} from 'react';
import {Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography,} from '@mui/material';
import {Search, X} from 'lucide-react';
import {Group} from '@/lib/types/group';
import GroupItem from '@/components/common/Group-item';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";
import {AddGroupModal} from '@/components/modals/add-group-modal';
import {JoinGroupModal} from '@/components/modals/join-group-modal';
import {useRouter} from 'next/navigation';


interface ApiResponse {
    success: boolean;
    data?: Group[] | Group;
    message?: string;
}

export default function GroupsList() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [groups, setGroups] = useState<Group[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGroupColor, setSelectedGroupColor] = useState<string | null>(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const router = useRouter();

    const loadGroups = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`${API_ROUTES.USER_GROUPS}`, {method: 'GET'});
            if (response.ok) {
                const json = await response.json() as ApiResponse;
                const data: Group[] = Array.isArray(json?.data) ? (json.data) : (json.data ? [json.data] : []);
                setGroups(data);
            } else {
                console.error('Failed to fetch groups:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGroups();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('currentGroupColor');
            localStorage.removeItem('groupColor');
            localStorage.removeItem('groupId');
            localStorage.removeItem('groupName');
        }
    }, [loadGroups]);

    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) {
            return groups;
        }
        return groups.filter((group) =>
            group.name.toLowerCase().startsWith(searchQuery.toLowerCase())
        );
    }, [groups, searchQuery]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleAddGroup = async (name: string, color: string) => {
        try {
            const response = await fetchWithAuth(API_ROUTES.ADD_GROUP, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, color}),
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    const json = await response.json() as ApiResponse;
                    if (json.data) {
                        const newGroup = Array.isArray(json.data) ? json.data[0] : json.data;
                        setGroups(prev => [...prev, newGroup]);
                    }
                } else {
                    console.error('Expected JSON response, got:', contentType);
                }
            } else {
                console.error('Failed to add group:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error adding group:', error);
        }
    };


    const handleJoin = async (code: string) => {
        try {
            const response = await fetchWithAuth(API_ROUTES.JOIN_GROUP, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({groupCode: code}),
            });
            if (response.ok) {
                await loadGroups();
                return true;
            } else {
                const text = await response.text();
                console.error('Join failed:', response.status, response.statusText, text);
                return false;
            }
        } catch (err) {
            console.error('Join error:', err);
            return false;
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
                <CircularProgress size={48}/>
            </Box>
        );
    }

    const handleGroupClick = (group: Group) => {
        localStorage.setItem('groupId', group.id)
        localStorage.setItem('groupName', group.name)
        localStorage.setItem('groupColor', group.color)
        router.push(`/group-menu`);
    };

    const handleGroupMouseEnter = (group: Group) => {
        setSelectedGroupColor(group.color);
    };

    const handleGroupMouseLeave = () => {
        setSelectedGroupColor(null);
    };

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    justifyItems: 'center',
                    maxWidth: '80%',
                    mx: 'auto',
                    mt: 1,
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
                        background: selectedGroupColor
                            ? `radial-gradient(ellipse 150% 100% at bottom center, ${selectedGroupColor}80 0%, ${selectedGroupColor}30 40%, transparent 70%)`
                            : 'transparent',
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
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder="Wyszukaj swoją grupę"
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

                {groups.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '30vh',
                        }}
                    >
                        <Typography
                            sx={{
                                color: 'text.secondary',
                                fontSize: '20px',
                                textAlign: 'center',
                            }}
                        >
                            Brak grup. Dodaj pierwszą grupę, aby rozpocząć.
                        </Typography>
                    </Box>
                ) : filteredGroups.length === 0 && searchQuery.trim() ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '30vh',
                        }}
                    >
                        <Typography
                            sx={{
                                color: 'text.secondary',
                                fontSize: '20px',
                                textAlign: 'center',
                            }}
                        >
                            Nie znaleziono grupy
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={(theme) => ({
                            display: 'grid',
                            gridTemplateColumns:
                                filteredGroups.length === 1
                                    ? '1fr'
                                    : {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                    },
                            gap: 3,
                            width: '100%',
                            maxWidth: filteredGroups.length === 1 ? '400px' : '800px',
                            maxHeight: 'calc(70vh - 150px)',
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
                        {filteredGroups.map((group) => (
                            <Box
                                key={group.id}
                                sx={{
                                    minWidth: 0,
                                    width: '100%',
                                    maxWidth: '100%',
                                }}
                                onMouseEnter={() => handleGroupMouseEnter(group)}
                                onMouseLeave={handleGroupMouseLeave}
                            >
                                <GroupItem group={group} onClick={() => handleGroupClick(group)}/>
                            </Box>
                        ))}
                    </Box>
                )}

                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setIsModalOpen(true)}
                    sx={{
                        mt: 3,
                        maxWidth: '400px',
                        borderStyle: 'dashed',
                        color: 'text.primary',
                        borderWidth: 2,
                    }}
                >
                    + Dodaj grupę
                </Button>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setIsJoinModalOpen(true)}
                    sx={{
                        mt: 1,
                        maxWidth: '400px',
                        textTransform: 'none',
                    }}
                >
                    Dołącz do grupy
                </Button>

                <AddGroupModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={handleAddGroup}
                />

                <JoinGroupModal
                    isOpen={isJoinModalOpen}
                    onClose={() => setIsJoinModalOpen(false)}
                    onJoin={handleJoin}
                />
            </Box>
        </>
    );
}