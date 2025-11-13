import { NextRequest, NextResponse } from 'next/server';
import { GroupCreate } from '@/lib/types/group';

const BASE_URL = process.env.BASE_URL;
const ADD_GROUP = process.env.ADD_GROUP;

export async function POST(request: NextRequest) {
    try {
        const body: GroupCreate = await request.json();

        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetch(`${BASE_URL}${ADD_GROUP}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: body.name,
                color: body.color
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

