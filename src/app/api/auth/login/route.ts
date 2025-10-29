import { NextRequest, NextResponse } from 'next/server';
const BASE_URL = process.env.BASE_URL;
const LOGIN = process.env.LOGIN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BASE_URL}${LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Email: body.email,
        Password: body.password,
        CaptchaToken: body.captchaToken
      }),
      credentials: 'include',
    });

    const textBody = await response.text();
    const data = textBody ? JSON.parse(textBody) : {};

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

   
    const nextResponse = NextResponse.json(data, { status: response.status });
    
    const setCookieHeaders = response.headers.getSetCookie();
  
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append('Set-Cookie', cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Wystąpił błąd połączenia' },
      { status: 500 }
    );
  }
}

