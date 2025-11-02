"use client";

import { useState, useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, X } from 'lucide-react';
import { Group } from '@/lib/types/group';
import GroupItem from '@/components/common/Group-item';

export default function GroupsList() {
  const [groups] = useState<Group[]>([
    {
        id: '1',
        name: 'Grupa Roboczaaaaaaaaaaaaaaaaaaaaaa',
        color: '#9042fb',
      },
      {
        id: '2',
        name: 'Projekt Alpha',
        color: '#2196f3',
      },
      {
        id: '3',
        name: 'Zespół Marketing',
        color: '#4caf50',
      },
      {
        id: '4',
        name: 'Development Team',
        color: '#ff9800',
      },
      {
        id: '5',
        name: 'Design Studio',
        color: '#e91e63',
      },
      {
        id: '6',
        name: 'QA Department',
        color: '#9c27b0',
      },
      {
        id: '7',
        name: 'Design Studio',
        color: '#e91e63',
      },
      {
        id: '8',
        name: 'QA Department',
        color: '#9c27b0',
      },
      {
        id: '9',
        name: 'Design Studio',
        color: '#e91e63',
      },
      {
        id: '10',
        name: 'QA Department',
        color: '#9c27b0',
      }, 
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const handleGroupClick = (group: Group) => {
    // TODO: implement a navigation to the group details
    console.log('Grupa:', group.name);
  };

  return (
    <Box
      sx={{
        justifyItems: 'center',
        maxWidth: '80%',
        mx: 'auto',
        mt: 1,
      }}
    >
      {/* search box */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '300px',
          mx: 'auto',
          mb: 4,
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
            minHeight: '50vh',
          }}
        >
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '16px',
              textAlign: 'center',
            }}
          >
            Brak grup. Dodaj pierwszą grupę, aby rozpocząć.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs:  '1fr',
              sm: 'repeat(2, 1fr)',
            },
            gap: 3,
            width: '100%',
            maxWidth: '800px',
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'grey.700',
              borderRadius: '4px',
              '&:hover': {
                bgcolor: 'grey.600',
              },
            },
          }}
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
