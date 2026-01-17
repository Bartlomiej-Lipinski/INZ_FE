"use client";

import {Alert, Box, Button, Card, Typography} from '@mui/material';
import {ArrowLeft} from 'lucide-react';
import AvailabilityCalendarComponent from '@/app/group-events/availabilityCalendar-component';
import {EventResponseDto} from '@/lib/types/event';

interface EventAvailabilityViewProps {
    event: EventResponseDto;
    selectedTimeSlots: Array<{ date: string; startHour: number; endHour: number }>;
    groupColor: string;
    onBack: () => void;
    onSlotsChange: (slots: Array<{ date: string; startHour: number; endHour: number }>) => void;
    onSubmit: () => void;
}

export default function EventAvailabilityViewComponent({
                                                  event,
                                                  selectedTimeSlots,
                                                  groupColor,
                                                  onBack,
                                                  onSlotsChange,
                                                  onSubmit,
                                              }: EventAvailabilityViewProps) {
    const canSubmit = selectedTimeSlots.length > 0;

    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 1000, mx: 'auto'}}>
                <Button startIcon={<ArrowLeft/>} onClick={onBack} sx={{mb: 3, bgcolor: groupColor}}>
                    Powrót
                </Button>

                <Typography variant="h4" sx={{mb: 4, fontWeight: 600}}>
                    Zaznacz swoją dostępność
                </Typography>

                <Card sx={{borderRadius: 3, p: 3, mb: 3}}>
                    <Alert severity="info" sx={{mb: 2}}>
                        Zaznacz w kalendarzu dni i godziny, w których jesteś dostępny/a. Możesz wybrać wiele przedziałów
                        czasowych.
                    </Alert>

                    <AvailabilityCalendarComponent
                        rangeStart={event.rangeStart || new Date().toISOString()}
                        rangeEnd={event.rangeEnd || new Date().toISOString()}
                        selectedSlots={selectedTimeSlots}
                        onSlotsChange={onSlotsChange}
                        groupColor={groupColor}
                    />

                    <Box sx={{display: 'flex', gap: 2, mt: 3}}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={onSubmit}
                            disabled={!canSubmit}
                            sx={{bgcolor: groupColor}}
                        >
                            Zapisz dostępność
                        </Button>
                        <Button
                            onClick={onBack}
                            sx={{bgcolor: groupColor}}
                        >
                            Anuluj
                        </Button>
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}

