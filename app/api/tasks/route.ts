import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "Hello world! reached tasks route" });
}

export async function POST() {
    return NextResponse.json({ message: "Create a Task" });
}