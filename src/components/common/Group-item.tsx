"use client";

import {useCallback} from 'react';
import {Avatar, Box, CircularProgress, IconButton, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {ChevronRight} from 'lucide-react';
import {Group} from '@/lib/types/group';
import {useIsAdmin} from '@/hooks/use-isAdmin';

interface GroupItemProps {
  group: Group;
  onClick?: () => void;
  disabled?: boolean;
}

export default function GroupItem({ group, onClick, disabled = false }: GroupItemProps) {
  const { verifyIsUserAdmin, isLoading } = useIsAdmin();

  const handleClick = useCallback(async () => {
    if (!onClick) {
      return;
    }

    try {
      await verifyIsUserAdmin(group.id);
    } finally {
      onClick();
    }
  }, [group.id, onClick, verifyIsUserAdmin]);

  const isClickable = Boolean(onClick) && !disabled && !isLoading;
  const showDisabledState = disabled || isLoading;

  return (
    <Box
      onClick={isClickable ? handleClick : undefined}
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 3.5,
        p: 2,
        bgcolor: alpha(theme.palette.grey[700], 0.6),
        borderRadius: 2,
        cursor: showDisabledState ? 'not-allowed' : (onClick ? 'pointer' : 'default'),
        transition: 'all 0.2s ease-in-out',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        border: '2px solid transparent',
        opacity: showDisabledState ? 0.5 : 1,
        '&:hover': (!isClickable) ? {} : {
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
          border: '2px solid transparent',
          borderColor: group.color,
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
        {isLoading ? (
          <CircularProgress size={20} sx={{color: 'text.primary'}} />
        ) : (
          <ChevronRight size={24} strokeWidth={1.5} />
        )}
      </IconButton>
    </Box>
  );
}