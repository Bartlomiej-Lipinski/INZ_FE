import {NextRequest, NextResponse} from "next/server";

const BASE_URL = process.env.BASE_URL;
const GET_FILE_BY_ID = process.env.GET_FILE_BY_ID;

export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }

        const endpoint = GET_FILE_BY_ID?.replace('{id}', id);

        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Accept': '*/*',
            },
            credentials: 'include',
        });

        const headers = new Headers();
        const contentType = response.headers.get('content-type');
        if (contentType) {
            headers.set('Content-Type', contentType);
        }
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
            headers.set('Content-Disposition', contentDisposition);
        }
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
            headers.set('Content-Length', contentLength);
        }

        const nextResponse = new NextResponse(response.body, {
            status: response.status,
            headers,
        });

        const setCookieHeaders = response.headers.getSetCookie();
        setCookieHeaders.forEach((cookie) => {
            nextResponse.headers.append('Set-Cookie', cookie);
        });

        return nextResponse;
    } catch (error) {
        console.error('File retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}