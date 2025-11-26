import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {PoolCreate} from "@/lib/types/pool";

const BASE_URL = process.env.BASE_URL;
const POLLS_GET_DELETE_PUT = process.env.POLLS_GET_DELETE_PUT;

export async function PUT(request: NextRequest) {
    try {
        const {groupId, pollId, ...pollPayload} = await request.json() as PoolCreate & { groupId: string } & {
            pollId: string
        };
        const endpoint = POLLS_GET_DELETE_PUT?.replace('{groupId}', groupId)
            .replace('{pollId}', pollId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pollPayload
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
        const {groupId, pollId} = await request.json();
        const endpoint = POLLS_GET_DELETE_PUT?.replace('{groupId}', groupId)
            .replace('{pollId}', pollId);
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

export async function GET(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const pollId = request.nextUrl.searchParams.get('pollId');
        const endpoint = POLLS_GET_DELETE_PUT?.replace('{groupId}', groupId)
            .replace('{pollId}', pollId);
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
        console.error('Group retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}