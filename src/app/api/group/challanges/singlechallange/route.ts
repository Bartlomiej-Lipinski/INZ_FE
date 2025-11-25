import {NextRequest, NextResponse} from 'next/server';
import {ChallangeCreate} from '@/lib/types/challange';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const CHALLENGES_DELETE_PUT_GET = process.env.CHALLENGES_DELETE_PUT_GET;


export async function PUT(request: NextRequest) {
    try {
        const {groupId, challengeId, ...createChallenge}: ChallangeCreate & { groupId: string } & {
            challengeId: string
        } = await request.json();
        const endpoint = CHALLENGES_DELETE_PUT_GET?.replace('{groupId}', groupId)
            .replace('{challengeId}', challengeId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                createChallenge
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
        const {groupId, challengeId} = await request.json();
        const endpoint = CHALLENGES_DELETE_PUT_GET?.replace('{groupId}', groupId)
            .replace('{challengeId}', challengeId);
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
        const {groupId, challengeId} = await request.json();
        const endpoint = CHALLENGES_DELETE_PUT_GET?.replace('{groupId}', groupId)
            .replace('{challengeId}', challengeId);
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