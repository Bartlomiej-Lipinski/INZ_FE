import {NextRequest, NextResponse} from 'next/server';
import {GroupCreate} from '@/lib/types/group';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const GROUP = process.env.GROUP;
const UPDATE_GROUP = process.env.UPDATE_GROUP;
const DELETE_GROUP = process.env.DELETE_GROUP;

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
        const groupId = request.nextUrl.searchParams.get('groupId');
        if (!groupId) {
            return NextResponse.json(
                {success: false, message: 'Brak id grupy w zapytaniu'},
                {status: 400}
            );
        }
        const {name, color}: GroupCreate = await request.json();

        const endpoint = UPDATE_GROUP?.replace('{groupId}', groupId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
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
        const groupId = request.nextUrl.searchParams.get('groupId');
        if (!groupId) {
            return NextResponse.json(
                {success: false, message: 'Brak id grupy w zapytaniu'},
                {status: 400}
            );
        }
        const endpoint = DELETE_GROUP?.replace('{groupId}', groupId);
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


