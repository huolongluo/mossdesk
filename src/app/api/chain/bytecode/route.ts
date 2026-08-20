import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  const artifactPath = path.join(process.cwd(), "contracts/out/MossDeskInvoice.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
    abi: unknown;
    bytecode: `0x${string}`;
    contractName: string;
  };
  return NextResponse.json({
    contractName: artifact.contractName,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    chainId: 1952,
  });
}
