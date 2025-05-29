import { NextRequest, NextResponse } from 'next/server';
import Task from '@/models/task.model';

// Gets a single task by its ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> },
) {
    try {
        const {taskId} = await params;

        const task = await Task.findOne({ _id: taskId })
        if (!task) {
            return NextResponse.json({
                success: false,
                message: "Task not found"
            }, {
                status: 404
            })
        }
        // e.g., Query a database for user with ID `id`
        return NextResponse.json({
            success: true,
            message: "Task successfully fetched",
            data: {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                tags: task.tags
            }
        });
    } catch (e) {
        console.error("Error fetching tasks: ", e)
        NextResponse.json({
            success: false,
            error: "Internal Server Error"
        }, {status: 500})
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> },
) {
   try {
       const { taskId } = await params;

       await Task.findByIdAndDelete(taskId)

       // send response
       return NextResponse.json({
           success: true,
           message: "Task deleted successfully."
       })
   } catch (e) {
       console.error("Error deleting Task: ", e)

       NextResponse.json({
           success: false,
           error: "Internal Server Error"
       }, { status: 500 })
   }
}