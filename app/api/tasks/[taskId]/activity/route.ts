import { NextRequest, NextResponse } from 'next/server';
import Task from '@/models/task.model';
import dbConnect from '@/lib/mongodb';

// Endpoint: /api/tasks/[taskId]/activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    await dbConnect();

    const { taskId } = await params;

    const task = await Task.findById(taskId)
      .populate('activityLog.performedBy', 'name email')
      .select('activityLog');

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: 'Task not found',
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task successfully fetched',
      data: {
        activityLog: task.activityLog || [],
      },
    });
  } catch (e) {
    console.error('Error fetching activity log: ', e);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
