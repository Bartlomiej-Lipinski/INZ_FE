import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const GET_FILE_BY_ID = process.env.GET_FILE_BY_ID;

export async function GET(request: NextRequest) {
    try {
        const fileId = request.nextUrl.searchParams.get('fileId');
        if (!fileId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = GET_FILE_BY_ID?.replace('{id}', fileId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Accept': '*/*',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            return NextResponse.json(
                {success: false, message: 'Nie udało się pobrać pliku'},
                {status: response.status}
            );
        }

        // Pobierz plik jako blob i przekaż dalej
        const blob = await response.blob();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('File retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}