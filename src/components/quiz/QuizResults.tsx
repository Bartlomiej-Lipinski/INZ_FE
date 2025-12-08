import React from 'react';
import {Alert, Box, Button, Card, Typography,} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {ArrowLeft, Check, RotateCcw, Trophy, X,} from 'lucide-react';
import {
    QuizAttemptAnswerRequestDto,
    QuizAttemptResponseDto,
    QuizQuestionType,
    QuizResponseDto,
} from '@/lib/types/quiz';
import {getScoreColor, getScoreMessage, isAnswerCorrect} from '@/lib/utils/quiz';

interface QuizResultsProps {
    quiz: QuizResponseDto;
    result: QuizAttemptResponseDto;
    answers: Record<string, QuizAttemptAnswerRequestDto>;
    groupColor: string;
    onRetake: () => void;
    onBackToList: () => void;
}

export default function QuizResults({
                                        quiz,
                                        result,
                                        answers,
                                        groupColor,
                                        onRetake,
                                        onBackToList,
                                    }: QuizResultsProps) {
    const [showDetails, setShowDetails] = React.useState(false);
    const correctAnswers = quiz.questions.filter((q) => isAnswerCorrect(quiz, q.id, answers)).length;
    const scorePercentage = result.score;
    const scoreMessage = getScoreMessage(scorePercentage);

    return (
        <Box sx={{width: '100%', minHeight: '100vh', px: {xs: 2, sm: 3}, py: {xs: 3, sm: 4}}}>
            <Box sx={{maxWidth: 800, mx: 'auto'}}>
                <Button startIcon={<ArrowLeft/>} onClick={onBackToList} sx={{mb: 3}}>
                    Powrót do listy
                </Button>

                <Typography variant="h4" sx={{mb: 4, fontWeight: 600}}>
                    Wyniki quizu
                </Typography>

                <Card sx={{borderRadius: 3, p: 4, mb: 3, textAlign: 'center'}}>
                    <Trophy size={64} color={getScoreColor(scorePercentage)} style={{marginBottom: 16}}/>
                    <Typography variant="h3" sx={{fontWeight: 700, mb: 1, fontSize: '3rem'}}>
                        {scorePercentage}%
                    </Typography>
                    <Typography variant="h6" sx={{mb: 3, color: 'text.secondary'}}>
                        Poprawnych odpowiedzi: {correctAnswers} / {quiz.questions.length}
                    </Typography>

                    <Alert severity={scoreMessage.severity} sx={{mb: 3}}>
                        {scoreMessage.message}
                    </Alert>

                    <Box sx={{display: 'flex', gap: 2, justifyContent: 'center'}}>
                        <Button variant="outlined" startIcon={<RotateCcw size={20}/>} onClick={onRetake}>
                            Spróbuj ponownie
                        </Button>
                        <Button variant="contained" onClick={() => setShowDetails(!showDetails)}
                                sx={{bgcolor: groupColor}}>
                            {showDetails ? 'Ukryj odpowiedzi' : 'Pokaż odpowiedzi'}
                        </Button>
                    </Box>
                </Card>

                {showDetails && (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        {quiz.questions.map((question, index) => {
                            const userAnswer = answers[question.id];
                            const correct = isAnswerCorrect(quiz, question.id, answers);

                            return (
                                <Card
                                    key={question.id}
                                    sx={{
                                        borderRadius: 3,
                                        p: 3,
                                        border: `2px solid ${correct ? '#4caf50' : '#f44336'}`,
                                    }}
                                >
                                    <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                bgcolor: correct ? '#4caf50' : '#f44336',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {correct ? <Check size={20} color="white"/> : <X size={20} color="white"/>}
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                                Pytanie {index + 1}
                                            </Typography>
                                            <Typography sx={{mb: 2}}>{question.content}</Typography>

                                            {question.type === QuizQuestionType.MultipleChoice && (
                                                <Box>
                                                    {question.options.map((option) => {
                                                        const isSelected = userAnswer?.selectedOptionId === option.id;
                                                        const isCorrectOption = option.isCorrect;

                                                        return (
                                                            <Box
                                                                key={option.id}
                                                                sx={{
                                                                    p: 1.5,
                                                                    mb: 1,
                                                                    borderRadius: 2,
                                                                    bgcolor: isCorrectOption
                                                                        ? alpha('#4caf50', 0.1)
                                                                        : isSelected
                                                                            ? alpha('#f44336', 0.1)
                                                                            : 'transparent',
                                                                    border: `2px solid ${
                                                                        isCorrectOption ? '#4caf50' : isSelected ? '#f44336' : 'transparent'
                                                                    }`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                }}
                                                            >
                                                                {isCorrectOption && <Check size={20} color="#4caf50"/>}
                                                                {isSelected && !isCorrectOption &&
                                                                    <X size={20} color="#f44336"/>}
                                                                <Typography>{option.text}</Typography>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            )}

                                            {question.type === QuizQuestionType.TrueFalse && (
                                                <Box>
                                                    <Typography sx={{mb: 1}}>
                                                        <strong>Twoja
                                                            odpowiedź:</strong> {userAnswer?.selectedTrueFalse ? 'Prawda' : 'Fałsz'}
                                                    </Typography>
                                                    <Typography color={correct ? 'success.main' : 'error.main'}>
                                                        <strong>Poprawna
                                                            odpowiedź:</strong> {question.correctTrueFalse ? 'Prawda' : 'Fałsz'}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </Box>
        </Box>
    );
}