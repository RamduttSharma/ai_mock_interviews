import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function generateInterview(data: {
    role: string;
    type: string;
    level: string;
    techstack: string[] | string;
    amount: number;
    userid: string;
}) {
    const { role, type, level, techstack, amount, userid } = data;

    const { text: questions } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `Prepare two liner questions for a job interview.
        Role: ${role}
        Level: ${level}
        Techstack: ${techstack}
        Type: ${type}
        Number of questions: ${amount}
        Return JSON array only.`,
    });

    const cleanedQuestions = questions
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsedQuestions = JSON.parse(cleanedQuestions);

    const interview = {
        role,
        type,
        level,
        techstack: Array.isArray(techstack)
            ? techstack
            : techstack.split(","),
        questions: parsedQuestions,
        userId: userid,
        finalized: true,
        coverImage: getRandomInterviewCover(),
        createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);

    return docRef.id;
} 