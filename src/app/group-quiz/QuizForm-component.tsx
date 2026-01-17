import React from 'react';
import {
    Box,
    Button,
    Card,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import {ArrowLeft, Plus, Trash2, X,} from 'lucide-react';
import {QuizQuestionRequestDto, QuizQuestionType} from '@/lib/types/quiz';

interface QuizFormProps {
    mode: 'create' | 'edit';
    title: string;
    description: string;
    questions: QuizQuestionRequestDto[];
    groupColor: string;
    onTitleChange: (title: string) => void;
    onDescriptionChange: (description: string) => void;
    onQuestionsChange: (questions: QuizQuestionRequestDto[]) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export default function QuizFormComponent({
                                     mode,
                                     title,
                                     description,
                                     questions,
                                     groupColor,
                                     onTitleChange,
                                     onDescriptionChange,
                                     onQuestionsChange,
                                     onSubmit,
                                     onCancel,
                                 }: QuizFormProps) {
    const handleAddQuestion = () => {
        onQuestionsChange([
            ...questions,
            {
                Type: QuizQuestionType.SingleChoice,
                Content: '',
                Options: [
                    {Text: '', IsCorrect: false},
                    {Text: '', IsCorrect: false},
                ],
                CorrectTrueFalse: false
            },
        ]);
    };

    const handleQuestionTypeChange = (index: number, Type: QuizQuestionType) => {
        const updated = [...questions];
        updated[index] = {
            ...updated[index],
            Type,
            Options:
                Type === QuizQuestionType.SingleChoice
                    ? [
                        {Text: '', IsCorrect: false},
                        {Text: '', IsCorrect: false},
                    ]
                    : undefined,

            CorrectTrueFalse: Type === QuizQuestionType.TrueFalse,
        };
        onQuestionsChange(updated);
    };

    const handleQuestionContentChange = (index: number, content: string) => {
        const updated = [...questions];
        updated[index].Content = content;
        onQuestionsChange(updated);
    };

    const handleAddOption = (questionIndex: number) => {
        const updated = [...questions];
        if (updated[questionIndex].Options) {
            updated[questionIndex].Options!.push({Text: '', IsCorrect: false});
            onQuestionsChange(updated);
        }
    };

    const handleOptionChange = (questionIndex: number, optionIndex: number, text: string) => {
        const updated = [...questions];
        if (updated[questionIndex].Options) {
            updated[questionIndex].Options[optionIndex].Text = text;
            onQuestionsChange(updated);
        }
    };

    const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
        const updated = [...questions];
        if (updated[questionIndex].Options) {
            updated[questionIndex].Options.forEach((opt, i) => {
                opt.IsCorrect = i === optionIndex;
            });
            onQuestionsChange(updated);
        }
    };

    const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
        const updated = [...questions];
        if (updated[questionIndex].Options && updated[questionIndex].Options.length > 2) {
            updated[questionIndex].Options.splice(optionIndex, 1);
            onQuestionsChange(updated);
        }
    };

    const handleTrueFalseChange = (questionIndex: number, value: boolean) => {
        const updated = [...questions];
        updated[questionIndex].CorrectTrueFalse = value;
        onQuestionsChange(updated);
    };

    const handleRemoveQuestion = (index: number) => {
        onQuestionsChange(questions.filter((_, i) => i !== index));
    };

    const isSubmitDisabled = !title.trim() || questions.length === 0;

    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                <Button startIcon={<ArrowLeft/>} onClick={onCancel} sx={{mb: 3, bgcolor: groupColor}}>
                    Powrót do listy
                </Button>

                <Typography variant="h4" sx={{mb: 4, fontWeight: 600}}>
                    {mode === 'edit' ? 'Edytuj quiz' : 'Nowy quiz'}
                </Typography>

                <Card sx={{borderRadius: 3, p: 3, mb: 3}}>
                    <TextField
                        fullWidth
                        label="Tytuł quizu"
                        value={title}
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
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Opis (opcjonalnie)"
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
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
                </Card>

                <Box sx={{mb: 3}}>
                    {questions.map((question, qIndex) => (
                        <Card key={qIndex} sx={{borderRadius: 3, p: 3, mb: 2}}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 2
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 600}}>
                                    Pytanie {qIndex + 1}
                                </Typography>
                                <IconButton size="small" onClick={() => handleRemoveQuestion(qIndex)}
                                            sx={{color: 'error.main'}}>
                                    <Trash2 size={20}/>
                                </IconButton>
                            </Box>

                            <FormControl fullWidth sx={{
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
                            }}>
                                <InputLabel>Typ pytania</InputLabel>
                                <Select
                                    value={question.Type}
                                    label="Typ pytania"
                                    onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value as QuizQuestionType)}
                                >
                                    <MenuItem value={QuizQuestionType.SingleChoice}>Wybór wielokrotny</MenuItem>
                                    <MenuItem value={QuizQuestionType.TrueFalse}>Prawda/Fałsz</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Treść pytania"
                                multiline
                                rows={2}
                                value={question.Content}
                                onChange={(e) => handleQuestionContentChange(qIndex, e.target.value)}
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

                            {question.Type === QuizQuestionType.SingleChoice && question.Options && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{mb: 1, fontWeight: 600}}>
                                        Odpowiedzi
                                    </Typography>
                                    {question.Options.map((option, oIndex) => (
                                        <Box key={oIndex} sx={{display: 'flex', gap: 1, mb: 1, alignItems: 'center'}}>
                                            <Radio
                                                checked={option.IsCorrect}
                                                onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                                                size="small"
                                                sx={{
                                                    '&.Mui-checked': {
                                                        color: groupColor,
                                                    },
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder={`Odpowiedź ${oIndex + 1}`}
                                                value={option.Text}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
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
                                            {question.Options!.length > 2 && (
                                                <IconButton size="small"
                                                            onClick={() => handleRemoveOption(qIndex, oIndex)}>
                                                    <X size={18}/>
                                                </IconButton>
                                            )}
                                        </Box>
                                    ))}
                                    <Button
                                        size="small"
                                        startIcon={<Plus size={18}/>}
                                        onClick={() => handleAddOption(qIndex)}
                                        sx={{mt: 1, bgcolor: groupColor}}
                                    >
                                        Dodaj odpowiedź
                                    </Button>
                                </Box>
                            )}

                            {question.Type === QuizQuestionType.TrueFalse && (
                                <RadioGroup
                                    value={String(question.CorrectTrueFalse)}
                                    onChange={(e) => handleTrueFalseChange(qIndex, e.target.value === 'true')}
                                >
                                    <FormControlLabel
                                        value={'true'}
                                        control={
                                            <Radio
                                                sx={{
                                                    '&.Mui-checked': {color: groupColor},
                                                }}
                                            />
                                        }
                                        label="Prawda"
                                    />
                                    <FormControlLabel
                                        value={'false'}
                                        control={
                                            <Radio
                                                sx={{
                                                    '&.Mui-checked': {color: groupColor},
                                                }}
                                            />
                                        }
                                        label="Fałsz"
                                    />
                                </RadioGroup>
                            )}
                        </Card>
                    ))}
                </Box>

                <Box sx={{display: 'flex', gap: 2}}>
                    <Button
                            startIcon={<Plus size={20}/>}
                            onClick={handleAddQuestion}
                            fullWidth
                            sx={{bgcolor: groupColor}}>
                        Dodaj pytanie
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        fullWidth
                        disabled={isSubmitDisabled}
                        sx={{bgcolor: groupColor}}
                    >
                        {mode === 'edit' ? 'Zapisz zmiany' : 'Utwórz quiz'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}