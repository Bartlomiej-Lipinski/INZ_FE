"use client";

import React from 'react';
import {Alert, Box} from '@mui/material';
import FileCard from '@/components/common/FileCard';
import {StoredFileResponseDto} from '@/lib/types/study-material';

interface FileListProps {
    files: StoredFileResponseDto[];
    hasFilters: boolean;
    canDeleteFile: (file: StoredFileResponseDto) => boolean;
    onOpenMenu: (event: React.MouseEvent<HTMLElement>, fileId: string) => void;
    onDownload: (file: StoredFileResponseDto) => void;
    groupColor: string;
}

export default function FileList({
                                     files,
                                     hasFilters,
                                     canDeleteFile,
                                     onOpenMenu,
                                     onDownload,
                                     groupColor,
                                 }: FileListProps) {
    if (files.length === 0) {
        return (
            <Alert severity="info" sx={{borderRadius: 3}}>
                {hasFilters
                    ? 'Nie znaleziono materiałów pasujących do filtrów.'
                    : 'Brak materiałów. Dodaj pierwszy plik!'}
            </Alert>
        );
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            {files.map((file) => (
                <FileCard
                    key={file.id}
                    file={file}
                    canDelete={canDeleteFile(file)}
                    onOpenMenu={onOpenMenu}
                    onDownload={onDownload}
                    groupColor={groupColor}
                />
            ))}
        </Box>
    );
}
