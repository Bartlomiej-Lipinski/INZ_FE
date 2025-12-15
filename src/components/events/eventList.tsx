"use client";

import {
    alpha,
    Avatar,
    AvatarGroup,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    IconButton,
    Typography
} from '@mui/material';
import {Calendar as CalendarIcon, MapPin, Trash2} from 'lucide-react';
import {EventResponseDto} from '@/lib/types/event';
import {useImageUrl} from "@/hooks/useImageUrl";

interface EventsListProps {
    events: EventResponseDto[];
    onViewDetails: (event: EventResponseDto) => void;
    currentUserId?: string;
    onDelete?: (eventId: string) => void;
}

function formatDateTime(date: string, startTime: string, endTime?: string): string {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    if (endTime) {
        return `${formattedDate}, ${startTime} - ${endTime}`;
    }
    return `${formattedDate}, ${startTime}`;
}

function getStatusLabel(status: number): string {
    switch (status) {
        case 0:
            return 'Będę';
        case 1:
            return 'Nie mogę';
        case 2:
            return 'Może';
        default:
            return '';
    }
}

function getStatusColor(status: number): string {
    switch (status) {
        case 0:
            return '#4caf50';
        case 1:
            return '#f44336';
        case 2:
            return '#ff9800';
        default:
            return '#999';
    }
}

function EventAvatar({user}: { user: EventResponseDto['availabilities'][0]['user'] }) {
    const avatarUrl = useImageUrl(user.profilePicture?.id);
    return (
        <Avatar src={avatarUrl || undefined} sx={{width: 32, height: 32}}>
            {user.name?.[0]?.toUpperCase() || user.username[0]}
        </Avatar>
    );
}

export default function EventsList({events, onViewDetails, currentUserId, onDelete}: EventsListProps) {

    if (events.length === 0) {
        return (
            <Card sx={{borderRadius: 3, p: 4, textAlign: 'center'}}>
                <CalendarIcon size={64} style={{opacity: 0.5, margin: '0 auto 16px'}}/>
                <Typography variant="h6" sx={{mb: 1}}>
                    Brak wydarzeń
                </Typography>
                <Typography color="text.secondary">Stwórz pierwsze wydarzenie dla grupy</Typography>
            </Card>
        );
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            {events.map((event) => {
                const userAvailability = event.availabilities.find((a) => a.user.id === currentUserId);
                const isOwner = event.user.id === currentUserId;

                return (
                    <Card
                        key={event.id}
                        sx={{
                            borderRadius: 3,
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': {transform: 'translateY(-2px)'},
                        }}
                        onClick={() => onViewDetails(event)}
                    >
                        {event.imageUrl && (
                            <CardMedia component="img" height="200" image={event.imageUrl} alt={event.title}/>
                        )}
                        <CardContent sx={{position: 'relative'}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <Typography variant="h6" sx={{fontWeight: 600, mb: 1}}>
                                    {event.title}
                                </Typography>
                                {/* spacer */}
                                <Box sx={{flex: 1}}/>
                                {isOwner && onDelete && (
                                    <IconButton
                                        aria-label="usuń wydarzenie"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(event.id);
                                        }}
                                    >
                                        <Trash2 size={16}/>
                                    </IconButton>
                                )}
                            </Box>

                            {event.startDate && event.endDate && (
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                    <CalendarIcon size={16}/>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDateTime(event.startDate, event.startDate.split('T')[1]?.substring(0, 5) || '', event.endDate.split('T')[1]?.substring(0, 5))}
                                    </Typography>
                                </Box>
                            )}

                            {event.isAutoScheduled && (
                                <Chip label="Planowanie terminu w toku" size="small" color="warning" sx={{mb: 1}}/>
                            )}

                            {event.location && (
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                    <MapPin size={16}/>
                                    <Typography variant="body2" color="text.secondary">
                                        {event.location}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{display: 'flex', gap: 1, alignItems: 'center', mt: 2}}>
                                {event.startDate && (
                                    <>
                                        <AvatarGroup max={3} sx={{mr: 1}}>
                                            {event.availabilities
                                                .filter((a) => a.status === 0)
                                                .slice(0, 3)
                                                .map((a) => (
                                                    <EventAvatar key={a.user.id} user={a.user}/>
                                                ))}
                                        </AvatarGroup>
                                        <Typography variant="body2" color="text.secondary">
                                            {event.availabilities.filter((a) => a.status === 0).length} osób
                                        </Typography>
                                    </>
                                )}

                                {userAvailability && (
                                    <Chip
                                        label={getStatusLabel(userAvailability.status)}
                                        size="small"
                                        sx={{
                                            ml: 'auto',
                                            bgcolor: alpha(getStatusColor(userAvailability.status), 0.2),
                                            color: getStatusColor(userAvailability.status),
                                        }}
                                    />
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
        </Box>
    );
}