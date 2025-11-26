import {NextRequest, NextResponse} from "next/server";
import {fetchWithAuth} from "@/lib/api/fetch-with-auth";
import {ChallengeCreate} from "@/lib/types/challenge";

const BASE_URL = process.env.BASE_URL;
const CHALLENGES_GET_POST = process.env.CHALLENGES_GET_POST;

export async function PUT(request: NextRequest) {
    try {
        const {groupId, challengeId, ...createChallenge}: ChallengeCreate & { groupId: string } & {
            challengeId: string
        } = await request.json();
        const endpoint = CHALLENGES_GET_POST?.replace('{groupId}', groupId)
            .replace('{challengeId}', challengeId);
        const cookieHeader = request.headers.get('cookie') ?? '';
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                createChallenge
            }),
            credentials: 'include',
        });
        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Group update API error:', error);
        return NextResponse.json(
            {success: false, message: 'Wystąpił błąd połączenia'},
            {status: 500}
        );
    }
}