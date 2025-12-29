"use client";

import React, {useState} from 'react';
import {Box, Button, Card, FormControlLabel, IconButton, Radio, RadioGroup, TextField, Typography} from '@mui/material';
import {ArrowLeft, ImageIcon, X} from 'lucide-react';

interface EventFormProps {
    title: string;
    description: string;
    location: string;
    isAutoScheduled: boolean;
    startDate: string;
    endDate: string;
    durationMinutes: string;
    rangeStart: string;
    rangeEnd: string;
    groupColor: string;
    isEditMode: boolean;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onLocationChange: (value: string) => void;
    onIsAutoScheduledChange: (value: boolean) => void;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onDurationMinutesChange: (value: string) => void;
    onRangeStartChange: (value: string) => void;
    onRangeEndChange: (value: string) => void;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBack: () => void;
    onSubmit: () => void;
    isValid: boolean;
}

export default function EventForm({
                                      title,
                                      description,
                                      location,
                                      isAutoScheduled,
                                      startDate,
                                      endDate,
                                      durationMinutes,
                                      rangeStart,
                                      rangeEnd,
                                      groupColor,
                                      isEditMode,
                                      onTitleChange,
                                      onDescriptionChange,
                                      onLocationChange,
                                      onIsAutoScheduledChange,
                                      onStartDateChange,
                                      onEndDateChange,
                                      onDurationMinutesChange,
                                      onRangeStartChange,
                                      onRangeEndChange,
                                      onImageChange,
                                      onBack,
                                      onSubmit,
                                      isValid,
                                  }: EventFormProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
        onImageChange(e);
    };

    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                <Button startIcon={<ArrowLeft/>} onClick={onBack} sx={{mb: 3, bgcolor: groupColor}}>
                    Powrót do listy
                </Button>

                <Typography variant="h4" sx={{mb: 4, fontWeight: 600}}>
                    {isEditMode ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
                </Typography>

                <Card sx={{borderRadius: 3, p: 3, mb: 3}}>
                    <TextField fullWidth label="Nazwa wydarzenia" value={title}
                               onChange={(e) => onTitleChange(e.target.value)}
                               sx={{
                                   mb: 2,
                                   '& .MuiOutlinedInput-root': {
                                       borderRadius: 3,
                                       '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                           borderColor: groupColor,
                                       },
                                       '&:hover .MuiOutlinedInput-notchedOutline': {
                                           borderColor: groupColor,
                                       },
                                   }
                               }}/>

                    <TextField
                        fullWidth
                        label="Opis (opcjonalnie)"
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupColor,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: groupColor,
                                },
                            }
                        }}
                    />

                    <TextField fullWidth label="Lokalizacja (opcjonalnie)" value={location}
                               onChange={(e) => onLocationChange(e.target.value)} sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: groupColor,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: groupColor,
                            },
                        }
                    }}/>

                    {/* Zdjęcie */}
                    <Box sx={{mb: 2}}>
                        <Typography variant="subtitle2" sx={{mb: 1, fontWeight: 600}}>
                            Zdjęcie wydarzenia (opcjonalnie)
                        </Typography>
                        <Button
                            component="label"
                            startIcon={<ImageIcon size={18}/>}
                            fullWidth
                            sx={{mb: 1, bgcolor: groupColor}}
                        >
                            Wybierz zdjęcie
                            <input
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={handleImageChange} // Zmień na nową funkcję
                            />
                        </Button>
                        {previewUrl && (
                            <Box sx={{position: 'relative', mb: 2}}>
                                <img
                                    src={previewUrl}
                                    alt="Podgląd zdjęcia"
                                    style={{width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8}}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => setPreviewUrl(null)}
                                    sx={{position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper'}}
                                >
                                    <X size={16}/>
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                </Card>

                <Card sx={{borderRadius: 3, p: 3, mb: 3}}>
                    <Typography variant="h6" sx={{mb: 2}}>
                        Sposób ustalenia terminu
                    </Typography>

                    <RadioGroup value={isAutoScheduled ? 'auto' : 'manual'}
                                onChange={(e) => onIsAutoScheduledChange(e.target.value === 'auto')}>
                        <FormControlLabel value="manual" control={<Radio
                            sx={{color: groupColor, '&.Mui-checked': {color: groupColor}}}/>}
                                          label="Ustalam termin samodzielnie"/>
                        <FormControlLabel value="auto" control={<Radio
                            sx={{color: groupColor, '&.Mui-checked': {color: groupColor}}}/>}
                                          label="System pomoże wybrać najlepszy termin"/>
                    </RadioGroup>

                    {!isAutoScheduled && (
                        <Box sx={{mt: 2}}>
                            <Box sx={{display: 'flex', gap: 2}}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="Początek"
                                    value={startDate}
                                    onChange={(e) => onStartDateChange(e.target.value)}
                                    InputLabelProps={{shrink: true}}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: groupColor,
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: groupColor,
                                            },
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="Koniec"
                                    value={endDate}
                                    onChange={(e) => onEndDateChange(e.target.value)}
                                    InputLabelProps={{shrink: true}}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: groupColor,
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: groupColor,
                                            },
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    {isAutoScheduled && (
                        <Box sx={{mt: 2}}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Przewidywany czas trwania (minuty)"
                                value={durationMinutes}
                                onChange={(e) => onDurationMinutesChange(e.target.value)}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: groupColor,
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: groupColor,
                                        },
                                    }
                                }}
                            />

                            <Typography variant="subtitle2" sx={{mb: 1}}>
                                Przedział dat do wyszukania terminu
                            </Typography>

                            <Box sx={{display: 'flex', gap: 2}}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Od"
                                    value={rangeStart}
                                    onChange={(e) => onRangeStartChange(e.target.value)}
                                    InputLabelProps={{shrink: true}}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: groupColor,
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: groupColor,
                                            },
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Do"
                                    value={rangeEnd}
                                    onChange={(e) => onRangeEndChange(e.target.value)}
                                    InputLabelProps={{shrink: true}}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: groupColor,
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: groupColor,
                                            },
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    )}
                </Card>

                <Button variant="contained" fullWidth onClick={onSubmit} disabled={!isValid} sx={{bgcolor: groupColor}}>
                    {isEditMode ? 'Zapisz zmiany' : 'Utwórz wydarzenie'}
                </Button>
            </Box>
        </Box>
    );
}