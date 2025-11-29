import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const REACTIONS_POST = process.env.REACTIONS_POST;

export async function POST(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const targetId = request.nextUrl.searchParams.get('targetId');
        const entityType = request.nextUrl.searchParams.get('entityType');
        if (!entityType || !groupId || !targetId) {
            return NextResponse.json(
                { success: false, message: 'Missing required parameters: entityType, groupId, and targetId are all required.' },
                { status: 400 }
            );
        }
        const endpoint = REACTIONS_POST?.replace('{groupId}', groupId)
            .replace('{targetId}', targetId)
            .replace('{entityType}', entityType);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Reaction creation API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}