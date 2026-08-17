import { NextResponse } from "next/server";
import { listJobs, opsSnapshot } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const snap = await opsSnapshot();
  const jobs = await listJobs();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    snapshot: {
      jobs: snap.jobs,
      decisions: snap.decisions,
      shipped: snap.shipped,
      escalated: snap.escalated,
      revenueUsd: snap.revenueUsd,
      demoUsd: snap.demoUsd,
    },
    tape: jobs.flatMap((job) =>
      job.logs.map((log) => ({
        jobId: job.id,
        business: job.customer.businessName,
        agent: log.agent,
        decision: log.decision,
        rationale: log.rationale,
        model: log.model,
        latencyMs: log.latencyMs,
        at: log.at,
      })),
    ),
  });
}
