import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;

export async function DELETE(request: NextRequest) {
    try {
        const {userId, groupId} = await request.json();
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}/groups/${groupId}/reject-join-request`, {
            method: 'DELETE',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
            }),
            credentials: 'include',
        });

        const data = await response.json();

        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Reject join request API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}
