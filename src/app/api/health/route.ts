import { NextResponse } from "next/server";
import { GEMINI_MODEL, hasGeminiKey, hasStripe, isVertex } from "@/lib/config";
import { getDeployedAddress } from "@/lib/deployment";
import { opsSnapshot } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const snap = await opsSnapshot();
  const invoice = await getDeployedAddress();
  return NextResponse.json({
    ok: true,
    gemini: hasGeminiKey(),
    vertex: isVertex(),
    model: GEMINI_MODEL,
    stripe: hasStripe(),
    xlayer: Boolean(invoice),
    invoice,
    chainId: 1952,
    jobs: snap.jobs,
    decisions: snap.decisions,
    revenueUsd: snap.revenueUsd,
    onchainSettled: snap.onchainSettled,
  });
}
