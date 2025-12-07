export interface ProfilePictureDto {
    id: string;
    fileName: string;
    contentType: string;
    size: number;
}

export interface UserResponseDto {
    id: string;
    name: string;
    surname: string;
    username: string;
    profilePicture?: ProfilePictureDto;
}

export interface CommentResponseDto {
    id: string;
    content: string;
    createdAt: string;
    user: UserResponseDto;
}

export interface RecommendationResponseDto {
    id: string;
    title: string;
    content: string;
    category?: string;
    imageUrl?: string;
    linkUrl?: string;
    createdAt: string;
    user: UserResponseDto;
    comments: CommentResponseDto[];
    reactions: UserResponseDto[];
}