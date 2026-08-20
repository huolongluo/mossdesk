import { NextResponse } from "next/server";
import { getDeployedAddress, saveDeployment } from "@/lib/deployment";
import { explorerAddress, XLAYER_TESTNET_ID } from "@/lib/chain";
import { publicXLayer } from "@/lib/xlayer";

export const runtime = "nodejs";

export async function GET() {
  const address = await getDeployedAddress();
  return NextResponse.json({
    ready: Boolean(address),
    chainId: XLAYER_TESTNET_ID,
    address,
    explorer: address ? explorerAddress(address) : null,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    address?: string;
    txHash?: string;
    deployer?: string;
  };
  const address = body.address?.trim();
  const txHash = body.txHash?.trim();
  const deployer = body.deployer?.trim();
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }
  if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    return NextResponse.json({ error: "txHash required" }, { status: 400 });
  }

  const existing = await getDeployedAddress();
  if (existing && existing.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json(
      { error: "A contract is already registered for this desk.", address: existing },
      { status: 409 },
    );
  }

  try {
    const receipt = await publicXLayer().waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
      timeout: 120_000,
    });
    if (receipt.status !== "success") {
      return NextResponse.json({ error: "Deploy transaction reverted" }, { status: 400 });
    }
    if (receipt.contractAddress?.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: "txHash did not create that contract address" },
        { status: 400 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not verify deploy tx" },
      { status: 400 },
    );
  }

  const record = {
    network: "xlayer-testnet" as const,
    chainId: 1952 as const,
    address: address as `0x${string}`,
    txHash: txHash as `0x${string}`,
    deployer: (deployer as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    deployedAt: new Date().toISOString(),
  };
  await saveDeployment(record);
  return NextResponse.json({
    ok: true,
    ...record,
    explorer: explorerAddress(address),
  });
}
