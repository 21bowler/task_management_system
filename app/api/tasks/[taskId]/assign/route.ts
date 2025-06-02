import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Task from '@/models/task.model';
import User from '@/models/user.model';

// This API route - /api/tasks/[taskId]/assign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not Authenticated! Please login.',
        },
        { status: 401 },
      );
    }
    const { taskId } = await params;
    const { userId } = await request.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 },
      );
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({
        success: false,
        message: 'Task not found',
      });
    }

    //Assign the task
    task.assignedTo = userId;

    //Log the activity
    task.activityLog.push({
      action: 'assigned',
      performedBy: session.user.id,
      timestamp: new Date(),
      details: `Task assigned to: ${user.name}`,
    });

    await task.save();

    return NextResponse.json({
      success: true,
      message: 'Task assigned successfully',
      data: {
        assignedTo: userId,
      },
    });
  } catch (e) {
    console.error('Error assigning task: ', e);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
