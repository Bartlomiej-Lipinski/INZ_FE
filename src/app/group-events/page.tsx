"use client";

import React, {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Box, Button, Typography} from '@mui/material';
import {Calendar as CalendarIcon, Plus} from 'lucide-react';
import {
    AvailabilityRangeResponseDto,
    EventAvailabilityStatus,
    EventResponseDto,
    EventSuggestionResponseDto
} from '@/lib/types/event';
import EventsList from '@/components/events/eventList';
import EventForm from '@/components/events/EventForm';
import EventDetails from '@/components/events/eventDetails';
import EventAvailabilityView from '@/components/events/eventAvailabilityView';
import EventSuggestions from '@/components/events/eventSuggestion';
import GroupMenu from "@/components/common/GroupMenu";
import {calculateBestSuggestions} from '@/lib/utils/event-utils';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";

type ViewMode = 'list' | 'create' | 'details' | 'availability' | 'suggestions';

const mapStatusToInt = (status: EventAvailabilityStatus): number => {
    switch (status) {
        case EventAvailabilityStatus.Going:
            return 0;
        case EventAvailabilityStatus.NotGoing:
            return 1;
        case EventAvailabilityStatus.Maybe:
            return 2;
        default:
            return 0;
    }
};

export default function EventsPage() {
    const searchParams = useSearchParams();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [events, setEvents] = useState<EventResponseDto[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventResponseDto | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const groupData = useMemo(() => {
        const groupId = searchParams?.get('groupId') || '';
        const groupName = searchParams?.get('groupName') || '';
        const groupColor = searchParams?.get('groupColor') || '#9042fb';
        return {
            id: groupId,
            name: decodeURIComponent(groupName),
            color: decodeURIComponent(groupColor),
        };
    }, [searchParams]);
    const [currentUser, setCurrentUser] = useState<{
        id: string;
        email: string;
        username: string;
        name: string;
        surname: string;
        birthDate?: string;
        status?: string;
        description?: string;
        profilePicture?: {
            id: string;
            fileName?: string;
            contentType?: string;
            size?: number;
            url?: string;
        };
        isTwoFactorEnabled?: boolean;
    } | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [isAutoScheduled, setIsAutoScheduled] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');
    const [availabilityRanges, setAvailabilityRanges] = useState<AvailabilityRangeResponseDto[]>([]);
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<Array<{
        date: string;
        startHour: number;
        endHour: number
    }>>([]);
    const [isPlanningFinished, setIsPlanningFinished] = useState(false);
    const [suggestions, setSuggestions] = useState<EventSuggestionResponseDto[]>([]);
    const [finalDate, setFinalDate] = useState<{ start: string; end: string } | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editEventId, setEditEventId] = useState<string | null>(null);

    useEffect(() => {
        const userAuth = localStorage.getItem('auth:user');
        if (userAuth) {
            try {
                const userData = JSON.parse(userAuth);
                setCurrentUser({
                    id: userData.id,
                    email: userData.email,
                    username: userData.username,
                    name: userData.name,
                    surname: userData.surname,
                    birthDate: userData.birthDate,
                    status: userData.status,
                    description: userData.description,
                    profilePicture: userData.profilePicture,
                    isTwoFactorEnabled: userData.isTwoFactorEnabled,
                });
            } catch (error) {
                console.error('Błąd parsowania danych użytkownika:', error);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!groupData.id) return;
            try {
                const response = await fetchWithAuth(
                    `${API_ROUTES.GET_GROUP_EVENTS}?groupId=${groupData.id}`,
                    {method: 'GET', credentials: 'include'}
                );
                if (response.ok) {
                    const data = await response.json();
                    const events = data.data as EventResponseDto[];
                    setEvents(events || []);
                } else {
                    console.error('Błąd podczas pobierania wydarzeń');
                    setEvents([]);
                }
            } catch (error) {
                console.error('Błąd podczas pobierania wydarzeń:', error);
                setEvents([]);
            }
        };

        if (!isLoading && currentUser) {
            fetchEvents();
        }
    }, [groupData.id, currentUser, isLoading]);

    const handleCreateEvent = () => {
        setTitle('');
        setDescription('');
        setLocation('');
        setIsAutoScheduled(false);
        setStartDate('');
        setEndDate('');
        setDurationMinutes('');
        setRangeStart('');
        setRangeEnd('');
        setViewMode('create');
    };

    const handleViewDetails = async (event: EventResponseDto) => {
        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.GET_GROUP_EVENT}?groupId=${groupData.id}&eventId=${event.id}`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            );
            if (response.ok) {
                const data = await response.json();
                const event = data.data as EventResponseDto;
                setSelectedEvent(event);
                setViewMode('details');
            } else {
                console.error('Błąd podczas pobierania dostępności wydarzenia');
            }
        } catch (error) {
            console.error('Błąd podczas pobierania dostępności wydarzenia:', error);
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedEvent(null);
    };

    const handleEditEvent = (event: EventResponseDto) => {
        setTitle(event.title || '');
        setDescription(event.description || '');
        setLocation(event.location || '');
        setIsAutoScheduled(event.isAutoScheduled);
        setStartDate(event.startDate || '');
        setEndDate(event.endDate || '');
        setDurationMinutes(event.durationMinutes ? String(event.durationMinutes) : '');
        setRangeStart(event.rangeStart || '');
        setRangeEnd(event.rangeEnd || '');
        setEditEventId(event.id);
        setIsEditMode(true);
        setViewMode('create');
    };

    const handleSubmitEvent = async () => {
        if (!currentUser) return;

        const formDataToSend = new FormData();
        formDataToSend.append('title', title);
        formDataToSend.append('description', description);
        formDataToSend.append('location', location);
        formDataToSend.append('isAutoScheduled', isAutoScheduled);
        if (!isAutoScheduled) {
            formDataToSend.append('startDate', startDate);
            formDataToSend.append('endDate', endDate);
        } else {
            formDataToSend.append('durationMinutes', durationMinutes);
            formDataToSend.append('rangeStart', rangeStart);
            formDataToSend.append('rangeEnd', rangeEnd);
        }
        if (imagePreview) {
            formDataToSend.append('file', imagePreview);
        }

        try {
            if (isEditMode && editEventId) {
                const response = await fetchWithAuth(
                    `${API_ROUTES.UPDATE_GROUP_EVENT}?groupId=${groupData.id}&eventId=${editEventId}`,
                    {
                        method: 'PUT',
                        body: formDataToSend,
                        credentials: 'include',
                    }
                );
                if (!response.ok) throw new Error('Błąd podczas edycji wydarzenia');
            } else {
                const response = await fetchWithAuth(
                    `${API_ROUTES.POST_GROUP_EVENT}?groupId=${groupData.id}`,
                    {
                        method: 'POST',
                        body: formDataToSend,
                        credentials: 'include',
                    }
                );
                if (!response.ok) throw new Error('Błąd podczas tworzenia wydarzenia');
            }
            handleBackToList();
        } catch (error) {
            console.error('Błąd:', error);
        }
    };

    const handleDeleteEvent = async (eventId?: string) => {
        const id = eventId || selectedEvent?.id;
        if (!id || !groupData.id) return;
        const confirmed = window.confirm('Czy na pewno chcesz usunąć to wydarzenie?');
        if (!confirmed) return;

        try {
            const response = await fetchWithAuth(`${API_ROUTES.DELETE_GROUP_EVENT}?groupId=${groupData.id}&eventId=${eventId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Błąd podczas usuwania wydarzenia');
            } else {
                setEvents(prev => prev.filter(ev => ev.id !== id));
                if (selectedEvent && selectedEvent.id === id) {
                    setSelectedEvent(null);
                    setViewMode('list');
                }
                setIsEditMode(false);
                setEditEventId(null);
            }
        } catch (error) {
            console.error('Błąd podczas usuwania wydarzenia:', error);
        }
    };

    const handleAddAvailability = () => {
        setViewMode('availability');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFinishPlanning = () => {
        if (!selectedEvent || !selectedEvent.durationMinutes) return;
        const allAvailabilities = availabilityRanges.filter(a => a.eventId === selectedEvent.id);
        const best = calculateBestSuggestions(selectedEvent, allAvailabilities, selectedEvent.durationMinutes);
        setSuggestions(best);
        setIsPlanningFinished(true);
        setViewMode('suggestions');
    };

    const handleSetAvailability = async (status: EventAvailabilityStatus) => {
        if (!selectedEvent || !currentUser) return;
        const userDto = {
            id: currentUser.id,
            email: currentUser.email,
            username: currentUser.username,
            name: currentUser.name,
            surname: currentUser.surname,
            birthDate: currentUser.birthDate,
            status: currentUser.status,
            description: currentUser.description,
            profilePicture: currentUser.profilePicture,
            isTwoFactorEnabled: currentUser.isTwoFactorEnabled,
        };
        try {
            const response = await fetchWithAuth(`${API_ROUTES.POST_UPDATE_EVENT_DELETE_AVAILABILITY}?groupId=${groupData.id}&eventId=${selectedEvent.id}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({status: mapStatusToInt(status)}),
                credentials: 'include',
            });
            if (response && !response.ok) {
                console.error('Błąd podczas ustawiania dostępności');
            } else {
                setEvents(events.map(ev => {
                    if (ev.id !== selectedEvent.id) return ev;
                    const filtered = ev.availabilities.filter(a => a.user.id !== currentUser.id);
                    return {
                        ...ev,
                        availabilities: [
                            ...filtered,
                            {
                                user: userDto,
                                status,
                                createdAt: new Date().toISOString(),
                            },
                        ],
                    };
                }));
                setSelectedEvent(prev => prev ? {
                    ...prev,
                    availabilities: [
                        ...prev.availabilities.filter(a => a.user.id !== currentUser.id),
                        {
                            user: userDto,
                            status,
                            createdAt: new Date().toISOString(),
                        },
                    ],
                } : prev);
            }
        } catch (error) {
            console.error('Błąd podczas wysyłania availability:', error);
        }

    };
    const handleSubmitAvailabilityRange = async () => {
        if (!currentUser || !selectedEvent || selectedTimeSlots.length === 0) return;

        const rangesToSend = selectedTimeSlots.map(slot => ({
            availableFrom: `${slot.date}T${String(slot.startHour).padStart(2, '0')}:00:00`,
            availableTo: `${slot.date}T${String(slot.endHour).padStart(2, '0')}:00:00`,
        }));

        try {
            const response = await fetchWithAuth(
                `${API_ROUTES.POST_UPDATE_DELETE_EVENT_AVAILABILITY_RANGE}?groupId=${groupData.id}&eventId=${selectedEvent.id}`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(rangesToSend),
                    credentials: 'include',
                }
            );

            if (response && response.ok) {
                const data = await response.json();
                const createdRanges = data.data as AvailabilityRangeResponseDto[];
                if (createdRanges && createdRanges.length > 0) {
                    setAvailabilityRanges(prev => [...prev, ...createdRanges]);
                } else {
                    // Fallback: utworzenie lokalnych obiektów jeśli backend nie zwróci danych
                    const fallbackRanges = rangesToSend.map((range, index) => ({
                        id: Date.now().toString() + Math.random() + index,
                        eventId: selectedEvent.id,
                        user: {id: currentUser.id, email: currentUser.email, username: currentUser.username},
                        availableFrom: range.availableFrom,
                        availableTo: range.availableTo,
                    }));
                    setAvailabilityRanges(prev => [...prev, ...fallbackRanges]);
                }
            } else {
                console.error('Błąd podczas zapisywania przedziałów dostępności', response);
            }
        } catch (err) {
            console.error('Błąd podczas wysyłania przedziałów dostępności:', err);
        }

        setSelectedTimeSlots([]);
        setViewMode('details');
    };


    const handleRemoveAvailability = async () => {
        if (!selectedEvent || !currentUser) return;
        try {
            const response = await fetchWithAuth(`${API_ROUTES.POST_UPDATE_EVENT_DELETE_AVAILABILITY}?groupId=${groupData.id}&eventId=${selectedEvent.id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
            });
            if (response && !response.ok) {
                console.error('Błąd podczas ustawiania dostępności');
            } else {
                setEvents(events.map(ev => {
                    if (ev.id !== selectedEvent.id) return ev;
                    return {
                        ...ev,
                        availabilities: ev.availabilities.filter(a => a.user.id !== currentUser.id),
                    };
                }));
                setSelectedEvent(prev => prev ? {
                    ...prev,
                    availabilities: prev.availabilities.filter(a => a.user.id !== currentUser.id),
                } : prev);
            }
        } catch (error) {
            console.error('Błąd podczas wysyłania availability:', error);
        }
    };

    const isFormValid: boolean =
        title.trim().length > 0 &&
        (isAutoScheduled
            ? durationMinutes.length > 0 && rangeStart.length > 0 && rangeEnd.length > 0
            : startDate.length > 0 && endDate.length > 0);

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <Typography>Ładowanie...</Typography>
            </Box>
        );
    }

    return (
        <>
            <GroupMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} groupId={groupData.id}
                       groupName={groupData.name}
                       groupColor={groupData.color}/>

            {viewMode === 'list' && (
                <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
                    <Box sx={{maxWidth: 1200, mx: 'auto'}}>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                            <Button onClick={() => setDrawerOpen(true)}/>
                            <Typography
                                variant="h4"
                                sx={{
                                    textAlign: 'center',
                                    flex: 1,
                                    fontWeight: 600,
                                    fontSize: {xs: '1.75rem', sm: '2rem'},
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                }}
                            >
                                <CalendarIcon size={32}/>
                                Wydarzenia
                            </Typography>
                        </Box>

                        <Button variant="contained" startIcon={<Plus size={20}/>} onClick={handleCreateEvent}
                                sx={{mb: 3, bgcolor: groupData.color}}>
                            Nowe wydarzenie
                        </Button>

                        <EventsList events={events} onViewDetails={handleViewDetails} onDelete={handleDeleteEvent}
                                    currentUserId={currentUser.id}/>
                    </Box>
                </Box>
            )}

            {viewMode === 'create' && (
                <EventForm
                    title={title}
                    description={description}
                    location={location}
                    isAutoScheduled={isAutoScheduled}
                    startDate={startDate}
                    endDate={endDate}
                    durationMinutes={durationMinutes}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    groupColor={groupData.color}
                    isEditMode={isEditMode}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                    onLocationChange={setLocation}
                    onIsAutoScheduledChange={setIsAutoScheduled}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onDurationMinutesChange={setDurationMinutes}
                    onRangeStartChange={setRangeStart}
                    onRangeEndChange={setRangeEnd}
                    onImageChange={handleImageChange}
                    onBack={handleBackToList}
                    onSubmit={handleSubmitEvent}
                    isValid={isFormValid}
                />
            )}

            {viewMode === 'details' && selectedEvent && (
                <EventDetails
                    event={selectedEvent}
                    currentUserId={currentUser.id}
                    groupColor={groupData.color}
                    onBack={handleBackToList}
                    onEdit={handleEditEvent}
                    onAddAvailability={handleAddAvailability}
                    onFinishPlanning={handleFinishPlanning}
                    onSetAvailability={handleSetAvailability}
                    onRemoveAvailability={handleRemoveAvailability}
                />
            )}

            {viewMode === 'availability' && selectedEvent && (
                <EventAvailabilityView
                    event={selectedEvent}
                    selectedTimeSlots={selectedTimeSlots}
                    groupColor={groupData.color}
                    onBack={() => setViewMode('details')}
                    onSlotsChange={setSelectedTimeSlots}
                    onSubmit={handleSubmitAvailabilityRange}
                />
            )}

            {viewMode === 'suggestions' && isPlanningFinished && suggestions.length > 0 && (
                <EventSuggestions
                    suggestions={suggestions}
                    finalDate={finalDate}
                    groupColor={groupData.color}
                    onSelectDate={(start, end) => setFinalDate({start, end})}
                    onConfirm={() => {
                        if (selectedEvent && finalDate) {
                            setEvents(events.map(ev =>
                                ev.id === selectedEvent.id
                                    ? {...ev, startDate: finalDate.start, endDate: finalDate.end, suggestions}
                                    : ev
                            ));
                            setViewMode('details');
                        }
                    }}
                />
            )}
        </>
    );
}

