import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const REMOVE_GROUP_MEMBER = process.env.REMOVE_GROUP_MEMBER;

export async function POST(request: NextRequest) {
    try {
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${REMOVE_GROUP_MEMBER}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();


        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Group join API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}