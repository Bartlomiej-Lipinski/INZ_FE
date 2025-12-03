import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";

const BASE_URL = process.env.BASE_URL;
const POST_STORAGE_FILE = process.env.POST_STORAGE_FILE;

export async function POST(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const entityId = request.nextUrl.searchParams.get('entityId');
        const entityType = request.nextUrl.searchParams.get('entityType');
        if (!groupId || !entityId || !entityType) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów w route'},
                {status: 400}
            );
        }
        const incomingFormData = await request.formData();
        const file = incomingFormData.get('file');
        const categoryId = incomingFormData.get('categoryId');
        if (!(file instanceof File)) {
            return NextResponse.json(
                {success: false, message: 'Brak pliku w formularzu'},
                {status: 400}
            );
        }
        const upstreamFormData = new FormData();
        upstreamFormData.append('file', file, file.name);
        if (categoryId) {
            upstreamFormData.append('categoryId', categoryId as string);
        }
        const endpoint = POST_STORAGE_FILE?.replace('{groupId}', groupId)
            .replace('{entityId}', entityId)
            .replace('{entityType}', entityType);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
            },
            body: upstreamFormData,
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('File upload API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}