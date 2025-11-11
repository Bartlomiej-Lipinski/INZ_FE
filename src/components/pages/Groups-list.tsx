"use client";

import {useState, useMemo, useEffect} from 'react';
import {Box, Typography, TextField, InputAdornment, IconButton} from '@mui/material';
import {Search, X} from 'lucide-react';
import {Group} from '@/lib/types/group';
import GroupItem from '@/components/common/Group-item';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";

interface ApiResponse {
    success: boolean;
    data?: Group[];
    message?: string;
}

export default function GroupsList() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const response = await fetchWithAuth(`${API_ROUTES.USER_GROUPS}`, {method: 'GET'});
                if (response.ok) {
                    const json = await response.json() as ApiResponse;
                    const data: Group[] = json?.data || [];
                    setGroups(data);
                } else {
                    console.error('Failed to fetch groups:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

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


   // TO-DO: implement a navigation to the group details
  const handleGroupClick = (group: Group) => {
    console.log('Grupa:', group.name);
  };

  return (
    <Box
      sx={{
        justifyItems: 'center',
        maxWidth: '80%',
        mx: 'auto',
        mt: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(70vh - 300px)',
      }}
    >
      {/* search box */}
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
                  <Search size={20} style={{ color: 'inherit', opacity: 0.7 }} />
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
            gridTemplateColumns: filteredGroups.length === 1 
              ? '1fr' 
              : {
                  xs:  '1fr',
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
                backgroundColor:  `${theme.palette.primary.main} !important`,
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
            >
              <GroupItem
                group={group}
                onClick={() => handleGroupClick(group)}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}