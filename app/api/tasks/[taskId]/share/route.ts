import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Task from '@/models/task.model';
import User from '@/models/user.model';

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
          error: 'Internal Server Error!',
        },
        { status: 500 },
      );
    }

    const { taskId } = await params;
    const { userIds } = await request.json();

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: 'Task not found',
        },
        { status: 404 },
      );
    }

    // Check if users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'One or more users not found',
        },
        { status: 404 },
      );
    }

    //add users to sharedWith
    const currentSharedWith =
      task.sharedWith?.map((id: string) => id.toString()) || [];
    const uniqueUserIds = userIds.filter(
      (id: string) => !currentSharedWith.includes(id.toString()),
    );

    if (uniqueUserIds.length > 0) {
      task.sharedWith = [...(task.sharedWith || []), ...uniqueUserIds];

      //Log User activity
      task.activityLog.push({
        action: 'shared',
        performedBy: session.user.id,
        timestamp: new Date(),
        details: `Task shared with: ${users.map((user) => user.name).join(', ')}`,
      });

      await task.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Task shared successfully',
      data: {
        sharedWith: task.sharedWith,
      },
    });
  } catch (e) {
    console.error('Error sharing task: ', e);

    // Type safe error approach
    const errorMessage =
      e instanceof Error ? e.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}
