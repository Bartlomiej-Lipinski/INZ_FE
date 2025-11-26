import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {QuizzesAnswer} from "@/lib/types/quizzes";

const BASE_URL = process.env.BASE_URL;
const QUIZZES_GET_ATTEMPTS = process.env.QUIZZES_GET_ATTEMPTS;
const QUIZZES_POST_ATTEMPT = process.env.QUIZZES_POST_ATTEMPT;


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
        const endpoint = QUIZZES_GET_ATTEMPTS?.replace('{groupId}', groupId)
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
        console.error('Quiz attempts retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const quizId = request.nextUrl.searchParams.get('quizId');
        const quizPayLoad = await request.json() as QuizzesAnswer;
        if (!groupId || !quizId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = QUIZZES_POST_ATTEMPT?.replace('{groupId}', groupId)
            .replace('{quizId}', quizId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({quizPayLoad}),
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Recommendation update API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}
