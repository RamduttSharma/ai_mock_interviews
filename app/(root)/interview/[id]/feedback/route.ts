// app/api/feedback/route.ts
import { createFeedback } from "@/lib/actions/general.action";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await createFeedback(body);

  return Response.json(result);
}