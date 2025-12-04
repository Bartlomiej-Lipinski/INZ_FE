import {NextRequest, NextResponse} from 'next/server';

const BASE_URL = process.env.BASE_URL;
const PROFILE_PHOTO = process.env.PROFILE_PHOTO;


export async function POST(request: NextRequest) {
    try {
        const incomingFormData = await request.formData();
        const file = incomingFormData.get('file');
        if (!(file instanceof File)) {
            return NextResponse.json(
                {success: false, message: 'Brak pliku w formularzu'},
                {status: 400}
            );
        }
        const upstreamFormData = new FormData();
        upstreamFormData.append('file', file, file.name);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetch(`${BASE_URL}${PROFILE_PHOTO}`, {
            method: 'POST',
            headers: {
                'Cookie': cookieHeader,
            },
            body: upstreamFormData,
            credentials: 'include',
        });
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            return NextResponse.json(data, {status: response.status});
        }

        const bodyText = await response.text();
        return NextResponse.json(
            bodyText ? {raw: bodyText} : {success: response.ok},
            {status: response.status},
        );
    } catch (error) {
        console.error('File upload API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null);
        const fileId = body?.fileId;

        if (!fileId || typeof fileId !== "string") {
            return NextResponse.json(
                {success: false, message: 'Brak identyfikatora pliku'},
                {status: 400}
            );
        }

        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetch(`${BASE_URL}${PROFILE_PHOTO}`, {
            method: 'DELETE',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({fileId}),
            credentials: 'include',
        });

        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            return NextResponse.json(data, {status: response.status});
        }
        return NextResponse.json(
            {success: response.ok},
            {status: response.status}
        );
    } catch (error) {
        console.error('File delete API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}
