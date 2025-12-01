import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;
const RESEND_2FA = process.env.RESEND_2FA;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const email = body.email.trim();

        const response = await fetch(`${BASE_URL}${RESEND_2FA}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Email: email,
            }),
            credentials: 'include',
        });

        const textBody = await response.text();
        const data = textBody ? JSON.parse(textBody) : {};

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Resend 2FA API error:', error);
        return NextResponse.json(
            { success: false, message: 'Wystąpił błąd połączenia' },
            { status: 500 }
        );
    }
}
