import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const GET_USER_GROUPS = process.env.GET_USER_GROUPS;


export async function GET(request: NextRequest) {
    try {

        const backendUrl = `${BASE_URL}${GET_USER_GROUPS}`;
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(backendUrl, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        const textBody = await response.text();
        const data = textBody ? JSON.parse(textBody) : {};

        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('User Groups GET API error:', error);
        return NextResponse.json(
            { success: false, message: 'Wystąpił błąd połączenia' },
            { status: 500 }
        );
    }
}


