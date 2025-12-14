import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {AvailabilityRangeRequestDto} from "@/lib/types/event";

const BASE_URL = process.env.BASE_URL;
const AVAILABILITY_POST_DELETE = process.env.AVAILABILITY_POST_DELETE;

export async function POST(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const eventId = request.nextUrl.searchParams.get('eventId');
        if (!groupId || !eventId) {
            return NextResponse.json(
                {success: false, message: 'Brak groupId lub eventId w zapytaniu'},
                {status: 400}
            );
        }
        const requestBody = await request.json() as AvailabilityRangeRequestDto[];
        const endpoint = AVAILABILITY_POST_DELETE?.replace('{groupId}', groupId)
            .replace('{eventId}', eventId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Avalibility range API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const eventId = request.nextUrl.searchParams.get('eventId');
        if (!groupId || !eventId) {
            return NextResponse.json(
                {success: false, message: 'Brak groupId lub eventId w zapytaniu'},
                {status: 400}
            );
        }
        const endpoint = AVAILABILITY_POST_DELETE?.replace('{groupId}', groupId)
            .replace('{eventId}', eventId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Group deletion API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}