// app/api/auth/session/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("SESSION API HIT:", body);

    // For now just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Session creation failed" },
      { status: 500 }
    );
  }
}