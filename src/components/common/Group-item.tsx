"use client";

import { Box, Typography, IconButton, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ChevronRight } from 'lucide-react';
import { Group } from '@/lib/types/group';

interface GroupItemProps {
  group: Group;
  onClick?: () => void;
  disabled?: boolean;
}

export default function GroupItem({ group, onClick, disabled = false }: GroupItemProps) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 3.5,
        p: 2,
        bgcolor: alpha(theme.palette.grey[700], 0.6),
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : (onClick ? 'pointer' : 'default'),
        transition: 'all 0.2s ease-in-out',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        border: '2px solid transparent',
        opacity: disabled ? 0.5 : 1,
        '&:hover': disabled ? {} : {
          bgcolor: alpha(theme.palette.grey[600], 0.7),
          transform: 'translateY(-1px)',
          borderColor: group.color,
        },
      })}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: {xs: 40, sm: 48},
          height: {xs: 40, sm: 48},
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
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
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