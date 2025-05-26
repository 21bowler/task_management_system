import { NextRequest } from 'next/server';

// Gets a single task by its ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> },
) {
    const {taskId} = await params;
    // e.g. Query a database for user with ID `id`
    return new Response(JSON.stringify({ TaskId: taskId, name: `User ${taskId}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> },
) {
    const {taskId} = await params;
    // e.g. Delete user with ID `id` in DB
    return new Response(null, { status: 204 });
}