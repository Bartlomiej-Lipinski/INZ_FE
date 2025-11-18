import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const JOIN_REQUESTS = process.env.GET_JOIN_REQUESTS;


export async function GET(request: NextRequest) {
    try {
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${JOIN_REQUESTS}`, {
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
        console.error('JOIN REQUEST GET API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}


