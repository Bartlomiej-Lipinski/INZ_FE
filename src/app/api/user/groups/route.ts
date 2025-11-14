import { NextRequest, NextResponse } from 'next/server';
const BASE_URL = process.env.BASE_URL;
const GET_USER_GROUPS = process.env.GET_USER_GROUPS;


export async function GET(request: NextRequest,  ) {
    try {

        const backendUrl = `${BASE_URL}${GET_USER_GROUPS}`;

        const cookieHeader = request.headers.get('cookie') ?? '';

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        const textBody = await response.text();
        const data = textBody ? JSON.parse(textBody) : {};

        const nextResponse = NextResponse.json(data, { status: response.status });



        return nextResponse;
    } catch (error) {
        console.error('User Groups GET API error:', error);
        return NextResponse.json(
            { success: false, message: 'Wystąpił błąd połączenia' },
            { status: 500 }
        );
    }
}


