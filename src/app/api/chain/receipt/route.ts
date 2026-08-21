import { NextResponse } from "next/server";
import { publicXLayer } from "@/lib/xlayer";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const hash = new URL(request.url).searchParams.get("hash")?.trim();
  if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return NextResponse.json({ error: "hash required" }, { status: 400 });
  }
  const receipt = await publicXLayer().getTransactionReceipt({
    hash: hash as `0x${string}`,
  }).catch(() => null);
  if (!receipt) {
    return NextResponse.json({ ready: false });
  }
  return NextResponse.json({
    ready: true,
    status: receipt.status,
    contractAddress: receipt.contractAddress,
  });
}
