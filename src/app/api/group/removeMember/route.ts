import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const REMOVE_GROUP_MEMBER = process.env.REMOVE_GROUP_MEMBER;

export async function DELETE(request: NextRequest) {
    try {
        const {groupId, userId} = await request.json();

        if (!groupId || !userId) {
            return NextResponse.json(
                {success: false, message: 'Brakuje identyfikatora grupy lub użytkownika.'},
                {status: 400},
            );
        }

        const cookieHeader = request.headers.get('cookie') ?? '';
        const baseUrl = (BASE_URL ?? '').replace(/\/$/, '');
        const removeRouteTemplate = REMOVE_GROUP_MEMBER ?? '';
        const removeRoute = removeRouteTemplate
            .replace('{groupId}', encodeURIComponent(groupId))
            .replace('{userId}', encodeURIComponent(userId));
        const targetUrl = `${baseUrl}${removeRoute}`;

        const response = await fetch(targetUrl, {
            method: 'DELETE',
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
        console.error('Remove member API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}