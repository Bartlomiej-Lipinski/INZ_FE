"use client";

import {useMemo} from 'react';
import {Avatar, Box, IconButton, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {ChevronRight} from 'lucide-react';

import {GroupMember} from '@/lib/types/user';
import {STORAGE_KEYS} from '@/lib/constants';
import {useAuthContext} from '@/contexts/AuthContext';

interface MemberItemProps {
  member: GroupMember;
  onClick?: () => void;
  isAwaitingApproval?: boolean;
    actionButton?: React.ReactNode;
}

export default function MemberItem({member, onClick, isAwaitingApproval = false, actionButton}: MemberItemProps) {
  const { user } = useAuthContext();
  const storeMemberSelection = () => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const payload = {
        ...member,
        birthDate: member.birthDate instanceof Date ? member.birthDate.toISOString() : member.birthDate,
        isAwaitingApproval,
      };

      localStorage.setItem(STORAGE_KEYS.SELECTED_GROUP_MEMBER, JSON.stringify(payload));
    } catch (error) {
      console.error('Member selection storage error:', error);
    }
  };

  const initials = useMemo(() => {
    const first = member.name?.charAt(0) ?? '';
    const last = member.surname?.charAt(0) ?? '';
    const fallback = member.username?.charAt(0) ?? '?';
    return (first + last || fallback).toUpperCase();
  }, [member.name, member.surname, member.username]);

  const handleClick = () => {
    storeMemberSelection();
    onClick?.();
  };

  return (
    <Box
      onClick={handleClick}
      role="button"
      tabIndex={0}
      sx={(theme) => ({
          position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        p: 2,
        bgcolor: alpha(theme.palette.grey[600], 0.4),
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        opacity: 1,
        '&:hover': {
          bgcolor: alpha(theme.palette.grey[600], 0.6),
          transform: 'translateY(-1px)',
        },
      })}
    >
        {actionButton && (
            <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                    position: 'absolute',
                    top: 25,
                    right: 80,
                    zIndex: 1,
                }}
            >
                {actionButton}
            </Box>
        )}

      <Avatar
        sx={(theme) => ({
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
          bgcolor: 'transparent',
          border: `2px solid ${theme.palette.grey[400]}`,
          fontSize: { xs: '14px', sm: '18px' },
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
            color: 'grey.400',
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

      {isAwaitingApproval && (
        <Typography
          sx={{
            color: 'warning.light',
            fontSize: '10px',
            textAlign: 'right',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            maxWidth: '50px',
            fontWeight: 600,
          }}
        >
          CZEKA NA AKCEPTACJĘ
        </Typography>
      )}

        {member.id === user?.id && !actionButton && (
            <Typography
                sx={{
                    color: 'text.secondary',
                    fontSize: '12px',
                    fontWeight: 600,
                }}
            >
          Ja
        </Typography>
      )}

      <IconButton
        size="small"
        sx={{
            color: 'grey.400',
        }}
        aria-hidden={false}
      >
        <ChevronRight size={24} strokeWidth={1.5} />
      </IconButton>
    </Box>
  );
}