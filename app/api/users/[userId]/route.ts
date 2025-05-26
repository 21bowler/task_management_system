import { NextRequest } from 'next/server';

// Gets a single user by its ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
) {
    const {userId} = await params;
    // e.g. Query a database for user with ID `id`
    return new Response(JSON.stringify({ userId, name: `User ${userId}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
) {
    const {userId} = await params;
    // e.g. Delete user with ID `id` in DB
    return new Response(null, { status: 204 });
}