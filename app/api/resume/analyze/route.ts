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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
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

Return STRICT JSON ONLY (no markdown, no explanation):
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

        const result = await geminiRes.json();
        console.log("Gemini FULL RESPONSE:", result);

        // ✅ Extract actual text output
        const text =
            result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Gemini returned empty response");
        }

        // ✅ Clean markdown if exists
        const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        // ✅ Parse JSON
        let aiData;
        try {
            aiData = JSON.parse(cleaned);
        } catch (err) {
            console.error("❌ JSON PARSE FAILED:", cleaned);
            throw new Error("Invalid JSON from Gemini");
        }

        console.log("✅ AI DATA:", aiData);

        // ✅ Extract safely (NO unnecessary fallback override)
        const role = aiData?.role;
        const level = aiData?.level;
        const techstack = aiData?.techstack;
        const typeRaw = aiData?.type;
        const amount = aiData?.amount;

        // 🚨 VALIDATION (important)
        if (!role || !level || !techstack) {
            throw new Error("AI extraction failed — missing fields");
        }

        // normalize type
        const type = typeRaw?.toLowerCase().includes("technical")
            ? "technical"
            : typeRaw?.toLowerCase().includes("behavior")
                ? "behavioral"
                : "mixed";

        // 🔥 Generate interview
        const interviewId = await generateInterview({
            role,
            level,
            techstack,
            type,
            amount: amount || 5,
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