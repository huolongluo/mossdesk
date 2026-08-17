import { NextResponse } from "next/server";
import { GEMINI_MODEL, hasGeminiKey, hasStripe, isVertex } from "@/lib/config";
import { opsSnapshot } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const snap = await opsSnapshot();
  return NextResponse.json({
    ok: true,
    gemini: hasGeminiKey(),
    vertex: isVertex(),
    model: GEMINI_MODEL,
    stripe: hasStripe(),
    jobs: snap.jobs,
    decisions: snap.decisions,
    revenueUsd: snap.revenueUsd,
  });
}
