import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const GET_POST_COMMENTS = process.env.GET_POST_COMMENTS;

export async function GET(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const targetId = request.nextUrl.searchParams.get('targetId');
        if (!GET_POST_COMMENTS) {
            return NextResponse.json({success: false, message: 'Konfiguracja serwera niepełna'}, {status: 500});
        }
        if (!groupId || !targetId) {
            return NextResponse.json({
                success: false,
                message: 'Brak wymaganych parametrów: groupId lub targetId'
            }, {status: 400});
        }
        const endpoint = GET_POST_COMMENTS?.replace('{groupId}', groupId)
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
        console.error('Comments retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const targetId = request.nextUrl.searchParams.get('targetId');
        if (!GET_POST_COMMENTS) {
            return NextResponse.json({success: false, message: 'Konfiguracja serwera niepełna'}, {status: 500});
        }
        if (!groupId || !targetId) {
            return NextResponse.json({
                success: false,
                message: 'Brak wymaganych parametrów: groupId lub targetId'
            }, {status: 400});
        }
        const {content, entityType} = await request.json();
        const endpoint = GET_POST_COMMENTS?.replace('{groupId}', groupId)
            .replace('{targetId}', targetId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({entityType: entityType, content}),
            credentials: 'include',
        });

        const data = await response.json();


        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Comment creation API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}