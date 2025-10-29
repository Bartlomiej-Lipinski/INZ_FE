import { NextRequest, NextResponse } from 'next/server';
const BASE_URL = process.env.BASE_URL;
const REFRESH = process.env.REFRESH;

export async function POST(request: NextRequest) {
  try {
  
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const cookieHeader = request.headers.get('cookie') ?? '';

    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'No refresh token' },
        { status: 401 }
      );
    }
 
    const backendUrl = `${BASE_URL}${REFRESH}?RefreshToken=${encodeURIComponent(refreshToken)}`;
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      credentials: 'include',
    });

    const textBody = await backendResponse.text();
     
    const response = new NextResponse(textBody, { status: backendResponse.status });

    const headers = backendResponse.headers as Headers & { getSetCookie?: () => string[] };
    const setCookies: string[] | undefined = typeof headers.getSetCookie === 'function'
      ? headers.getSetCookie()
      : undefined;

    if (Array.isArray(setCookies) && setCookies.length > 0) {
      for (const cookie of setCookies) {
        response.headers.append('set-cookie', cookie);
      }
    } else {
      const singleSetCookie = backendResponse.headers.get('set-cookie');
      if (singleSetCookie) {
        response.headers.set('set-cookie', singleSetCookie);
      }
    }

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, message: 'Błąd serwera podczas odświeżania tokena' },
      { status: 500 }
    );
  }
}
