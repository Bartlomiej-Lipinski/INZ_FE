import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {QuizRequestDto} from "@/lib/types/quiz";

const BASE_URL = process.env.BASE_URL;
const QUIZZES_GET_PUT_DELETE = process.env.QUIZZES_GET_PUT_DELETE;

export async function GET(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const quizId = request.nextUrl.searchParams.get('quizId');
        if (!groupId || !quizId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = QUIZZES_GET_PUT_DELETE?.replace('{groupId}', groupId)
            .replace('{quizId}', quizId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Quiz retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const quizId = request.nextUrl.searchParams.get('quizId');
        const quizPayLoad = await request.json() as QuizRequestDto;
        if (!groupId || !quizId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = QUIZZES_GET_PUT_DELETE?.replace('{groupId}', groupId)
            .replace('{quizId}', quizId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Title: quizPayLoad.Title,
                Description: quizPayLoad.Description,
                Questions: quizPayLoad.Questions,
            }),
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Quiz update API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const quizId = request.nextUrl.searchParams.get('quizId');
        if (!groupId || !quizId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = QUIZZES_GET_PUT_DELETE?.replace('{groupId}', groupId)
            .replace('{quizId}', quizId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Quiz deletion API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}