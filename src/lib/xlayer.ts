import "server-only";

import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  http,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getDeployedAddress } from "@/lib/deployment";
import {
  INVOICE_ABI,
  jobIdBytes32,
  xLayerTestnet,
  type InvoiceParams,
} from "@/lib/chain";

export * from "@/lib/chain";

function rpcUrl() {
  return (
    process.env.XLAYER_RPC_URL?.trim() ||
    xLayerTestnet.rpcUrls.default.http[0]
  );
}

export function publicXLayer() {
  return createPublicClient({
    chain: xLayerTestnet,
    transport: http(rpcUrl()),
  });
}

export function hasRelayer() {
  return Boolean(process.env.XLAYER_PRIVATE_KEY?.trim());
}

export async function issueInvoiceOnChain(params: InvoiceParams): Promise<{
  invoiceId: string;
  txHash: Hex;
} | null> {
  const key = process.env.XLAYER_PRIVATE_KEY?.trim();
  const address = await getDeployedAddress();
  if (!key || !address) return null;

  const account = privateKeyToAccount(
    (key.startsWith("0x") ? key : `0x${key}`) as Hex,
  );
  const wallet = createWalletClient({
    account,
    chain: xLayerTestnet,
    transport: http(rpcUrl()),
  });
  const publicClient = publicXLayer();

  const existing = await publicClient.readContract({
    address,
    abi: INVOICE_ABI,
    functionName: "invoiceIdByJob",
    args: [params.jobIdBytes32],
  });
  if (existing > BigInt(0)) {
    return { invoiceId: existing.toString(), txHash: "0x" as Hex };
  }

  const hash = await wallet.writeContract({
    address,
    abi: INVOICE_ABI,
    functionName: "issue",
    args: [
      params.jobIdBytes32,
      BigInt(params.amountWei),
      params.memo,
      params.tapeHash,
    ],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  let invoiceId = "0";
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: INVOICE_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "InvoiceIssued") {
        invoiceId = (decoded.args.id as bigint).toString();
      }
    } catch {
      /* skip unrelated logs */
    }
  }
  return { invoiceId, txHash: hash };
}

export async function verifySettlement(txHash: Hex, jobId: string) {
  const address = await getDeployedAddress();
  if (!address) throw new Error("Invoice contract is not configured.");
  const publicClient = publicXLayer();
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    timeout: 120_000,
  });
  if (receipt.status !== "success") {
    throw new Error("Transaction reverted on X Layer.");
  }
  if (receipt.to?.toLowerCase() !== address.toLowerCase()) {
    throw new Error("Transaction did not hit the MossDesk invoice contract.");
  }
  const expected = jobIdBytes32(jobId).toLowerCase();
  let matched = false;
  let invoiceId = "";
  let payer = "";
  let amountWei = "";
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: INVOICE_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName !== "InvoiceSettled") continue;
      const settledJob = (decoded.args.jobId as string).toLowerCase();
      if (settledJob !== expected) continue;
      matched = true;
      invoiceId = (decoded.args.id as bigint).toString();
      payer = decoded.args.payer as string;
      amountWei = (decoded.args.amountWei as bigint).toString();
    } catch {
      /* skip */
    }
  }
  if (!matched) {
    throw new Error("No InvoiceSettled event for this job on that transaction.");
  }
  return {
    invoiceId,
    payer,
    amountWei,
    blockNumber: receipt.blockNumber.toString(),
  };
}
