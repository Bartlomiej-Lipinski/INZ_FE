import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL ?? '';
const GROUP_MEMBERS = process.env.GET_GROUP_MEMBERS ?? '';

export async function POST(request: NextRequest) {
    try {
        const cookieHeader = request.headers.get('cookie') ?? '';

        const body = await request.json().catch(() => ({}));
        const groupId = (body && (body.groupId ?? body.groupID ?? body.id)) ?? null;

        if (!groupId || typeof groupId !== 'string') {
            return NextResponse.json(
                {success: false, message: 'Brak lub nieprawidłowe groupId w body'},
                {status: 400}
            );
        }

        const endpoint = GROUP_MEMBERS.includes('{groupId}')
            ? GROUP_MEMBERS.replace('{groupId}', encodeURIComponent(groupId))
            : `${GROUP_MEMBERS.replace(/\/$/, '')}/${encodeURIComponent(groupId)}`;

        const url = `${BASE_URL}${endpoint}`;

        const response = await fetchWithAuth(url, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
            },
            credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));

        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Group members proxy error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}