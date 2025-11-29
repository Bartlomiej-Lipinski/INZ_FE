import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const CHOOSE_BEST_DATE_FOR_EVENT = process.env.CHOOSE_BEST_DATE_FOR_EVENT;

export async function POST(request: NextRequest) {
    try {
        const {groupId, eventId, suggestionId} = await request.json();

        const cookieHeader = request.headers.get('cookie') ?? '';
        const endpoint = CHOOSE_BEST_DATE_FOR_EVENT?.replace('{groupId}', groupId)
            .replace('{eventId}', eventId)
            .replace('{suggestionId}', suggestionId);
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
        console.error('Choose best date API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}