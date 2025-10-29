import { NextRequest, NextResponse } from 'next/server';
const BASE_URL = process.env.BASE_URL;
const USER = process.env.USER;


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const backendUrl = `${BASE_URL}${USER}/${id}`;

    const cookieHeader = request.headers.get('cookie') ?? '';

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    const textBody = await response.text();
    const data = textBody ? JSON.parse(textBody) : {};

    const nextResponse = NextResponse.json(data, { status: response.status });

    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append('Set-Cookie', cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error('User GET API error:', error);
    return NextResponse.json(
      { success: false, message: 'Wystąpił błąd połączenia' },
      { status: 500 }
    );
  }
}


