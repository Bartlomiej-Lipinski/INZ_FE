import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.BASE_URL;
const UPDATE_USER = process.env.UPDATE_USER;

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const cookieHeader = request.headers.get('cookie') ?? '';

    const response = await fetch(`${BASE_URL}${UPDATE_USER}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        Name: body.name,
        Surname: body.surname,
        BirthDate: body.birthDate,
        Status: body.status,
        Username: body.username,
        Description: body.description
      }),
      credentials: 'include'
    });

    const textBody = await response.text();
    
    let data = {};
    const contentType = response.headers.get('content-type') || '';
    
    if (textBody && contentType.includes('application/json')) {
      try {
        data = JSON.parse(textBody);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        return NextResponse.json(
          { success: false},
          { status: 502 }
        );
      }
    }

    const nextResponse = NextResponse.json(data, { status: response.status });

    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append('Set-Cookie', cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error('User Profile PUT API error:', error);
    return NextResponse.json(
      { success: false, message: 'Wystąpił błąd połączenia' },
      { status: 500 }
    );
  }
}

