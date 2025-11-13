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

        return  NextResponse.json({ status: response.status });
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { success: false, message: 'Wystąpił błąd połączenia' },
            { status: 500 }
        );
    }
}

