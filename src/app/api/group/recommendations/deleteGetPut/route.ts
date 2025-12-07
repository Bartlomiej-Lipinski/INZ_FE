import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const DELETE_GET_PUT_RECOMMENDATIONS = process.env.DELETE_GET_PUT_RECOMMENDATIONS;

export async function GET(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const recommendationId = request.nextUrl.searchParams.get('recommendationId');
        if (!groupId || !recommendationId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = DELETE_GET_PUT_RECOMMENDATIONS?.replace('{groupId}', groupId)
            .replace('{recommendationId}', recommendationId);
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
        console.error('Recommendation retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const recommendationId = request.nextUrl.searchParams.get('recommendationId');
        if (!groupId || !recommendationId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const category = formData.get('category') as string | null;
        const linkUrl = formData.get('linkUrl') as string | null;
        const imageUrl = formData.get('imageUrl') as string | null;
        const file = formData.get('file') as File | null;
        const endpoint = DELETE_GET_PUT_RECOMMENDATIONS?.replace('{groupId}', groupId)
            .replace('{recommendationId}', recommendationId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const backendFormData = new FormData();
        backendFormData.append('title', title);
        backendFormData.append('content', content);
        if (category) backendFormData.append('category', category);
        if (linkUrl) backendFormData.append('linkUrl', linkUrl);
        if (imageUrl) backendFormData.append('imageUrl', imageUrl);
        if (file) backendFormData.append('file', file);

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
            },
            body: backendFormData,
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

export async function DELETE(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const recommendationId = request.nextUrl.searchParams.get('recommendationId');
        if (!groupId || !recommendationId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = DELETE_GET_PUT_RECOMMENDATIONS?.replace('{groupId}', groupId)
            .replace('{recommendationId}', recommendationId);
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
        console.error('Recommendation deletion API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}