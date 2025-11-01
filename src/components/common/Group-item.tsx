"use client";

import { Box, Typography, IconButton, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ChevronRight } from 'lucide-react';
import { Group } from '@/lib/types/group';

interface GroupItemProps {
  group: Group;
  onClick?: () => void;
}

export default function GroupItem({ group, onClick }: GroupItemProps) {
  return (
    <Box
      onClick={onClick}
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: alpha(theme.palette.grey[700], 0.6),
        borderRadius: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover':  {
          bgcolor: alpha(theme.palette.grey[600], 0.7),
          transform: 'translateY(-1px)',
        },
      })}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 48,
          height: 48,
          bgcolor: 'grey.600',
          flexShrink: 0,
          fontSize: '18px',
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        {group.name.charAt(0).toUpperCase()}
      </Avatar>

      {/* Group name */}
      <Typography
        sx={{
          flex: 1,
          color: 'text.primary',
          fontSize: '16px',
          fontWeight: 500,
          textAlign: 'center',
        }}
      >
        {group.name}
      </Typography>

      {/* Navigation arrow */}
      <IconButton
        size="small"
        sx={{
          color: 'text.primary',
          p: 0.5,
        }}
        disableRipple
      >
        <ChevronRight size={24} strokeWidth={1.5} />
      </IconButton>
    </Box>
  );
}