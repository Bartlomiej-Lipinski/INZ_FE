"use client";

import { useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
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
  ]);

  const handleGroupClick = (group: Group) => {
    // TODO: implement a navigation to the group details
    console.log('Grupa:', group.name);
  };

  return (
    <Box
      sx={{
        justifyItems: 'center',
        maxWidth: '80%',
        minHeight: '100vh',
        mx: 'auto',
      }}
    >
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
        <Stack spacing={1.5}>
          {groups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              onClick={() => handleGroupClick(group)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
