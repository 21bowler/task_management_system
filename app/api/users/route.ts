import {NextResponse}  from "next/server";

export async function GET(){
    return NextResponse.json({message: "all users fetched"})
}

export async function POST(){
    return NextResponse.json({message: "all users created"})
}
