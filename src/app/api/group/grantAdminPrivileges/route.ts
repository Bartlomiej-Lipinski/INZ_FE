import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL ?? '';
const GRANT_ADMIN = process.env.GRANT_ADMIN ?? '';

export async function POST(request: NextRequest) {
    try {
        const {groupId, userId} = await request.json();

        if (!groupId || !userId) {
            return NextResponse.json(
                {success: false, message: 'Brakuje identyfikatora grupy lub użytkownika.'},
                {status: 400},
            );
        }


        const cookieHeader = request.headers.get('cookie') ?? '';
        const sanitizedBaseUrl = BASE_URL.replace(/\/$/, '');
        const template = GRANT_ADMIN.trim();
        const normalizedTemplate = template.startsWith('/') ? template : `/${template}`;
        const endpointPath = normalizedTemplate.replace('{groupId}', encodeURIComponent(groupId));
        const targetUrl = `${sanitizedBaseUrl}${endpointPath}`;

        const response = await fetchWithAuth(targetUrl, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Accept': 'application/json',
            },
            body: JSON.stringify({userId}),
            credentials: 'include',
        });

        const textBody = await response.text();
        const data = textBody ? JSON.parse(textBody) : {};
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Grant admin privileges API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}


