import React from 'react';
import {Box, Button, Card, FormControlLabel, LinearProgress, Radio, RadioGroup, Typography,} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {ArrowLeft, ChevronLeft, ChevronRight,} from 'lucide-react';
import {QuizAttemptAnswerRequestDto, QuizQuestionType, QuizResponseDto,} from '@/lib/types/quiz';

interface QuizTakeProps {
    quiz: QuizResponseDto;
    currentQuestionIndex: number;
    answers: Record<string, QuizAttemptAnswerRequestDto>;
    groupColor: string;
    onAnswerChange: (questionId: string, answer: Partial<QuizAttemptAnswerRequestDto>) => void;
    onNext: () => void;
    onPrevious: () => void;
    onSubmit: () => void;
    onCancel: () => void;
    onQuestionSelect: (index: number) => void;
}

export default function QuizTake({
                                     quiz,
                                     currentQuestionIndex,
                                     answers,
                                     groupColor,
                                     onAnswerChange,
                                     onNext,
                                     onPrevious,
                                     onSubmit,
                                     onCancel,
                                     onQuestionSelect,
                                 }: QuizTakeProps) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const allQuestionsAnswered = Object.keys(answers).length === quiz.questions.length;

    const isQuestionAnswered = (questionId: string) => !!answers[questionId];

    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                <Button startIcon={<ArrowLeft/>} onClick={onCancel} sx={{mb: 2}}>
                    Zakończ quiz
                </Button>

                <Box sx={{mb: 2}}>
                    <Typography variant="h5" sx={{fontWeight: 600}}>
                        {quiz.title}
                    </Typography>
                    {quiz.description && (
                        <Typography color="text.secondary" variant="body2">
                            {quiz.description}
                        </Typography>
                    )}
                </Box>

                <Box sx={{mb: 3}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                        <Typography variant="body2" color="text.secondary">
                            Pytanie {currentQuestionIndex + 1} z {quiz.questions.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {Math.round(progress)}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: groupColor + '22',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: groupColor,
                                transition: 'transform 0.3s ease',
                            },
                        }}
                    />
                </Box>

                <Card sx={{borderRadius: 3, p: 4, mb: 3}}>
                    <Typography variant="h6" sx={{fontWeight: 600, mb: 3}}>
                        {currentQuestion.content}
                    </Typography>

                    {currentQuestion.type === QuizQuestionType.MultipleChoice && (
                        <RadioGroup
                            value={answers[currentQuestion.id]?.selectedOptionId || ''}
                            onChange={(e) => onAnswerChange(currentQuestion.id, {selectedOptionId: e.target.value})}
                        >
                            {currentQuestion.options.map((option) => (
                                <FormControlLabel
                                    key={option.id}
                                    value={option.id}
                                    control={
                                        <Radio
                                            sx={{
                                                '&.Mui-checked': {
                                                    color: groupColor,
                                                },
                                            }}
                                        />
                                    }
                                    label={option.text}
                                    sx={{
                                        mb: 1,
                                        p: 2,
                                        borderRadius: 2,
                                        border: '2px solid transparent',
                                        '&:hover': {
                                            bgcolor: alpha(groupColor, 0.05),
                                        },
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    )}

                    {currentQuestion.type === QuizQuestionType.TrueFalse && (
                        <RadioGroup
                            value={
                                answers[currentQuestion.id]?.selectedTrueFalse !== undefined
                                    ? String(answers[currentQuestion.id].selectedTrueFalse)
                                    : ''
                            }
                            onChange={(e) =>
                                onAnswerChange(currentQuestion.id, {
                                    selectedTrueFalse: e.target.value === 'true',
                                })
                            }
                        >
                            <FormControlLabel
                                value="true"
                                control={
                                    <Radio
                                        sx={{
                                            '&.Mui-checked': {
                                                color: groupColor,
                                            },
                                        }}
                                    />
                                }
                                label="Prawda"
                                sx={{
                                    mb: 1,
                                    p: 2,
                                    borderRadius: 2,
                                    border: '2px solid transparent',
                                    '&:hover': {
                                        bgcolor: alpha(groupColor, 0.05),
                                    },
                                }}
                            />
                            <FormControlLabel
                                value="false"
                                control={
                                    <Radio
                                        sx={{
                                            '&.Mui-checked': {
                                                color: groupColor,
                                            },
                                        }}
                                    />
                                }
                                label="Fałsz"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: '2px solid transparent',
                                    '&:hover': {
                                        bgcolor: alpha(groupColor, 0.05),
                                    },
                                }}
                            />
                        </RadioGroup>
                    )}
                </Card>

                <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, mb: 3}}>
                    <Button
                        variant="outlined"
                        startIcon={<ChevronLeft size={20}/>}
                        onClick={onPrevious}
                        disabled={currentQuestionIndex === 0}
                    >
                        Poprzednie
                    </Button>

                    {isLastQuestion ? (
                        <Button
                            variant="contained"
                            onClick={onSubmit}
                            disabled={!allQuestionsAnswered}
                            sx={{bgcolor: groupColor}}
                        >
                            Zakończ quiz
                        </Button>
                    ) : (
                        <Button variant="contained" endIcon={<ChevronRight size={20}/>} onClick={onNext}
                                sx={{bgcolor: groupColor}}>
                            Następne
                        </Button>
                    )}
                </Box>

                {/* Question navigation */}
                <Box sx={{display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap'}}>
                    {quiz.questions.map((q, index) => (
                        <Box
                            key={q.id}
                            onClick={() => onQuestionSelect(index)}
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontWeight: 600,
                                bgcolor:
                                    index === currentQuestionIndex
                                        ? groupColor
                                        : isQuestionAnswered(q.id)
                                            ? alpha(groupColor, 0.3)
                                            : alpha('#fff', 0.1),
                                color: index === currentQuestionIndex || isQuestionAnswered(q.id) ? '#fff' : 'text.secondary',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: index === currentQuestionIndex ? groupColor : alpha(groupColor, 0.5),
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            {index + 1}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}