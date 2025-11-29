import {NextRequest, NextResponse} from 'next/server';
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const CHALLENGE_DELETE_PUT = process.env.CHALLENGE_DELETE_PUT;


export async function PUT(request: NextRequest) {
    try {
        const {groupId, challengeId, progressId, description, value} = await request.json();
        const endpoint = CHALLENGE_DELETE_PUT?.replace('{groupId}', groupId)
            .replace('{challengeId}', challengeId)
            .replace('{progressId}', progressId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description,
                value
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
        const {groupId, challengeId, progressId} = await request.json();
        const endpoint = CHALLENGE_DELETE_PUT?.replace('{groupId}', groupId)
            .replace('{challengeId}', challengeId)
            .replace('{progressId}', progressId);
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