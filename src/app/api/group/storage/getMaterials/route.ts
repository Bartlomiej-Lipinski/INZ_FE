import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const GET_GROUP_MATERIALS = process.env.GET_GROUP_MATERIALS;

export async function GET(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const categoryId = request.nextUrl.searchParams.get('categoryId');
        const uploadedById = request.nextUrl.searchParams.get('uploadedById');

        if (!groupId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }

        let endpoint = GET_GROUP_MATERIALS?.replace('{groupId}', groupId);

        const queryParams = new URLSearchParams();
        if (categoryId) queryParams.append('categoryId', categoryId);
        if (uploadedById) queryParams.append('uploadedById', uploadedById);

        if (queryParams.toString()) {
            endpoint += `?${queryParams.toString()}`;
        }

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
        console.error('File retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}