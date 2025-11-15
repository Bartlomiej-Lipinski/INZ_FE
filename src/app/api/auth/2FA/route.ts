import { NextRequest, NextResponse } from 'next/server';
const BASE_URL = process.env.BASE_URL;
const VERIFY_2FA = process.env.VERIFY_2FA;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${BASE_URL}${VERIFY_2FA}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Email: body.email,
                Code: body.code,
            }),
            credentials: 'include',
        });

        const textBody = await response.text();
        const data = textBody ? JSON.parse(textBody) : {};


         return  NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { success: false, message: 'Wystąpił błąd połączenia' },
            { status: 500 }
        );
    }
}

