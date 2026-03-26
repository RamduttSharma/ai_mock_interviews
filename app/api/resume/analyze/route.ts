import { NextRequest, NextResponse } from "next/server";
import { generateInterview } from "@/lib/generateInterview";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // ✅ Convert file → base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    // 🔥 Gemini API call
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an AI interviewer system.

From this resume:
1. Detect MOST LIKELY ROLE
2. Estimate experience level (entry/intermediate/senior)
3. Extract primary tech stack (array)
4. Choose interview type (technical/behavioral/mixed)
5. Decide number of questions (5–15)

Return STRICT JSON ONLY (no markdown, no text):
{
  "role": "",
  "level": "",
  "techstack": [],
  "type": "",
  "amount": number
}
                  `,
                },
                {
                  inline_data: {
                    mime_type: file.type,
                    data: base64,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const raw = await geminiRes.text();
    console.log("Gemini RAW:", raw);

    // ❌ Handle Gemini error
    if (raw.includes('"error"')) {
      throw new Error("Gemini API failed");
    }

    // ✅ Clean markdown if exists
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // ✅ Extract JSON safely
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Invalid Gemini response");
    }

    const aiData = JSON.parse(match[0]);

    // ✅ Safe defaults (important)
    const role = aiData?.role || "frontend developer";
    const level = aiData?.level || "intermediate";
    const techstack = Array.isArray(aiData?.techstack)
      ? aiData.techstack
      : ["react"];
    
    // normalize type
    const typeRaw = aiData?.type?.toLowerCase() || "";
    const type = typeRaw.includes("technical")
      ? "technical"
      : typeRaw.includes("behavior")
      ? "behavioral"
      : "mixed";

    const amount = aiData?.amount || 5;

    // 🔥 Generate interview directly (NO fetch)
    const interviewId = await generateInterview({
      role,
      level,
      techstack,
      type,
      amount,
      userid: userId,
    });

    return NextResponse.json({
      success: true,
      interviewId,
      extracted: { role, level, techstack, type, amount },
    });

  } catch (err: any) {
    console.error("❌ ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}