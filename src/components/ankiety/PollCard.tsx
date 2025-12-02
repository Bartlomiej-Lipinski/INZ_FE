import {Avatar, AvatarGroup, Box, Card, CardContent, Chip, Divider, IconButton, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {Check, Clock, Trash2, Users} from 'lucide-react';
import {PollResponseDto} from "@/lib/types/ankiety";

interface PollCardProps {
    poll: PollResponseDto;
    onVote: (pollId: string, optionId: string) => void;
    onDelete: (pollId: string) => void;
    groupColor: string;
    isOwner: boolean;
    currentUserId: string;
}

export default function PollCard({poll, onVote, onDelete, groupColor, isOwner, currentUserId}: PollCardProps) {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votedUsersIds.length, 0);
    const userVotedOption = poll.options.find(opt => opt.votedUsersIds.includes(currentUserId));

    return (
        <Card
            sx={{
                bgcolor: 'rgba(50, 50, 50, 0.6)',
                borderRadius: 3,
                overflow: 'hidden',
            }}
        >
            <CardContent sx={{p: 3}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
                    <Box sx={{flex: 1, pr: 2}}>
                        <Typography variant="h6" sx={{fontWeight: 600, mb: 1.5, fontSize: '1.1rem'}}>
                            {poll.question}
                        </Typography>
                        <Box sx={{display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap'}}>
                            <Chip
                                icon={<Users size={14}/>}
                                label={`${totalVotes} ${totalVotes === 1 ? 'głos' : totalVotes < 5 ? 'głosy' : 'głosów'}`}
                                size="small"
                                sx={{
                                    bgcolor: alpha(groupColor, 0.15),
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    '& .MuiChip-icon': {color: groupColor},
                                }}
                            />
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary'}}>
                                <Clock size={14}/>
                                <Typography variant="caption">
                                    {new Date(poll.createdAt).toLocaleString('pl-PL', {
                                        day: 'numeric',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    {isOwner && (
                        <IconButton
                            size="small"
                            onClick={() => onDelete(poll.id!)}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'error.main',
                                    bgcolor: alpha('#f44336', 0.1),
                                },
                            }}
                        >
                            <Trash2 size={20}/>
                        </IconButton>
                    )}
                </Box>

                <Divider sx={{mb: 2.5}}/>

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                    {poll.options.map((option) => {
                        const voteCount = option.votedUsersIds.length;
                        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                        const isSelected = option.votedUsersIds.includes(currentUserId);

                        return (
                            <Box key={option.id}>
                                <Box
                                    onClick={() => onVote(poll.id!, option.id)}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        border: `2px solid ${isSelected ? groupColor : alpha('#fff', 0.15)}`,
                                        bgcolor: isSelected ? alpha(groupColor, 0.15) : 'rgba(255, 255, 255, 0.06)',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: isSelected ? alpha(groupColor, 0.2) : 'rgba(255, 255, 255, 0.12)',
                                            borderColor: isSelected ? groupColor : alpha(groupColor, 0.5),
                                            transform: 'translateX(4px)',
                                        },
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 1.5
                                    }}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, flex: 1}}>
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    border: `2px solid ${isSelected ? groupColor : alpha('#fff', 0.3)}`,
                                                    bgcolor: isSelected ? groupColor : 'transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {isSelected && <Check size={14} color="white"/>}
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontWeight: isSelected ? 600 : 500,
                                                    fontSize: '0.95rem',
                                                    color: isSelected ? 'text.primary' : 'text.secondary',
                                                }}
                                            >
                                                {option.text}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                color: groupColor,
                                                minWidth: 70,
                                                textAlign: 'right',
                                            }}
                                        >
                                            {voteCount} ({Math.round(percentage)}%)
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 8,
                                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            mb: voteCount > 0 ? 1.5 : 0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                bgcolor: groupColor,
                                                borderRadius: 1,
                                                transition: 'width 0.3s ease',
                                            }}
                                        />
                                    </Box>

                                    {voteCount > 0 && (
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, pl: 5}}>
                                            <AvatarGroup
                                                max={4}
                                                sx={{
                                                    '& .MuiAvatar-root': {
                                                        width: 28,
                                                        height: 28,
                                                        fontSize: '0.75rem',
                                                        border: '2px solid',
                                                        borderColor: 'background.paper',
                                                        bgcolor: alpha(groupColor, 0.8),
                                                    },
                                                }}
                                            >
                                                {option.votedUsersIds.map((userId) => (
                                                    <Avatar key={userId}>
                                                        {userId.charAt(userId.length - 1)}
                                                    </Avatar>
                                                ))}
                                            </AvatarGroup>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                {userVotedOption && (
                    <Box
                        sx={{
                            mt: 2.5,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(groupColor, 0.08),
                            border: `1px solid ${alpha(groupColor, 0.2)}`,
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                textAlign: 'center',
                                color: 'text.secondary',
                                fontSize: '0.85rem',
                            }}
                        >
                            Twój głos: <strong style={{color: groupColor}}>{userVotedOption.text}</strong>
                            {' • Kliknij ponownie, aby zmienić'}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}