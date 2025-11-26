import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {ExpenseCreate} from "@/lib/types/expense";

const BASE_URL = process.env.BASE_URL;
const DELETE_GET_PUT_SETTLEMENTS = process.env.DELETE_GET_PUT_SETTLEMENTS;

export async function GET(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const expenseId = request.nextUrl.searchParams.get('expenseId');
        if (!groupId || !expenseId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = DELETE_GET_PUT_SETTLEMENTS?.replace('{groupId}', groupId)
            .replace('{expenseId}', expenseId);
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
        console.error('Recommendation retrieval API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const expenseId = request.nextUrl.searchParams.get('expenseId');
        if (!groupId || !expenseId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const expensePayLoad = await request.json() as ExpenseCreate;
        const endpoint = DELETE_GET_PUT_SETTLEMENTS?.replace('{groupId}', groupId)
            .replace('{expenseId}', expenseId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                expensePayLoad
            }),
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Recommendation update API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const groupId = request.nextUrl.searchParams.get('groupId');
        const expenseId = request.nextUrl.searchParams.get('expenseId');
        if (!groupId || !expenseId) {
            return NextResponse.json(
                {success: false, message: 'Brak wymaganych parametrów'},
                {status: 400}
            );
        }
        const endpoint = DELETE_GET_PUT_SETTLEMENTS?.replace('{groupId}', groupId)
            .replace('{expenseId}', expenseId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Recommendation deletion API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}