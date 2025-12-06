import {FeedItemType} from "@/lib/types/FeedItemType";

export interface ReactionDto {
    id: string;
    userId: string;
    userName: string;
    reactionType: string;
    createdAt: string;
}

export interface CommentResponseDto {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
    userName: string;
    userAvatarUrl?: string;
}

export interface GroupFeedItemResponseDto {
    id: string;
    type: FeedItemType;
    title?: string;
    description?: string;
    createdAt: string;
    userId: string;
    userName?: string;
    userAvatarUrl?: string;
    storedFileId?: string;
    temporaryImageUrl?: string;
    entityId?: string;
    comments: CommentResponseDto[];
    reactions: ReactionDto[];
}