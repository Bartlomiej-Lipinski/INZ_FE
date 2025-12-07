import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const DELETE_PUT_FEED = process.env.DELETE_PUT_FEED;

export async function PUT(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const feedItemId = request.nextUrl.searchParams.get('feedItemId');
        if (!groupId || !feedItemId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const {description, file} = await request.json();
        const endpoint = DELETE_PUT_FEED?.replace('{groupId}', groupId)
            .replace('{feedItemId}', feedItemId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const formData = new FormData();
        formData.append('description', description);
        if (file) {
            formData.append('file', file);
        }
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
                // 'Content-Type': 'multipart/form-data',
            },
            body: formData,
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('feed update API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const feedItemId = request.nextUrl.searchParams.get('feedItemId');
        if (!groupId || !feedItemId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = DELETE_PUT_FEED?.replace('{groupId}', groupId)
            .replace('{feedItemId}', feedItemId);
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
        console.error('feed deletion API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}