"use client";

import React from 'react';
import {Avatar, Box, Button, Card, CardContent, Chip, IconButton, Typography} from '@mui/material';
import {Download, MoreVertical} from 'lucide-react';
import {StoredFileResponseDto} from '@/lib/types/study-material';
import {formatFileSize, formatTimestamp, getFileIcon} from '@/lib/utils/study-material';

interface FileCardProps {
    file: StoredFileResponseDto;
    canDelete: boolean;
    onOpenMenu: (event: React.MouseEvent<HTMLElement>, fileId: string) => void;
    onDownload: (file: StoredFileResponseDto) => void;
    groupColor?: string;
}

export default function FileCard({file, canDelete, onOpenMenu, onDownload, groupColor}: FileCardProps) {
    const FileIcon = getFileIcon(file.contentType);

    return (
        <Card sx={{borderRadius: 3}}>
            <CardContent>
                <Box sx={{display: 'flex', gap: 2}}>
                    <Avatar
                        sx={{
                            bgcolor: groupColor,
                            width: 56,
                            height: 56,
                        }}
                    >
                        <FileIcon size={28}/>
                    </Avatar>

                    <Box sx={{flex: 1, minWidth: 0}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1}}>
                            <Box sx={{flex: 1, minWidth: 0}}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {file.fileName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" suppressHydrationWarning>
                                    {formatFileSize(file.size)} • {file.uploadedByName} • {formatTimestamp(file.uploadedAt)}
                                </Typography>
                            </Box>

                            {canDelete && (
                                <IconButton
                                    size="small"
                                    onClick={(e) => onOpenMenu(e, file.id)}
                                    sx={{color: 'white'}}
                                >
                                    <MoreVertical/>
                                </IconButton>
                            )}
                        </Box>

                        <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap'}}>
                            {file.fileCategory && (
                                <Chip
                                    label={file.fileCategory.name}
                                    size="small"
                                    sx={{bgcolor: groupColor, color: '#ffffff'}}
                                />
                            )}

                            <Button
                                size="small"
                                startIcon={<Download size={16}/>}
                                onClick={() => onDownload(file)}
                                sx={groupColor ? {
                                    bgcolor: groupColor,
                                    color: '#fff',
                                    '&:hover': {bgcolor: groupColor, opacity: 0.85}
                                } : {}}
                            >
                                Pobierz
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
