import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import Task from '@/models/task.model';

export async function GET() {
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

    const categories = await Task.distinct('category');

    return NextResponse.json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (e) {
    console.error('Error fetching categories: ', e);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
