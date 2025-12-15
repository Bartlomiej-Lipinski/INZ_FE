"use client";

import {Box, Button, Card, Typography} from '@mui/material';
import {EventSuggestionResponseDto} from '@/lib/types/event';

interface EventSuggestionsProps {
    suggestions: EventSuggestionResponseDto[];
    finalDate: { start: string; end: string } | null;
    groupColor: string;
    onSelectSuggestion: (suggestion: EventSuggestionResponseDto) => void;
    onConfirm: () => void;
}

export default function EventSuggestions({
                                             suggestions,
                                             finalDate,
                                             groupColor,
                                             onSelectSuggestion,
                                             onConfirm,
                                         }: EventSuggestionsProps) {
    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                <Typography variant="h4" sx={{mb: 4, fontWeight: 600}}>
                    Propozycje terminów
                </Typography>
                {suggestions.map((s, idx) => (
                    <Card key={idx} sx={{
                        mb: 2,
                        p: 2,
                        border: finalDate?.start === s.startTime ? '2px solid #2196f3' : undefined
                    }}>
                        <Typography variant="h6">
                            {new Date(s.startTime).toLocaleString('pl-PL', {dateStyle: 'full', timeStyle: 'short'})}
                            {' - '}
                            {new Date(s.endTime).toLocaleTimeString('pl-PL', {timeStyle: 'short'})}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Dostępnych uczestników: <b>{s.availableUserCount}</b>
                        </Typography>
                        <Button
                            variant={finalDate?.start === s.startTime ? 'contained' : 'outlined'}
                            sx={{mt: 1, bgcolor: finalDate?.start === s.startTime ? groupColor : 'transparent'}}
                            onClick={() => onSelectSuggestion(s)}
                        >
                            Wybierz ten termin
                        </Button>
                    </Card>
                ))}
                {finalDate && (
                    <Button
                        variant="contained"
                        color="success"
                        sx={{mt: 3, bgcolor: groupColor}}
                        onClick={onConfirm}
                    >
                        Zatwierdź termin wydarzenia
                    </Button>
                )}
            </Box>
        </Box>
    );
}

