import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/task.model';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get session from next-auth
    const session = await getServerSession(authOptions);
    console.log('[SESSION LOGOUT] from Get all Tasks: ', session);

    // Return an error if the session is missing
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not Authenticated! Please login.',
        },
        { status: 401 },
      );
    }

    // Get filter parameter from URL
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Build filter query
    const filter: any = {
      $or: [
        { createdBy: session.user.id },
        { assignedTo: session.user.id },
        { sharedWith: session.user.id },
      ],
    };
    // add filters if they exist
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Fetch all tasks from DB
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('sharedWith', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    //send response
    return NextResponse.json(
      {
        success: true,
        message: 'Tasks fetched successfully',
        data: tasks,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error fetching all Tasks: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // get data from the form
    const body = await request.json();

    // Check for an existing task with the same title before creating
    const existingTask = await Task.findOne({ title: body.title });
    if (existingTask) {
      return NextResponse.json(
        {
          success: false,
          message: 'A task with this title already exists',
        },
        { status: 409 },
      ); // 409 Conflict is appropriate for duplicate resources
    }

    const newTask = await Task.create(body);

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (error) {
    console.error('Error creating a Task: ', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
