import {NextRequest, NextResponse} from 'next/server';

const BASE_URL = process.env.BASE_URL;
const IS_ADMIN = process.env.IS_ADMIN;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const groupId = searchParams.get('groupid');

    if (!groupId) {
        return NextResponse.json(
            {success: false, message: 'Brak parametru groupId'},
            {status: 400},
        );
    }

    try {
        const resolvedPath = IS_ADMIN?.includes('{groupid}')
            ? IS_ADMIN?.replace('{groupid}', encodeURIComponent(groupId))
            : `${IS_ADMIN}?groupId=${encodeURIComponent(groupId)}`;
        const backendUrl = `${BASE_URL}${resolvedPath}`;
        const cookieHeader = request.headers.get('cookie') ?? '';

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Accept': 'application/json',
            },
            credentials: 'include',
        });

        const textBody = await response.text();
        const data = textBody ? JSON.parse(textBody) : {};

        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('IsAdmin GET API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500},
        );
    }
}

