import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const USER_BY_ID = process.env.USER_BY_ID;

export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!USER_BY_ID) {
            return NextResponse.json({success: false, message: 'Konfiguracja serwera niepełna'}, {status: 500});
        }
        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'Brak wymaganego parametru: id'
            }, {status: 400});
        }
        const endpoint = USER_BY_ID.replace('{id}', id);
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
        console.error('get user by id API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}