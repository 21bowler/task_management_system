import { NextRequest, NextResponse } from 'next/server';
import Task from '@/models/task.model';

// Gets a single task by its ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;

    const task = await Task.findOne({ _id: taskId })
      .populate('assignedTo', 'name email')
      .populate('sharedWith', 'name email')
      .populate('comments.createdBy', 'name email')
      .populate('activityLog.performedBy', 'name email')
      .populate('createdBy', 'name email');

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

    //destructure task object for cleaner code
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      assignedTo,
      sharedWith,
      comments,
      activityLog,
      createdBy,
    } = task;

    // e.g., Query a database for user with ID `id`
    return NextResponse.json({
      success: true,
      message: 'Task successfully fetched',
      data: {
        title: title,
        description: description,
        status: status,
        priority: priority,
        dueDate: dueDate,
        tags: tags,
        assignedTo: assignedTo,
        sharedWith: sharedWith,
        comments: comments,
        activityLog: activityLog,
        createdBy: createdBy,
      },
    });
  } catch (e) {
    console.error('Error fetching tasks: ', e);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;

    await Task.findByIdAndDelete(taskId);

    // send response
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (e) {
    console.error('Error deleting Task: ', e);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}

// Updating Task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;

    const data = await request.json();

    const updateTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!updateTask) {
      return NextResponse.json(
        {
          success: false,
          message: 'Task not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        title: updateTask.title,
        description: updateTask.description,
        status: updateTask.status,
        priority: updateTask.priority,
        dueDate: updateTask.dueDate,
        tags: updateTask.tags,
      },
    });
  } catch (e) {
    console.error('Error updating Task: ', e);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
