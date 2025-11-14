import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;
const JOIN_GROUP = process.env.JOIN_GROUP;

export async function POST(request: NextRequest) {
    try {
        const body: { groupCode: string } = await request.json();

        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetch(`${BASE_URL}${JOIN_GROUP}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                groupCode: body.groupCode
            }),
            credentials: 'include',
        });

        const data = await response.json();


        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Group creation API error:', error);
        return NextResponse.json(
            { success: false, message: 'Wystąpił błąd połączenia' },
            { status: 500 }
        );
    }
}

