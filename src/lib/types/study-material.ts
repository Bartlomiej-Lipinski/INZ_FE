export interface FileCategoryResponseDto {
    id: string;
    name: string;
}

export interface StoredFileResponseDto {
    id: string;
    fileName: string;
    contentType: string;
    size: number;
    url: string;
    entityType: string;
    entityId: string;
    uploadedAt: string;
    uploadedByName?: string;
    uploadedById: string;
    fileCategory?: FileCategoryResponseDto;
}
