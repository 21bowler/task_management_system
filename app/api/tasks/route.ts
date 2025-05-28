import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/task.model';

export async function GET() {
  try {
    await dbConnect();

    // Fetch all tasks from DB
    const tasks = await Task.find({});

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
