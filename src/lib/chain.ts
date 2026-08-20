import { formatEther, keccak256, toBytes, type Chain, type Hex } from "viem";
import type { Job } from "@/lib/types";

export const XLAYER_TESTNET_ID = 1952;
export const XLAYER_MAINNET_ID = 196;

export const xLayerTestnet = {
  id: XLAYER_TESTNET_ID,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_XLAYER_RPC_URL?.trim() ||
          "https://testrpc.xlayer.tech/terigon",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "OKX Explorer",
      url: "https://www.okx.com/web3/explorer/xlayer-test",
    },
  },
} as const satisfies Chain;

export const INVOICE_ABI = [
  {
    type: "function",
    name: "issue",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "bytes32" },
      { name: "amountWei", type: "uint96" },
      { name: "memo", type: "string" },
      { name: "tapeHash", type: "bytes32" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "pay",
    stateMutability: "payable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "issueAndPay",
    stateMutability: "payable",
    inputs: [
      { name: "jobId", type: "bytes32" },
      { name: "amountWei", type: "uint96" },
      { name: "memo", type: "string" },
      { name: "tapeHash", type: "bytes32" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "invoiceIdByJob",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "bytes32" }],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "getInvoice",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "jobId", type: "bytes32" },
          { name: "issuer", type: "address" },
          { name: "payer", type: "address" },
          { name: "amountWei", type: "uint96" },
          { name: "issuedAt", type: "uint64" },
          { name: "paidAt", type: "uint64" },
          { name: "memo", type: "string" },
          { name: "tapeHash", type: "bytes32" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "totalIssued",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "ASSET_CLASS",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "event",
    name: "InvoiceIssued",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "jobId", type: "bytes32", indexed: true },
      { name: "issuer", type: "address", indexed: true },
      { name: "amountWei", type: "uint96", indexed: false },
      { name: "tapeHash", type: "bytes32", indexed: false },
      { name: "memo", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "InvoiceSettled",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "jobId", type: "bytes32", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "amountWei", type: "uint96", indexed: false },
    ],
  },
] as const;

/** 0.0001 OKB per USD — faucet-friendly, still a real on-chain transfer. */
export const WEI_PER_USD = BigInt("100000000000000");

export function invoiceAddress(): `0x${string}` | null {
  const raw = process.env.NEXT_PUBLIC_XLAYER_INVOICE_ADDRESS?.trim();
  if (!raw || !raw.startsWith("0x") || raw.length !== 42) return null;
  return raw as `0x${string}`;
}

export function explorerTx(hash: string) {
  return `${xLayerTestnet.blockExplorers.default.url}/tx/${hash}`;
}

export function explorerAddress(address: string) {
  return `${xLayerTestnet.blockExplorers.default.url}/address/${address}`;
}

export function jobIdBytes32(jobId: string): Hex {
  return keccak256(toBytes(jobId));
}

export function tapeHashOf(job: Job): Hex {
  const tape = job.logs
    .map((l) => `${l.agent}:${l.decision}:${l.rationale}:${l.model}`)
    .join("|");
  return keccak256(toBytes(tape || job.id));
}

export function amountWeiForUsd(usd: number): bigint {
  const n = Math.max(1, Math.round(usd));
  return BigInt(n) * WEI_PER_USD;
}

export function formatOkb(wei: bigint | string) {
  return `${formatEther(typeof wei === "string" ? BigInt(wei) : wei)} OKB`;
}

export function invoiceMemo(job: Job) {
  const title = job.deliverable?.playbookTitle || "MossDesk Desk Sprint";
  return `${title} · ${job.customer.businessName} · $${job.payment.amountUsd}`;
}

export type InvoiceParams = {
  jobIdBytes32: Hex;
  amountWei: string;
  memo: string;
  tapeHash: Hex;
};

export function buildInvoiceParams(job: Job): InvoiceParams {
  return {
    jobIdBytes32: jobIdBytes32(job.id),
    amountWei: amountWeiForUsd(job.payment.amountUsd || 0).toString(),
    memo: invoiceMemo(job).slice(0, 240),
    tapeHash: tapeHashOf(job),
  };
}
