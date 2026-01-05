import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const REMOVE_GROUP_MEMBER = process.env.REMOVE_GROUP_MEMBER;

export async function DELETE(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const userId = request.nextUrl.searchParams.get('userId');
        if (!groupId || !userId) {
            return NextResponse.json(
                {success: false, message: 'Brak groupId lub memberId w zapytaniu'},
                {status: 400}
            );
        }
        const cookieHeader = request.headers.get('cookie') ?? '';
        const endpoint = REMOVE_GROUP_MEMBER?.replace('{groupId}', groupId)
            .replace('{userId}', userId);
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
        console.error('Remove member API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}