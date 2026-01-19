export enum EventAvailabilityStatus {
    Going = 0,
    Maybe = 2,
    NotGoing = 1,
}

export interface UserResponseDto {
    id: string;
    username: string;
    email: string;
    profilePictureUrl?: {
        id: string;
    }
}

export interface AvailabilityRangeRequestDto {
    availableFrom: string;
    availableTo: string;
}

export interface AvailabilityRangeResponseDto {
    id: string;
    eventId: string;
    user: UserResponseDto;
    availableFrom: string;
    availableTo: string;
}

export interface EventAvailabilityRequestDto {
    status: EventAvailabilityStatus;
}

export interface EventAvailabilityResponseDto {
    user: UserResponseDto;
    status: EventAvailabilityStatus;
    createdAt: string;
}

export interface EventSuggestionResponseDto {
    id: string;
    startTime: string;
    endTime: string;
    availableUserCount: number;
}

export interface EventRequestDto {
    title: string;
    description?: string;
    location?: string;
    isAutoScheduled: boolean;
    rangeStart?: string;
    rangeEnd?: string;
    durationMinutes?: number;
    startDate?: string;
    endDate?: string;
    file?: File;
}

export interface EventResponseDto {
    id: string;
    groupId: string;
    user: UserResponseDto;
    title: string;
    description?: string;
    location?: string;
    storedFileId?: string;
    isAutoScheduled: boolean;
    rangeStart?: string;
    rangeEnd?: string;
    durationMinutes?: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    availabilities: EventAvailabilityResponseDto[];
    suggestions: EventSuggestionResponseDto[];
}

