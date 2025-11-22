import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL ?? '';
const GENERATE_GROUP_CODE = process.env.GENERATE_JOIN_CODE ?? '';

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

        const endpoint = GENERATE_GROUP_CODE.includes('{groupId}')
            ? GENERATE_GROUP_CODE.replace('{groupId}', encodeURIComponent(groupId))
            : `${GENERATE_GROUP_CODE.replace(/\/$/, '')}/${encodeURIComponent(groupId)}`;

        const url = `${BASE_URL}${endpoint}`;

        const response = await fetchWithAuth(url, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
            },
            credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));

        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Generate join code error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}