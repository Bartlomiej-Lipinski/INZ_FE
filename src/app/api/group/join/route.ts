import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const JOIN_GROUP = process.env.R;

export async function POST(request: NextRequest) {
    try {
        const body: { groupCode: string } = await request.json();

        if (
            !body.groupCode ||
            typeof body.groupCode !== 'string' ||
            !/^\d{5}$/.test(body.groupCode)
        ) {
            return NextResponse.json(
                { success: false, message: 'Nieprawidłowy kod grupy. Kod musi składać się z 5 cyfr.' },
                { status: 400 }
            );
        }
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${JOIN_GROUP}`, {
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
        console.error('Group join API error:', error);
        return NextResponse.json(
            { success: false, message: 'Wystąpił błąd połączenia' },
            { status: 500 }
        );
    }
}

