export interface PollOptionDto {
    id: string;
    text: string;
    votedUsersIds: string[];
}

export interface PollRequestDto {
    question: string;
    options: PollOptionDto[];
}

export interface PollResponseDto {
    id?: string;
    createdByUserId: string;
    question: string;
    createdAt: string;
    options: PollOptionDto[];
}