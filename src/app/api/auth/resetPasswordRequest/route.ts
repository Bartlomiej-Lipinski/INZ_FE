import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const PASSWORD_RESET_REQUEST = process.env.PASSWORD_RESET_REQUEST;

export async function POST(request: NextRequest) {

    try {

        const {email} = await request.json();

        const response = await fetchWithAuth(`${BASE_URL}${PASSWORD_RESET_REQUEST}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
            }),
            credentials: 'include',
        });

        const data = await response.json();

        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Register API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

