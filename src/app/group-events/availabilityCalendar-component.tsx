'use client';

import React, {useState} from 'react';
import {Box, Button, Card, Chip, Grid, IconButton, Paper, Typography,} from '@mui/material';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {
    addWeeks,
    eachDayOfInterval,
    endOfDay,
    endOfWeek,
    format,
    isAfter,
    isBefore,
    isToday,
    startOfDay,
    startOfWeek
} from 'date-fns';
import {pl} from 'date-fns/locale';

export interface TimeSlot {
    date: string; // YYYY-MM-DD
    startHour: number; // 0-23
    endHour: number; // 0-23
}

interface AvailabilityCalendarProps {
    rangeStart: string;
    rangeEnd: string;
    selectedSlots: TimeSlot[];
    onSlotsChange: (slots: TimeSlot[]) => void;
    groupColor?: string;
}

export default function AvailabilityCalendarComponent({
                                                 rangeStart,
                                                 rangeEnd,
                                                 selectedSlots,
                                                 onSlotsChange,
                                                          groupColor = '#7c3aed',
                                             }: AvailabilityCalendarProps) {
    const [weekStart, setWeekStart] = useState<Date>(() => {
        const start = new Date(rangeStart);
        return startOfWeek(start, {locale: pl});
    });
    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    const [isSelectingHours, setIsSelectingHours] = useState(false);
    const [selectionStartHour, setSelectionStartHour] = useState<number | null>(null);
    const [selectionEndHour, setSelectionEndHour] = useState<number | null>(null);
    const [selectionDay, setSelectionDay] = useState<string | null>(null);
    const [selectionMode, setSelectionMode] = useState<'add' | 'remove' | null>(null);

    // --- DRAG-SELECT LOGIKA ---
    const [isDragging, setIsDragging] = useState(false);
    const [dragDay, setDragDay] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState<number | null>(null);
    const [dragEnd, setDragEnd] = useState<number | null>(null);
    const [dragMode, setDragMode] = useState<'add' | 'remove' | null>(null);

    const minDate = new Date(rangeStart);
    const maxDate = new Date(rangeEnd);

    // Generate current week days
    const weekEnd = endOfWeek(weekStart, {locale: pl});
    const weekDays = eachDayOfInterval({start: weekStart, end: weekEnd});

    const hours = Array.from({length: 24}, (_, i) => i);
    const weekDayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

    const isDateInRange = (date: Date): boolean => {
        const dateStart = startOfDay(date);
        const dateEnd = endOfDay(date);
        const rangeStartDate = startOfDay(minDate);
        const rangeEndDate = endOfDay(maxDate);

        return !isBefore(dateStart, rangeStartDate) && !isAfter(dateEnd, rangeEndDate);
    };

    const getDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

    const getSlotsSummary = (dateStr: string): string => {
        const daySlots = selectedSlots.filter((s) => s.date === dateStr);
        if (daySlots.length === 0) return '';

        const sorted = daySlots.sort((a, b) => a.startHour - b.startHour);
        return sorted.map((s) => `${String(s.startHour).padStart(2, '0')}:00-${String(s.endHour).padStart(2, '0')}:00`).join(', ');
    };

    const isSlotSelected = (dateStr: string, hour: number): boolean => {
        return selectedSlots.some(
            (slot) => slot.date === dateStr && slot.startHour === hour && slot.endHour === hour + 1
        );
    };
    const isHourInRange = (dateStr: string, hour: number): boolean => {
        const slotDate = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`);
        return slotDate >= minDate && slotDate <= maxDate;
    };

    // Sprawdź czy slot istnieje
    const slotExists = (date: string, hour: number) => selectedSlots.some(s => s.date === date && s.startHour === hour && s.endHour === hour + 1);

    // Dodaj slot
    const addSlot = (date: string, hour: number) => {
        if (!slotExists(date, hour)) onSlotsChange([...selectedSlots, {date, startHour: hour, endHour: hour + 1}]);
    };
    // Usuń slot
    const removeSlot = (date: string, hour: number) => {
        onSlotsChange(selectedSlots.filter(s => !(s.date === date && s.startHour === hour && s.endHour === hour + 1)));
    };

    // Drag start
    const handleHourMouseDown = (date: string, hour: number, e: React.MouseEvent) => {
        if (!isDateInRange(new Date(date)) || !isHourInRange(date, hour)) return;
        setIsDragging(true);
        setDragDay(date);
        setDragStart(hour);
        setDragEnd(hour);
        setDragMode(slotExists(date, hour) ? 'remove' : 'add');
        e.preventDefault();
    };
    // Drag move
    const handleHourMouseEnter = (date: string, hour: number) => {
        if (!isDragging || dragDay !== date || !isHourInRange(date, hour)) return;
        setDragEnd(hour);
    };
    // Drag end
    const handleHourMouseUp = () => {
        if (!isDragging || dragDay === null || dragStart === null || dragEnd === null || !dragMode) {
            setIsDragging(false);
            setDragDay(null);
            setDragStart(null);
            setDragEnd(null);
            setDragMode(null);
            return;
        }
        const from = Math.min(dragStart, dragEnd);
        const to = Math.max(dragStart, dragEnd);
        let newSlots = [...selectedSlots];
        for (let h = from; h <= to; h++) {
            if (dragMode === 'add') {
                if (!slotExists(dragDay, h)) newSlots.push({date: dragDay, startHour: h, endHour: h + 1});
            } else {
                newSlots = newSlots.filter(s => !(s.date === dragDay && s.startHour === h && s.endHour === h + 1));
            }
        }
        onSlotsChange(newSlots);
        setIsDragging(false);
        setDragDay(null);
        setDragStart(null);
        setDragEnd(null);
        setDragMode(null);
    };

    const selectRange = (dateKey: string, startH: number, endH: number) => {
        const newSlots = [...selectedSlots];
        for (let h = startH; h < endH; h++) {
            if (!slotExists(dateKey, h)) {
                newSlots.push({date: dateKey, startHour: h, endHour: h + 1});
            }
        }
        onSlotsChange(newSlots);
    };

    const clearDay = (dateKey: string) => {
        onSlotsChange(selectedSlots.filter(s => s.date !== dateKey));
    };

    const previousWeek = () => {
        setWeekStart(addWeeks(weekStart, -1));
    };

    const nextWeek = () => {
        setWeekStart(addWeeks(weekStart, 1));
    };

    const slotsByDate = selectedSlots.reduce((acc, slot) => {
        if (!acc[slot.date]) {
            acc[slot.date] = [];
        }
        acc[slot.date].push(slot);
        return acc;
    }, {} as Record<string, TimeSlot[]>);

    return (
        <Box>
            {/* Week Navigation */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <IconButton size="small" onClick={previousWeek}>
                    <ChevronLeft size={20}/>
                </IconButton>
                <Typography variant="body2" sx={{fontWeight: 600}}>
                    {format(weekStart, 'd MMM', {locale: pl})} - {format(weekEnd, 'd MMM yyyy', {locale: pl})}
                </Typography>
                <IconButton size="small" onClick={nextWeek}>
                    <ChevronRight size={20}/>
                </IconButton>
            </Box>

            {/* Days Grid */}
            <Grid container spacing={1} sx={{mb: 3}}>
                {weekDays.map((day) => {
                    const dateKey = getDateKey(day);
                    const inRange = isDateInRange(day);
                    const daySlots = selectedSlots.filter((s) => s.date === dateKey);
                    const summary = getSlotsSummary(dateKey);
                    const isExpanded = expandedDay === dateKey;

                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={dateKey}>
                            <Card
                                sx={{
                                    p: 0,
                                    cursor: inRange ? 'pointer' : 'default',
                                    opacity: inRange ? 1 : 0.5,
                                    border: inRange ? '2px solid #2196f3' : '2px solid #e0e0e0',
                                    transition: 'all 0.2s',
                                    backgroundColor: daySlots.length > 0 ? '#d0d0d0' : '#e0e0e0',
                                    '&:hover': inRange ? {boxShadow: 3, borderColor: '#1976d2'} : {},
                                }}
                                onClick={() => inRange && setExpandedDay(isExpanded ? null : dateKey)}
                            >
                                <Box sx={{p: 1.5}}>
                                    {/* Day Header */}
                                    <Box sx={{textAlign: 'center', mb: 1}}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                fontWeight: 600,
                                                color: '#666',
                                            }}
                                        >
                                            {weekDayNames[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                color: isToday(day) ? '#2196f3' : '#000',
                                            }}
                                        >
                                            {format(day, 'd')}
                                        </Typography>
                                        <Typography variant="caption" sx={{color: '#999'}}>
                                            {format(day, 'MMM', {locale: pl})}
                                        </Typography>
                                    </Box>

                                    {/* Hours Summary */}
                                    {daySlots.length > 0 && (
                                        <Box sx={{mb: 1}}>
                                            <Chip
                                                label={`${daySlots.length}h`}
                                                size="small"
                                                color="primary"
                                                variant="filled"
                                                sx={{
                                                    width: '100%',
                                                    bgcolor: groupColor,
                                                    color: '#fff',
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem',
                                                    boxShadow: '0 1px 4px ' + groupColor + '33',
                                                    height: 22,
                                                    '&:hover': {bgcolor: groupColor + 'dd'}
                                                }}
                                            />
                                        </Box>
                                    )}

                                    {/* Action Button */}
                                    {inRange && !isExpanded && (
                                        <Button
                                            size="small"
                                            fullWidth
                                            sx={{
                                                fontSize: '0.75rem',
                                                py: 0.5,
                                                bgcolor: groupColor,
                                                color: '#fff',
                                                '&:hover': {bgcolor: daySlots.length > 0 ? groupColor : '#f0f0f0'}
                                            }}
                                        >
                                            {daySlots.length > 0 ? 'Edytuj' : 'Zaznacz'}
                                        </Button>
                                    )}
                                </Box>

                                {/* Expanded Hours Grid */}
                                {isExpanded && inRange && (
                                    <Box sx={{
                                        p: 1.5,
                                        pt: 1,
                                        borderTop: '1px solid #e0e0e0',
                                        backgroundColor: '#f5f5f5',
                                    }}
                                         onClick={e => e.stopPropagation()}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 1
                                        }}>
                                            <Typography variant="caption" sx={{fontWeight: 600}}>
                                                Godziny
                                            </Typography>
                                            {daySlots.length > 0 && (
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => clearDay(dateKey)}
                                                    sx={{fontSize: '0.7rem', bgcolor: groupColor}}
                                                >
                                                    Wyczyść
                                                </Button>
                                            )}
                                        </Box>
                                        {/* Hours Selection Grid */}
                                        <Grid container spacing={0.5} onMouseUp={handleHourMouseUp}
                                              onMouseLeave={handleHourMouseUp}>
                                            {hours.map(hour => {
                                                const isSelected = isSlotSelected(dateKey, hour);
                                                const isInDrag =
                                                    isDragging && dragDay === dateKey && dragStart !== null && dragEnd !== null &&
                                                    hour >= Math.min(dragStart, dragEnd) && hour <= Math.max(dragStart, dragEnd);
                                                return (
                                                    <Grid item xs={6} sm={4} key={hour}>
                                                        <Paper
                                                            onMouseDown={e => handleHourMouseDown(dateKey, hour, e)}
                                                            onMouseEnter={() => handleHourMouseEnter(dateKey, hour)}
                                                            sx={{
                                                                p: 1,
                                                                textAlign: 'center',
                                                                cursor: isHourInRange(dateKey, hour) ? 'pointer' : 'default',
                                                                backgroundColor: isInDrag ? (dragMode === 'add' ? groupColor + '44' : '#ffcdd2') : isSelected ? groupColor : '#e0e0e0',
                                                                color: isInDrag ? '#000' : isSelected ? '#fff' : '#000',
                                                                border: isSelected ? 'none' : '1px solid #e0e0e0',
                                                                transition: 'all 0.15s',
                                                                userSelect: 'none',
                                                                fontWeight: 600,
                                                                opacity: isHourInRange(dateKey, hour) ? 1 : 0.5,
                                                                '&:hover': isHourInRange(dateKey, hour) ? {
                                                                    backgroundColor: isSelected ? groupColor : '#d0d0d0',
                                                                    transform: 'scale(1.05)',
                                                                } : {},
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    fontSize: '0.85rem',
                                                                    display: 'block'
                                                                }}
                                                            >
                                                                {String(hour).padStart(2, '0')}:00
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>

                                        {/* Quick Select Buttons */}
                                        <Box sx={{display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap'}}>
                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() => selectRange(dateKey, 0, 24)}
                                                sx={{fontSize: '0.7rem', py: 0.25, flex: 1, bgcolor: groupColor}}
                                            >
                                                Cały dzień
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Selected Slots Summary */}
            {selectedSlots.length > 0 && (
                <Card sx={{borderRadius: 2, p: 2}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                            Wybrana dostępność ({selectedSlots.length} godzin)
                        </Typography>
                        <Button
                            size="small"
                            color="error"
                            onClick={() => onSlotsChange([])}
                            sx={{bgcolor: groupColor}}
                        >
                            Wyczyść wszystko
                        </Button>
                    </Box>

                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                        {Object.entries(slotsByDate)
                            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                            .map(([date, slots]) => (
                                <Box key={date} sx={{mb: 1}}>
                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                        {slots
                                            .sort((a, b) => a.startHour - b.startHour)
                                            .map((slot, idx) => {
                                                const slotIndex = selectedSlots.indexOf(slot);
                                                return (
                                                    <Chip
                                                        key={idx}
                                                        label={`${format(new Date(date), 'd MMM', {locale: pl})} ${String(slot.startHour).padStart(2, '0')}:00`}
                                                        onDelete={() =>
                                                            onSlotsChange(selectedSlots.filter((_, i) => i !== slotIndex))
                                                        }
                                                        size="small"
                                                        color="primary"
                                                        sx={{
                                                            bgcolor: groupColor,
                                                            color: '#fff',
                                                            fontWeight: 700,
                                                            fontSize: '0.8rem',
                                                            boxShadow: '0 1px 4px ' + groupColor + '33',
                                                            height: 22,
                                                            '&:hover': {
                                                                bgcolor: groupColor + 'dd'
                                                            },
                                                            '& .MuiChip-deleteIcon': {
                                                                color: '#ef4444',
                                                                '&:hover': {
                                                                    color: '#dc2626'
                                                                }
                                                            }
                                                        }}
                                                    />
                                                );
                                            })}
                                    </Box>
                                </Box>
                            ))}
                    </Box>
                </Card>
            )}
        </Box>
    );
}
