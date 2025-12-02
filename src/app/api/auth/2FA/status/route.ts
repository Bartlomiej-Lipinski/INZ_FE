import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;
const SET_USER_2FA = process.env.SET_USER_2FA;

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const cookieHeader = request.headers.get('cookie') ?? '';
        const enabled = body.enabled === true;

        const endpoint = SET_USER_2FA?.replace('{flag}', enabled.toString());
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
                'Accept': 'application/json'
            },
            credentials: 'include',
        });

        const textBody = await response.text();
        let data = {};
        
        if (textBody) {
            try {
                data = JSON.parse(textBody);
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                data = { success: false, message: 'Nieprawidłowa odpowiedź z serwera' };
            }
        }

        const nextResponse = NextResponse.json(data, { status: response.status });

        const setCookieHeaders = response.headers.getSetCookie();
        if (setCookieHeaders && setCookieHeaders.length > 0) {
            setCookieHeaders.forEach((cookie) => {
                nextResponse.headers.append('Set-Cookie', cookie);
            });
        }

        return nextResponse;
    } catch (error) {
        console.error('2FA Status PUT API error:', error);
        return NextResponse.json(
            { success: false, message: 'Wystąpił błąd połączenia' },
            { status: 500 }
        );
    }
}

