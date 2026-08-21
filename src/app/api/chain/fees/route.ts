import { NextResponse } from "next/server";
import { publicXLayer } from "@/lib/xlayer";

export const runtime = "nodejs";

function toHex(value: bigint): `0x${string}` {
  return `0x${value.toString(16)}`;
}

export async function GET() {
  const client = publicXLayer();
  const gasPrice = await client.getGasPrice();
  return NextResponse.json({
    gasPrice: toHex(gasPrice),
    deployGas: toHex(BigInt(1_200_000)),
    callGas: toHex(BigInt(500_000)),
  });
}
