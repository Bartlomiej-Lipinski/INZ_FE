import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const GET_POST_FEED = process.env.GET_POST_FEED;

export async function GET(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const page = request.nextUrl.searchParams.get('page') || '0';
        const pageSize = request.nextUrl.searchParams.get('pageSize') || '10';

        if (!groupId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }

        const endpoint = GET_POST_FEED?.replace('{groupId}', groupId);
        const url = `${BASE_URL}${endpoint}?page=${page}&pageSize=${pageSize}`;

        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(url, {
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
        console.error('feed get API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const description = formData.get('description') as string;
        const file = formData.get('file') as File | null;
        const groupId = formData.get('groupId') as string;

        if (!groupId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }

        const endpoint = GET_POST_FEED?.replace('{groupId}', groupId);
        const cookieHeader = request.headers.get('cookie') ?? '';

        const backendFormData = new FormData();
        backendFormData.append('description', description);
        if (file) {
            backendFormData.append('file', file);
        }

        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
            },
            body: backendFormData,
            credentials: 'include',
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                {success: false, message: errorText || 'Błąd podczas dodawania posta'},
                {status: response.status}
            );
        }

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            const data = await response.json();
            return NextResponse.json(data, {status: response.status});
        } else {
            return NextResponse.json(
                {success: true, message: 'Post został dodany'},
                {status: response.status}
            );
        }
    } catch (error) {
        console.error('Feed post API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}