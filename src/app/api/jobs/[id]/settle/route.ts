import { NextResponse } from "next/server";
import { getJob, saveJob } from "@/lib/store";
import { verifySettlement } from "@/lib/xlayer";
import type { Hex } from "viem";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const job = await getJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.payment.status === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true, job });
  }

  const body = (await request.json().catch(() => ({}))) as { txHash?: string };
  const txHash = body.txHash?.trim();
  if (!txHash || !txHash.startsWith("0x") || txHash.length !== 66) {
    return NextResponse.json({ error: "txHash required" }, { status: 400 });
  }

  try {
    const settled = await verifySettlement(txHash as Hex, job.id);
    job.payment.status = "paid";
    job.payment.paidAt = new Date().toISOString();
    job.status = "paid";
    job.payment.chain = {
      ...(job.payment.chain || {
        jobIdBytes32: "0x",
        amountWei: settled.amountWei,
        memo: "",
        tapeHash: "0x",
        status: "settled",
      }),
      status: "settled",
      invoiceId: settled.invoiceId,
      settleTxHash: txHash as Hex,
      payer: settled.payer as `0x${string}`,
    };
    job.logs.push({
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      agent: "collector",
      decision: "SETTLED_ON_XLAYER",
      rationale: `Invoice #${settled.invoiceId} paid by ${settled.payer}`,
      payload: settled,
      model: "xlayer-1952",
      latencyMs: 0,
    });
    await saveJob(job);
    return NextResponse.json({ ok: true, settled, job });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Settlement verify failed" },
      { status: 400 },
    );
  }
}
