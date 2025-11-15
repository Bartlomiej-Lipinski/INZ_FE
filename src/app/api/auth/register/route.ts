import { NextRequest, NextResponse } from 'next/server';
import { UserCreate } from '@/lib/types/user';

const BASE_URL = process.env.BASE_URL;
const REGISTER = process.env.REGISTER;

export async function POST(request: NextRequest) {
  try {
    const body: UserCreate = await request.json();
    
    const response = await fetch(`${BASE_URL}${REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Name: body.name,
        UserName: body.username,
        Surname: body.surname,
        Email: body.email,
        BirthDate: body.birthDate,
        Password: body.password
      }),
      credentials: 'include',
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, message: 'Wystąpił błąd połączenia' },
      { status: 500 }
    );
  }
}

