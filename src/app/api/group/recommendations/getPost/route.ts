import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const GET_POST_RECOMMENDATIONS = process.env.GET_POST_RECOMMENDATIONS;

export async function GET(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        if (!groupId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = GET_POST_RECOMMENDATIONS?.replace('{groupId}', groupId);
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
        console.error('Recommendations retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const category = formData.get('category') as string | null;
        const linkUrl = formData.get('linkUrl') as string | null;
        const imageUrl = formData.get('imageUrl') as string | null;
        const file = formData.get('file') as File | null;

        if (!groupId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }

        const endpoint = GET_POST_RECOMMENDATIONS?.replace('{groupId}', groupId);
        const cookieHeader = request.headers.get('cookie') ?? '';

        const backendFormData = new FormData();
        backendFormData.append('title', title);
        backendFormData.append('content', content);
        if (category) backendFormData.append('category', category);
        if (linkUrl) backendFormData.append('linkUrl', linkUrl);
        if (imageUrl) backendFormData.append('imageUrl', imageUrl);
        if (file) backendFormData.append('file', file);

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
            },
            body: backendFormData,
            credentials: 'include',
        });

        const data = await response.json();

        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Recommendation creation API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}
