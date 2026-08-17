import { NextResponse } from "next/server";
import { z } from "zod";
import { createJob } from "@/lib/store";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(120),
  businessName: z.string().min(1).max(120),
  industry: z.string().min(1).max(80),
  location: z.string().min(1).max(80),
  problem: z.string().min(20).max(4000),
  constraints: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Tell us who you are and describe the mess in a few sentences." },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const industry = d.industry;
  const job = await createJob({
    customer: {
      name: d.name.trim(),
      email: d.email.trim().toLowerCase(),
      businessName: d.businessName.trim(),
      industry,
      location: d.location.trim(),
    },
    problem: d.problem.trim(),
    constraints: d.constraints?.trim() || "",
  });
  return NextResponse.json({ id: job.id });
}
