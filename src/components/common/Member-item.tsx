"use client";

import {useMemo} from 'react';
import {Avatar, Box, IconButton, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {ChevronRight} from 'lucide-react';

import {GroupMember} from '@/lib/types/user';

interface MemberItemProps {
  member: GroupMember;
  onClick?: () => void;
  disabled?: boolean;
}

export default function MemberItem({member, onClick, disabled = false}: MemberItemProps) {
  const initials = useMemo(() => {
    const first = member.name?.charAt(0) ?? '';
    const last = member.surname?.charAt(0) ?? '';
    const fallback = member.username?.charAt(0) ?? '?';
    return (first + last || fallback).toUpperCase();
  }, [member.name, member.surname, member.username]);

  const isClickable = Boolean(onClick) && !disabled;

  const handleClick = () => {
    if (!isClickable || !onClick) {
      return;
    }
    onClick();
  };

  return (
    <Box
      onClick={isClickable ? handleClick : undefined}
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 3.5,
        p: 2,
        bgcolor: alpha(theme.palette.grey[700], 0.4),
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : (onClick ? 'pointer' : 'default'),
        transition: 'all 0.2s ease-in-out',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        border: '2px solid transparent',
        opacity: disabled ? 0.5 : 1,
        '&:hover': (!isClickable) ? {} : {
          bgcolor: alpha(theme.palette.grey[600], 0.7),
          transform: 'translateY(-1px)',
          borderColor: theme.palette.primary.main,
        },
      })}
    >
      <Avatar
        sx={(theme) => ({
          width: {xs: 40, sm: 48},
          height: {xs: 40, sm: 48},
          bgcolor: 'transparent',
          border: `2px solid ${theme.palette.grey[600]}`,
          flexShrink: 0,
          fontSize: '18px',
          fontWeight: 600,
          color: 'text.primary',
        })}
      >
        {initials}
      </Avatar>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Typography
          sx={{
            color: 'text.primary',
            fontSize: '16px',
            fontWeight: 600,
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {member.name} {member.surname}
        </Typography>
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: '14px',
            fontWeight: 400,
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {member.username ? `@${member.username}` : 'Brak nazwy użytkownika'}
        </Typography>
      </Box>

      {onClick && (
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
      )}
    </Box>
  );
}

