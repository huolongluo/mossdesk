import { NextResponse } from "next/server";
import { opsSnapshot } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const snap = await opsSnapshot();
  return NextResponse.json(snap);
}
