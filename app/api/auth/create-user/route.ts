import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const { uid, email, name } = await req.json();

    const userRef = db.collection("users").doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        name,
        email,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}