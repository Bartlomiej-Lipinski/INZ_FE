import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const REACTIONS_GET = process.env.REACTIONS_GET;

export async function GET(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const targetId = request.nextUrl.searchParams.get('targetId');
        if (!REACTIONS_GET) {
            return NextResponse.json({success: false, message: 'Konfiguracja serwera niepełna'}, {status: 500});
        }
        if (!groupId || !targetId) {
            return NextResponse.json({
                success: false,
                message: 'Brak wymaganych parametrów: groupId lub targetId'
            }, {status: 400});
        }
        const endpoint = REACTIONS_GET?.replace('{groupId}', groupId)
            .replace('{targetId}', targetId);
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
        console.error('reaction retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}