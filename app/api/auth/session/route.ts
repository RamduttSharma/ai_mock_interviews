import { NextResponse } from "next/server";
import { auth } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    // 🔥 Create session cookie from Firebase
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 5 days

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ success: true });

    // 🔥 Set REAL Firebase session cookie
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return response;
  } catch (error) {
    console.log("SESSION ERROR:", error);
    return NextResponse.json(
      { error: "Session creation failed" },
      { status: 500 }
    );
  }
}