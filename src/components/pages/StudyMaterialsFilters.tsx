"use client";

import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@mui/material';
import {FolderPlus, Search} from 'lucide-react';
import {FileCategoryResponseDto} from '@/lib/types/study-material';

interface FiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    selectedAuthor: string;
    onAuthorChange: (author: string) => void;
    categories: FileCategoryResponseDto[];
    uniqueAuthors: string[];
    onAddCategory: () => void;
    groupColor?: string;
}

export default function FileFilters({
                                        searchQuery,
                                        onSearchChange,
                                        selectedCategory,
                                        onCategoryChange,
                                        selectedAuthor,
                                        onAuthorChange,
                                        categories,
                                        uniqueAuthors,
                                        onAddCategory,
                                        groupColor
                                    }: FiltersProps) {

    return (
        <Card sx={{mb: 3, borderRadius: 3}}>
            <CardContent>
                <TextField
                    fullWidth
                    placeholder="Szukaj materiałów..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    sx={{mb: 2}}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search/>
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                    <FormControl sx={{minWidth: 200}}>
                        <InputLabel>Kategoria</InputLabel>
                        <Select
                            value={selectedCategory}
                            label="Kategoria"
                            onChange={(e) => onCategoryChange(e.target.value)}
                        >
                            <MenuItem value="all">Wszystkie</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{minWidth: 200}}>
                        <InputLabel>Autor</InputLabel>
                        <Select
                            value={selectedAuthor}
                            label="Autor"
                            onChange={(e) => onAuthorChange(e.target.value)}
                        >
                            <MenuItem value="all">Wszyscy</MenuItem>
                            {uniqueAuthors.map((author) => (
                                <MenuItem key={author} value={author}>
                                    {author}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        startIcon={<FolderPlus/>}
                        onClick={onAddCategory}
                        sx={groupColor ? {
                            bgcolor: groupColor,
                            color: '#fff',
                            borderColor: groupColor,
                            '&:hover': {bgcolor: groupColor, opacity: 0.85}
                        } : {}}
                    >
                        Dodaj kategorię
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
