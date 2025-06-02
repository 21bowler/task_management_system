import { NextRequest, NextResponse } from 'next/server';
import Task from '@/models/task.model';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// route --> /api/tasks/:taskId/comments

//Add comment to a task
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
    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          message: 'Comment content is required and cannot be empty.',
        },
        { status: 400 },
      );
    }

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

    // Add new comment
    const newComment = {
      content,
      createdBy: session.user.id,
      createdAt: new Date(),
    };

    // add the new comment
    task.comments = [...(task.comments || []), newComment];

    //log the activity
    task.activityLog.push({
      action: 'commented',
      performedBy: session.user.id,
      timestamp: new Date(),
      details: `Commented on task: ${task.title}`,
    });

    await task.save();

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: newComment,
      },
    });
  } catch (e) {
    console.error('Error adding comment: ', e);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}

// Get all comments for the specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;

    const task = await Task.findById(taskId)
      .populate('comments.createdBy', 'name email')
      .select('comments');

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: 'Task not found',
        },
        { status: 404 },
      );
    }

    //send response
    return NextResponse.json({
      success: true,
      message: 'Comments fetched successfully.',
      data: {
        comments: task.comments || [],
      },
    });
  } catch (e) {
    console.error('Error fetching comments: ', e);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
