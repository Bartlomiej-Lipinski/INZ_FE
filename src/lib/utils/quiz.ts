import {QuizAttemptAnswerRequestDto, QuizQuestionType, QuizResponseDto,} from '../types/quiz';

export function calculateQuizScore(
    quiz: QuizResponseDto,
    answers: Record<string, QuizAttemptAnswerRequestDto>
): number {
    let correctCount = 0;

    quiz.questions.forEach((question) => {
        const userAnswer = answers[question.id];
        if (!userAnswer) return;

        if (question.type === QuizQuestionType.MultipleChoice) {
            const correctOption = question.options.find((o) => o.isCorrect);
            if (userAnswer.selectedOptionId === correctOption?.id) {
                correctCount++;
            }
        } else if (question.type === QuizQuestionType.TrueFalse) {
            if (userAnswer.selectedTrueFalse === question.correctTrueFalse) {
                correctCount++;
            }
        }
    });

    return Math.round((correctCount / quiz.questions.length) * 100);
}

export function isAnswerCorrect(
    quiz: QuizResponseDto,
    questionId: string,
    answers: Record<string, QuizAttemptAnswerRequestDto>
): boolean {
    const question = quiz.questions.find((q) => q.id === questionId);
    const userAnswer = answers[questionId];

    if (!question || !userAnswer) return false;

    if (question.type === QuizQuestionType.MultipleChoice) {
        const correctOption = question.options.find((o) => o.isCorrect);
        return userAnswer.selectedOptionId === correctOption?.id;
    } else {
        return userAnswer.selectedTrueFalse === question.correctTrueFalse;
    }
}

export function getScoreColor(score: number): string {
    if (score >= 70) return '#4caf50';
    if (score >= 50) return '#ff9800';
    return '#f44336';
}

export function getScoreMessage(score: number): {
    severity: 'success' | 'warning' | 'error';
    message: string;
} {
    if (score >= 70) {
        return {
            severity: 'success',
            message: 'Świetna robota! Wynik bardzo dobry! 🎉',
        };
    }
    if (score >= 50) {
        return {
            severity: 'warning',
            message: 'Dobry wynik, ale jest jeszcze pole do poprawy!',
        };
    }
    return {
        severity: 'error',
        message: 'Spróbuj ponownie - na pewno dasz radę lepiej!',
    };
}