export enum QuizQuestionType {
    SingleChoice = 1,
    TrueFalse = 2,
}

export interface QuizAnswerOptionRequestDto {
    Text: string;
    IsCorrect: boolean;
}

export interface QuizAnswerOptionResponseDto {
    id: string;
    questionId: string;
    text: string;
    isCorrect?: boolean;
}

export interface QuizQuestionRequestDto {
    Type: QuizQuestionType;
    Content: string;
    Options?: QuizAnswerOptionRequestDto[];
    CorrectTrueFalse: boolean;
}

export interface QuizQuestionResponseDto {
    id: string;
    type: QuizQuestionType;
    content: string;
    correctTrueFalse: boolean;
    options: QuizAnswerOptionResponseDto[];
}

export interface QuizRequestDto {
    Title: string;
    Description?: string;
    Questions: QuizQuestionRequestDto[];
}

export interface QuizResponseDto {
    id: string;
    groupId: string;
    title: string;
    description?: string;
    createdAt: string;
    questions: QuizQuestionResponseDto[];
}

export interface QuizAttemptAnswerRequestDto {
    questionId: string;
    selectedOptionId?: string;
    selectedTrueFalse?: boolean;
}

export interface QuizAttemptResponseDto {
    attemptId: string;
    quizId: string;
    score: number;
    completedAt: string;
    answers: QuizAttemptAnswerRequestDto[];
}

export type ViewMode = 'list' | 'create' | 'edit' | 'take' | 'results';