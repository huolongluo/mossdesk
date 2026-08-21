import { NextResponse } from "next/server";
import { getDeployedAddress } from "@/lib/deployment";
import { getJob } from "@/lib/store";
import {
  buildInvoiceParams,
  explorerAddress,
  explorerTx,
  formatOkb,
  INVOICE_ABI,
  XLAYER_TESTNET_ID,
  xLayerTestnet,
} from "@/lib/chain";
import { publicXLayer } from "@/lib/xlayer";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const job = await getJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const params = job.payment.chain || buildInvoiceParams(job);
  const address = await getDeployedAddress();
  let onchainId = job.payment.chain?.invoiceId || "0";
  if (address) {
    try {
      const idOnChain = await publicXLayer().readContract({
        address,
        abi: INVOICE_ABI,
        functionName: "invoiceIdByJob",
        args: [params.jobIdBytes32],
      });
      if (idOnChain > BigInt(0)) {
        onchainId = idOnChain.toString();
        const invoice = await publicXLayer().readContract({
          address,
          abi: INVOICE_ABI,
          functionName: "getInvoice",
          args: [idOnChain],
        });
        const paidAt =
          typeof invoice === "object" && invoice !== null && "paidAt" in invoice
            ? (invoice as { paidAt: bigint }).paidAt
            : BigInt(0);
        if (paidAt && BigInt(paidAt) > BigInt(0)) {
          job.payment.chain = {
            ...params,
            ...job.payment.chain,
            status: "settled",
            invoiceId: onchainId,
          };
        }
      }
    } catch {
      /* RPC optional */
    }
  }

  return NextResponse.json({
    ready: Boolean(address),
    chainId: XLAYER_TESTNET_ID,
    chainName: xLayerTestnet.name,
    rpcUrl: xLayerTestnet.rpcUrls.default.http[0],
    explorer: xLayerTestnet.blockExplorers.default.url,
    contract: address,
    contractExplorer: address ? explorerAddress(address) : null,
    amountUsd: job.payment.amountUsd,
    amountOkb: formatOkb(params.amountWei),
    alreadyIssued: onchainId !== "0",
    invoiceId: onchainId === "0" ? null : onchainId,
    issueTx: job.payment.chain?.issueTxHash
      ? explorerTx(job.payment.chain.issueTxHash)
      : null,
    settled: job.payment.chain?.status === "settled",
    settleTx: job.payment.chain?.settleTxHash
      ? explorerTx(job.payment.chain.settleTxHash)
      : null,
    params,
  });
}
