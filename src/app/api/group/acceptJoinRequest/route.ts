import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const ACCEPT_JOIN_REQUEST = process.env.ACCEPT_JOIN_REQUEST;


export async function POST(request: NextRequest) {
    try {
        const {groupId, userId} = await request.json();
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${ACCEPT_JOIN_REQUEST}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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
        console.error('Accept join request API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}


