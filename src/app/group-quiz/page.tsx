"use client";

import React, {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {
    QuizAttemptAnswerRequestDto,
    QuizAttemptResponseDto,
    QuizQuestionRequestDto,
    QuizRequestDto,
    QuizResponseDto,
    ViewMode,
} from '@/lib/types/quiz';
import {calculateQuizScore} from '@/lib/utils/quiz';
import QuizList from '@/components/quiz/QuizList';
import QuizForm from '@/components/quiz/QuizForm';
import QuizTake from '@/components/quiz/QuizTake';
import QuizResults from '@/components/quiz/QuizResults';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {API_ROUTES} from "@/lib/api/api-routes-endpoints";


export default function QuizzesPage() {
    const searchParams = useSearchParams();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [quizzes, setQuizzes] = useState<QuizResponseDto[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<QuizResponseDto | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<QuizQuestionRequestDto[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, QuizAttemptAnswerRequestDto>>({});
    const [result, setResult] = useState<QuizAttemptResponseDto | null>(null);

    const groupData = useMemo(() => {
        const groupId = searchParams?.get('groupId') || '';
        const groupName = searchParams?.get('groupName') || '';
        const groupColor = searchParams?.get('groupColor') || '#9042fb';
        return {
            id: groupId,
            name: decodeURIComponent(groupName),
            color: decodeURIComponent(groupColor),
        };
    }, [searchParams]);

    useEffect(() => {
        if (!groupData.id) return;

        let mounted = true;

        const fetchQuizzes = async () => {
            try {
                const res = await fetchWithAuth(`${API_ROUTES.GET_QUIZZES}?groupId=${groupData.id}`,
                    {method: 'GET', credentials: 'include'}
                );

                if (!res.ok) {
                    console.error('Błąd pobierania quizów, status:', res.status);
                    return;
                }

                const json = await res.json();

                const raw = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

                const normalized: QuizResponseDto[] = raw.map((q: any) => ({
                    id: String(q.id),
                    groupId: String(q.groupId || groupData.id),
                    title: q.title || '',
                    description: q.description || undefined,
                    createdAt: q.createdAt || new Date().toISOString(),
                    questions: Array.isArray(q.questions) ? q.questions : [],
                }));

                if (mounted) setQuizzes(normalized);
            } catch (error) {
                console.error('Błąd podczas pobierania quizów:', error);
            }
        };

        fetchQuizzes();

        return () => {
            mounted = false;
        };
    }, [groupData.id]);

    const handleGetQuiz = async (quizId: string): Promise<QuizResponseDto | null> => {
        try {
            const res = await fetchWithAuth(
                `${API_ROUTES.GET_QUIZ_WITH_ANSWERS}?groupId=${groupData.id}&quizId=${quizId}`,
                {method: 'GET', credentials: 'include'}
            );

            if (!res.ok) {
                console.error('Błąd pobierania quizu, status:', res.status);
                return null;
            }

            const json = await res.json();
            const raw = json?.data ?? json;

            const normalized: QuizResponseDto = {
                id: String(raw.id),
                groupId: String(raw.groupId || groupData.id),
                title: raw.title || '',
                description: raw.description || undefined,
                createdAt: raw.createdAt || new Date().toISOString(),
                questions: Array.isArray(raw.questions) ? raw.questions : [],
            };

            return normalized;
        } catch (error) {
            console.error('Błąd podczas pobierania quizu:', error);
            return null;
        }
    };

    const handleCreateQuiz = () => {
        setTitle('');
        setDescription('');
        setQuestions([]);
        setViewMode('create');
    };

    const handleEditQuiz = (quiz: QuizResponseDto) => {
        setSelectedQuiz(quiz);
        setTitle(quiz.title);
        setDescription(quiz.description || '');
        setQuestions(
            quiz.questions.map((q: any) => ({
                Type: q.type,
                Content: q.content,
                Options: Array.isArray(q.options)
                    ? q.options.map((o: any) => ({Text: o.text, IsCorrect: !!o.isCorrect}))
                    : [],
                CorrectTrueFalse: typeof q.correctTrueFalse === 'boolean' ? q.correctTrueFalse : false,
            }))
        );
        setViewMode('edit');
    };

    const handleTakeQuiz = async (quiz: QuizResponseDto) => {
        const fullyLoadedQuiz = await handleGetQuiz(quiz.id);
        if (!fullyLoadedQuiz) {
            return;
        }
        setSelectedQuiz(fullyLoadedQuiz);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setResult(null);
        setViewMode('take');
    };

    const handleDeleteQuiz = async (quizId: string) => {
        try {
            const res = await fetchWithAuth(
                `${API_ROUTES.DELETE_QUIZZES}?groupId=${groupData.id}&quizId=${quizId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (!res.ok) {
                console.error('Błąd usuwania quizu, status:', res.status);
                return;
            }
            setQuizzes(prev => prev.filter(q => q.id !== quizId));
        } catch (error) {
            console.error('Błąd podczas usuwania quizu:', error);
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedQuiz(null);
    };

    async function handleSubmitQuiz() {
        if (viewMode === 'create') {
            if (!groupData.id) {
                console.error('Brak groupId');
                return;
            }
            if (!title.trim()) {
                console.error('Tytuł quizu jest wymagany');
                return;
            }

            const payload = {
                Title: title,
                Description: description || undefined,
                Questions: questions,
            } as QuizRequestDto;

            try {
                const res = await fetchWithAuth(
                    `${API_ROUTES.POST_QUIZZES}?groupId=${groupData.id}`,
                    {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(payload),
                        credentials: 'include',
                    }
                );

                if (!res.ok) {
                    console.error('Błąd tworzenia quizu, status:', res.status);
                    return;
                }

                const json = await res.json();
                const raw = json?.data ?? json;
                const createdRaw = Array.isArray(raw) ? raw[0] : raw;

                const created: QuizResponseDto = {
                    id: String(createdRaw?.id ?? Date.now().toString()),
                    groupId: String(createdRaw?.groupId ?? groupData.id),
                    title: createdRaw?.title ?? payload.Title,
                    description: createdRaw?.description ?? payload.Description,
                    createdAt: createdRaw?.createdAt ?? new Date().toISOString(),
                    questions: Array.isArray(createdRaw?.questions) ? createdRaw.questions : payload.Questions,
                };

                setQuizzes(prev => [created, ...prev]);
                setTitle('');
                setDescription('');
                setQuestions([]);
                setViewMode('list');
                return;
            } catch (error) {
                console.error('Błąd podczas tworzenia quizu:', error);
                return;
            }
        }
        if (viewMode === 'edit') {
            if (!selectedQuiz) {
                console.error('Brak wybranego quizu do edycji');
                return;
            }
            if (!title.trim()) {
                console.error('Tytuł quizu jest wymagany');
                return;
            }

            const payload = {
                Title: title,
                Description: description || undefined,
                Questions: questions,
            } as QuizRequestDto;

            try {
                const res = await fetchWithAuth(
                    `${API_ROUTES.UPDATE_QUIZZES}?groupId=${groupData.id}&quizId=${selectedQuiz.id}`,
                    {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(payload),
                        credentials: 'include',
                    }
                );

                if (!res.ok) {
                    console.error('Błąd aktualizacji quizu, status:', res.status);
                    return;
                }

                const json = await res.json();
                const raw = json?.data ?? json;

                const updated: QuizResponseDto = {
                    id: String(raw.id || selectedQuiz.id),
                    groupId: String(raw.groupId || groupData.id),
                    title: raw.title || payload.Title,
                    description: raw.description || payload.Description,
                    createdAt: raw.createdAt || selectedQuiz.createdAt,
                    questions: Array.isArray(raw.questions) ? raw.questions : payload.Questions,
                };

                setQuizzes(prev => prev.map(q => q.id === selectedQuiz.id ? updated : q));
                setTitle('');
                setDescription('');
                setQuestions([]);
                setViewMode('list');
                setSelectedQuiz(null);
                return;
            } catch (error) {
                console.error('Błąd podczas aktualizacji quizu:', error);
                return;
            }
        }

        const quizData: QuizResponseDto = {
            id: viewMode === 'edit' && selectedQuiz ? selectedQuiz.id : Date.now().toString(),
            groupId: groupData.id,
            title,
            description: description || undefined,
            createdAt: viewMode === 'edit' && selectedQuiz ? selectedQuiz.createdAt : new Date().toISOString(),
            questions: questions.map((q, qIndex) => {
                const baseQId = 'q-' + Date.now() + '-' + qIndex;
                return {
                    id: baseQId,
                    type: q.Type,
                    content: q.Content,
                    correctTrueFalse: q.CorrectTrueFalse,
                    options: q.Options
                        ? q.Options.map((o, oIndex) => ({
                            id: 'o-' + Date.now() + '-' + qIndex + '-' + oIndex,
                            questionId: baseQId,
                            text: o.Text,
                            isCorrect: o.IsCorrect,
                        }))
                        : [],
                };
            }),
        };

        if (viewMode === 'edit' && selectedQuiz) {
            setQuizzes(prev => prev.map((q) => (q.id === selectedQuiz.id ? quizData : q)));
        } else {
            setQuizzes(prev => [quizData, ...prev]);
        }

        handleBackToList();
    }

    const handleAnswerChange = (questionId: string, answer: Partial<QuizAttemptAnswerRequestDto>) => {
        setAnswers({
            ...answers,
            [questionId]: {
                questionId,
                ...answer,
            },
        });
    };

    const handleSubmitAttempt = () => {
        if (!selectedQuiz) return;

        const score = calculateQuizScore(selectedQuiz, answers);

        const mockResult: QuizAttemptResponseDto = {
            attemptId: 'attempt-' + Date.now(),
            quizId: selectedQuiz.id,
            score,
            completedAt: new Date().toISOString(),
            answers: Object.values(answers),
        };

        setResult(mockResult);
        setViewMode('results');
    };

    const handleRetake = () => {
        setAnswers({});
        setCurrentQuestionIndex(0);
        setResult(null);
        setViewMode('take');
    };

    // Render appropriate view
    if (viewMode === 'list') {
        return (
            <QuizList
                quizzes={quizzes}
                groupColor={groupData.color}
                onCreateQuiz={handleCreateQuiz}
                onEditQuiz={handleEditQuiz}
                onTakeQuiz={handleTakeQuiz}
                onDeleteQuiz={handleDeleteQuiz}
            />
        );
    }

    if (viewMode === 'create' || viewMode === 'edit') {
        return (
            <QuizForm
                mode={viewMode}
                title={title}
                description={description}
                questions={questions}
                groupColor={groupData.color}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onQuestionsChange={setQuestions}
                onSubmit={handleSubmitQuiz}
                onCancel={handleBackToList}
            />
        );
    }

    if (viewMode === 'take' && selectedQuiz) {
        return (
            <QuizTake
                quiz={selectedQuiz}
                currentQuestionIndex={currentQuestionIndex}
                answers={answers}
                groupColor={groupData.color}
                onAnswerChange={handleAnswerChange}
                onNext={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                onPrevious={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                onSubmit={handleSubmitAttempt}
                onCancel={handleBackToList}
                onQuestionSelect={setCurrentQuestionIndex}
            />
        );
    }

    if (viewMode === 'results' && result && selectedQuiz) {
        return (
            <QuizResults
                quiz={selectedQuiz}
                result={result}
                answers={answers}
                groupColor={groupData.color}
                onRetake={handleRetake}
                onBackToList={handleBackToList}
            />
        );
    }

    return null;
}