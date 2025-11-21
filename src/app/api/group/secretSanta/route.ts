import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const SECRET_SANTA_PAIRS = process.env.SECRET_SANTA_PAIRS;

export async function POST(request: NextRequest) {
    try {
        const {groupId} = await request.json();
        const cookieHeader = request.headers.get('cookie') ?? '';
        const endpoint = SECRET_SANTA_PAIRS?.replace('{groupId}', groupId);
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'POST',
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
        console.error('Secret Santa API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}