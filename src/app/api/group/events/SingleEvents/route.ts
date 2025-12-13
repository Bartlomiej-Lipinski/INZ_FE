import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const EVENTS_PUT_GET_DELETE = process.env.EVENTS_PUT_GET_DELETE;

interface PostEvent {
    title: string;
    description: string;
    location: string;
    isAutoScheduled: boolean;
    rangeStart: Date;
    rangeEnd: Date;
    durationMinutes: number;
    startDate: Date;
    endDate: Date;
}

export async function PUT(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const eventId = request.nextUrl.searchParams.get('eventId');
        if (!groupId || !eventId) {
            return NextResponse.json(
                {success: false, message: 'Brak groupId lub eventId w zapytaniu'},
                {status: 400}
            );
        }
        const FromData = await request.formData();
        const endpoint = EVENTS_PUT_GET_DELETE?.replace('{groupId}', groupId)
            .replace('{eventId}', eventId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
            },
            body: FromData,
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Event update API error:', error);
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
        const endpoint = EVENTS_PUT_GET_DELETE?.replace('{groupId}', groupId)
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
        console.error('Event deletion API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const eventId = request.nextUrl.searchParams.get('eventId');
        if (!groupId || !eventId) {
            return NextResponse.json(
                {success: false, message: 'Brak groupId lub eventId w zapytaniu'},
                {status: 400}
            );
        }
        const endpoint = EVENTS_PUT_GET_DELETE?.replace('{groupId}', groupId)
            .replace('{eventId}', eventId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Event retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}


