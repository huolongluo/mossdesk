import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { publicXLayer } from "@/lib/xlayer";

export const runtime = "nodejs";

function toHex(value: bigint): `0x${string}` {
  return `0x${value.toString(16)}`;
}

export async function GET() {
  const artifactPath = path.join(process.cwd(), "contracts/out/MossDeskInvoice.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
    abi: unknown;
    bytecode: `0x${string}`;
    contractName: string;
  };

  const client = publicXLayer();
  const [gasPrice, estimated] = await Promise.all([
    client.getGasPrice(),
    client
      .estimateGas({ data: artifact.bytecode })
      .catch(() => BigInt(800_000)),
  ]);
  const gas = (estimated * BigInt(13)) / BigInt(10);

  return NextResponse.json({
    contractName: artifact.contractName,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    chainId: 1952,
    gas: toHex(gas),
    gasPrice: toHex(gasPrice),
  });
}
