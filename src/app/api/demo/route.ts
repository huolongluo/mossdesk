import { NextResponse } from "next/server";
import { runFirm } from "@/lib/agents";
import { hasGeminiKey } from "@/lib/config";
import { createJob } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  if (!hasGeminiKey()) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is missing. Add it to .env.local before running the live demo.",
      },
      { status: 503 },
    );
  }

  const job = await createJob({
    customer: {
      name: "Mei Chen",
      email: "mei@jingxiubakery.example",
      businessName: "Jingxiu Bakery",
      industry: "Cafe / bakery / restaurant",
      location: "Chengdu, Jingxiu Road",
    },
    problem:
      "We cater office breakfasts but half the invoices sit unpaid for 3 weeks. I chase on WeChat at midnight and still feel rude. Need a polite collection sequence and a rule for when to stop cooking for non-payers.",
    constraints: "Staff of 2, no discounts, Chinese and English customers",
  });

  const updated = await runFirm(job);
  return NextResponse.json(updated);
}
