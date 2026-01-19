import {EventResponseDto, EventSuggestionResponseDto} from '@/lib/types/event';

export interface TimeSlot {
    date: string;
    startHour: number;
    endHour: number;
}

export interface GroupData {
    id: string;
    name: string;
    color: string;
}

export interface EventFormState {
    title: string;
    description: string;
    location: string;
    isAutoScheduled: boolean;
    startDate: string;
    endDate: string;
    durationMinutes: string;
    rangeStart: string;
    rangeEnd: string;
}

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatDateTime = (date: string, startTime: string, endTime?: string): string => {
    const formattedDate = formatDate(date);
    if (endTime) {
        return `${formattedDate}, ${startTime} - ${endTime}`;
    }
    return `${formattedDate}, ${startTime}`;
};

export const calculateBestSuggestions = (
    event: EventResponseDto,
    availabilities: any[],
    duration: number
): EventSuggestionResponseDto[] => {
    const slots: { userId: string; from: Date; to: Date }[] = availabilities.map(a => ({
        userId: a.user.id,
        from: new Date(a.availableFrom),
        to: new Date(a.availableTo),
    }));

    if (!event.rangeStart || !event.rangeEnd || !duration) return [];

    const rangeStart = new Date(event.rangeStart);
    const rangeEnd = new Date(event.rangeEnd);

    const step = 30; // minut
    const possibleSlots: { start: Date; end: Date; availableUserIds: string[] }[] = [];

    for (let d = new Date(rangeStart); d <= rangeEnd; d = new Date(d.getTime() + step * 60000)) {
        const slotStart = new Date(d);
        const slotEnd = new Date(d.getTime() + duration * 60000);
        if (slotEnd > rangeEnd) break;

        const availableUserIds = Array.from(
            new Set(slots.filter(s => s.from <= slotStart && s.to >= slotEnd).map(s => s.userId))
        );
        possibleSlots.push({start: slotStart, end: slotEnd, availableUserIds});
    }

    possibleSlots.sort(
        (a, b) => b.availableUserIds.length - a.availableUserIds.length || a.start.getTime() - b.start.getTime()
    );

    const unique: { start: Date; end: Date; availableUserIds: string[] }[] = [];
    for (const slot of possibleSlots) {
        if (!unique.some(u => Math.abs(u.start.getTime() - slot.start.getTime()) < 60000)) {
            unique.push(slot);
        }
        if (unique.length === 3) break;
    }

    return unique.map((s, index) => ({
        id: `${s.start.getTime()}-${index}`,
        startTime: s.start.toISOString(),
        endTime: s.end.toISOString(),
        availableUserCount: s.availableUserIds.length,
    }));
};

