import { NextResponse } from "next/server";
import { runFirm } from "@/lib/agents";
import { hasGeminiKey } from "@/lib/config";
import { getJob } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const job = await getJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.status === "running") {
    return NextResponse.json(job);
  }
  if (!hasGeminiKey()) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is missing. Add it to .env.local (AI Studio) or set GEMINI_PROVIDER=vertex with GOOGLE_CLOUD_PROJECT.",
      },
      { status: 503 },
    );
  }
  const updated = await runFirm(job);
  return NextResponse.json(updated);
}
