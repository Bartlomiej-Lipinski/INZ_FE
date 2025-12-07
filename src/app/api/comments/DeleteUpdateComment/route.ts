import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const DELETE_UPDATE_COMMENTS = process.env.DELETE_UPDATE_COMMENTS;

export async function PUT(request: NextRequest) {
    try {
        const {entityType, content, groupId, targetId, commentId} = await request.json();
        const endpoint = DELETE_UPDATE_COMMENTS?.replace('{groupId}', groupId)
            .replace('{targetId}', targetId)
            .replace('{commentId}', commentId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entityType, content }),
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Comment update API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const targetId = request.nextUrl.searchParams.get('targetId');
        const commentId = request.nextUrl.searchParams.get('commentId');
        if (!DELETE_UPDATE_COMMENTS) {
            return NextResponse.json({success: false, message: 'Konfiguracja serwera niepełna'}, {status: 500});
        }
        if (!groupId || !targetId || !commentId) {
            return NextResponse.json({
                success: false,
                message: 'Brak wymaganych parametrów: groupId, targetId lub commentId'
            }, {status: 400});
        }
        const endpoint = DELETE_UPDATE_COMMENTS?.replace('{groupId}', groupId)
            .replace('{targetId}', targetId)
            .replace('{commentId}', commentId);
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
        console.error('Comment deletion API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}