import {NextRequest, NextResponse} from 'next/server';
import {GroupCreate} from '@/lib/types/group';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const GROUP = process.env.GROUP;

export async function POST(request: NextRequest) {
    try {
        const body: GroupCreate = await request.json();

        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${GROUP}`, {
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


        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Group creation API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const {id, name, color}: GroupCreate & { id: string } = await request.json();
        
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${GROUP}/${id}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                color: color
            }),
            credentials: 'include',
        });

        const data = await response.json();


        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Group update API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const {id} = await request.json();
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${GROUP}/${id}`, {
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

export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${GROUP}/${id}`, {
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
        console.error('Group retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}


