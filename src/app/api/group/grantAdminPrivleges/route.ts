import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const GRANT_ADMIN = process.env.GRANT_ADMIN;


export async function POST(request: NextRequest) {
    try {
        const {groupId, userId} = await request.json();
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${GRANT_ADMIN}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Accept': 'application/json'
            }, body: JSON.stringify({
                groupId: groupId,
                userId: userId
            }),
            credentials: 'include'
        });
        const textBody = await response.text();
        const data = textBody ? JSON.parse(textBody) : {};
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('User Groups GET API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}


