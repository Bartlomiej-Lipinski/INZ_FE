"use client";

import {
    Alert,
    alpha,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Divider,
    Typography
} from '@mui/material';
import {ArrowLeft, Calendar as CalendarIcon, MapPin} from 'lucide-react';
import {EventAvailabilityStatus, EventResponseDto} from '@/lib/types/event';
import {useImageUrl} from "@/hooks/useImageUrl";

interface EventDetailsProps {
    event: EventResponseDto;
    currentUserId: string;
    groupColor: string;
    onBack: () => void;
    onEdit: (event: EventResponseDto) => void;
    onAddAvailability: () => void;
    onFinishPlanning: () => void;
    onSetAvailability: (status: EventAvailabilityStatus) => void;
    onRemoveAvailability: () => void;
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

function AvailabilityItem({avail}: { avail: EventResponseDto['availabilities'][0] }) {
    const avatarUrl = useImageUrl(avail.user.profilePicture?.id);
    return (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
            <Avatar src={avatarUrl || undefined} sx={{width: 32, height: 32}}>
                {avail.user.name?.[0]?.toUpperCase() || avail.user.username[0]}
            </Avatar>
            <Typography variant="body2">{avail.user.username}</Typography>
            <Chip
                label={getStatusLabel(avail.status)}
                size="small"
                sx={{
                    ml: 'auto',
                    bgcolor: alpha(getStatusColor(avail.status), 0.2),
                    color: getStatusColor(avail.status),
                }}
            />
        </Box>
    );
}

export default function EventDetails({
                                         event,
                                         currentUserId,
                                         groupColor,
                                         onBack,
                                         onEdit,
                                         onAddAvailability,
                                         onFinishPlanning,
                                         onSetAvailability,
                                         onRemoveAvailability,
                                     }: EventDetailsProps) {
    const userAvailability = event.availabilities.find(a => a.user.id === currentUserId);

    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                <Button startIcon={<ArrowLeft/>} onClick={onBack} sx={{mb: 3, bgcolor: groupColor}}>
                    Powrót do listy
                </Button>

                <Card sx={{borderRadius: 3, mb: 3}}>
                    {event.imageUrl &&
                        <CardMedia component="img" height="300" image={event.imageUrl} alt={event.title}/>}

                    <CardContent sx={{p: 3}}>
                        <Typography variant="h4" sx={{fontWeight: 600, mb: 2}}>
                            {event.title}
                        </Typography>

                        {event.description && (
                            <Typography variant="body1" sx={{mb: 3, whiteSpace: 'pre-wrap'}}>
                                {event.description}
                            </Typography>
                        )}

                        <Divider sx={{my: 2}}/>

                        {event.startDate && event.endDate && (
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                <CalendarIcon size={20}/>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Termin
                                    </Typography>
                                    <Typography variant="body1">
                                        {formatDateTime(event.startDate, event.startDate.split('T')[1]?.substring(0, 5) || '', event.endDate.split('T')[1]?.substring(0, 5))}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {event.location && (
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                <MapPin size={20}/>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Lokalizacja
                                    </Typography>
                                    <Typography variant="body1">{event.location}</Typography>
                                </Box>
                            </Box>
                        )}

                        {event.isAutoScheduled && event.rangeStart && event.rangeEnd && !event.startDate && (
                            <Alert severity="info" sx={{mb: 3}}>
                                Termin wydarzenia nie został jeszcze ustalony. Dodaj swoją dostępność, aby pomóc w
                                wyborze najlepszego terminu!
                            </Alert>
                        )}

                        {/* Dostępność dla ustalonych terminów - PRZYCISKI */}
                        {event.startDate && event.endDate && (
                            <Box sx={{mb: 3}}>
                                <Typography variant="subtitle1" sx={{mb: 1}}>
                                    Twoja dostępność:
                                </Typography>
                                <Box sx={{display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap'}}>
                                    <Button
                                        color="success"
                                        onClick={() => onSetAvailability(EventAvailabilityStatus.Going)}
                                        sx={{bgcolor: groupColor}}
                                    >
                                        Będę
                                    </Button>
                                    <Button
                                        color="warning"
                                        onClick={() => onSetAvailability(EventAvailabilityStatus.Maybe)}
                                        sx={{bgcolor: groupColor}}
                                    >
                                        Może
                                    </Button>
                                    <Button
                                        color="error"
                                        onClick={() => onSetAvailability(EventAvailabilityStatus.NotGoing)}
                                        sx={{bgcolor: groupColor}}
                                    >
                                        Nie mogę
                                    </Button>
                                    {userAvailability && (
                                        <Button color="error" onClick={onRemoveAvailability}>
                                            Usuń
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* Dostępność dla automatycznego planowania */}
                        {event.isAutoScheduled && (
                            <Box sx={{mb: 3}}>
                                <Typography variant="h6" sx={{mb: 2}}>
                                    Dostępność członków
                                </Typography>

                                {event.availabilities.map((a) => (
                                    <Chip key={a.user.id} label={`${a.user.username}`} sx={{mr: 1, mb: 1}}/>
                                ))}

                                <Button variant="contained" onClick={onAddAvailability} fullWidth
                                        sx={{mt: 2, bgcolor: groupColor}}>
                                    Dodaj swoją dostępność
                                </Button>

                                {event.suggestions && event.suggestions.length > 0 && (
                                    <Button variant="contained" color="secondary" fullWidth
                                            sx={{mt: 2, bgcolor: groupColor}} disabled>
                                        Proponowane terminy ({event.suggestions.length})
                                    </Button>
                                )}
                            </Box>
                        )}

                        {/* Dostępność dla ustalonych terminów - lista */}
                        {event.startDate && event.endDate && (
                            <Box>
                                <Typography variant="h6" sx={{mb: 2}}>
                                    Uczestnictwo
                                </Typography>

                                {event.availabilities.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{mb: 1}}>
                                            Lista uczestników
                                        </Typography>
                                        {event.availabilities.map((avail) => (
                                            <AvailabilityItem key={avail.user.id} avail={avail}/>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {event.user.id === currentUserId && (
                    <Button
                        color="primary"
                        sx={{mt: 2, mr: 2, bgcolor: groupColor}}
                        onClick={() => onEdit(event)}
                    >
                        Edytuj
                    </Button>
                )}

                {event.isAutoScheduled && !event.startDate && event.user.id === currentUserId && event.rangeStart && event.rangeEnd && (
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{mt: 2, bgcolor: groupColor}}
                        onClick={onFinishPlanning}
                    >
                        Zakończ planowanie
                    </Button>
                )}
            </Box>
        </Box>
    );
}

