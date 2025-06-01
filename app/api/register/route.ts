import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import bcrypt from 'bcrypt';

/**
 * Endpoint for register --> /api/register
 * */

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: 'Please provide all required fields',
        },
        { status: 400 },
      );
    }

    // Check if the user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User already exists',
        },
        { status: 400 },
      );
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const user = await User.create({ name, email, password: hashedPassword });

    //return a response to the client
    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (e) {
    console.error('Error registering user: ', e);

    NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
