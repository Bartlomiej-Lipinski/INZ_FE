"use client";

import React from 'react';
import {Box, Card, CardContent, Chip, IconButton, Typography} from '@mui/material';
import {MoreVertical} from 'lucide-react';
import {FileCategoryResponseDto, StoredFileResponseDto} from '@/lib/types/study-material';

interface CategoriesManagerProps {
    categories: FileCategoryResponseDto[];
    files: StoredFileResponseDto[];
    isAdmin: boolean;
    onOpenMenu: (event: React.MouseEvent<HTMLElement>, categoryId: string) => void;
}

export default function CategoriesManagerComponent({
                                              categories,
                                              files,
                                              isAdmin,
                                              onOpenMenu,
                                          }: CategoriesManagerProps) {
    if (categories.length === 0) return null;

    return (
        <Card sx={{mb: 3, borderRadius: 3}}>
            <CardContent>
                <Typography variant="h6" sx={{mb: 2}}>
                    Kategorie
                </Typography>
                <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                    {categories.map((cat) => {
                        const fileCount = files.filter(f => f.fileCategory?.id === cat.id).length;
                        return (
                            <Chip
                                key={cat.id}
                                label={`${cat.name} (${fileCount})`}
                                onDelete={isAdmin ? () => {
                                } : undefined}
                                deleteIcon={
                                    isAdmin ? (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenMenu(e, cat.id);
                                            }}
                                        >
                                            <MoreVertical size={16}/>
                                        </IconButton>
                                    ) : undefined
                                }
                                sx={{fontSize: '0.875rem'}}
                            />
                        );
                    })}
                </Box>
            </CardContent>
        </Card>
    );
}
