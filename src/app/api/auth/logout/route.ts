import { NextResponse } from 'next/server';
const BASE_URL = process.env.BASE_URL;
const LOGOUT = process.env.LOGOUT;

export async function POST() {
    try {
        const response = await fetch(`${BASE_URL}${LOGOUT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        // Forward Set-Cookie headers from backend to client
        const res = NextResponse.json({ status: response.status });
        const setCookie = response.headers.getSetCookie?.() || response.headers.get('set-cookie');
        if (setCookie) {
            // getSetCookie() returns an array, get('set-cookie') returns a string
            if (Array.isArray(setCookie)) {
                for (const cookie of setCookie) {
                    res.headers.append('set-cookie', cookie);
                }
            } else {
                res.headers.set('set-cookie', setCookie);
            }
        }
        return res;
    }catch (error) {
        console.error('Logout API error:', error);
        return NextResponse.json(
            { success: false, message: 'Wystąpił błąd połączenia' },
            { status: 500 }
        );
    }
}

