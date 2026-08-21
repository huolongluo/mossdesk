"use client";

import type { EIP1193Provider } from "viem";

type Injected = EIP1193Provider & {
  isOkxWallet?: boolean;
  isMetaMask?: boolean;
  providers?: Injected[];
};

function asProvider(value: unknown): Injected | null {
  if (!value || typeof value !== "object") return null;
  if (!("request" in value) || typeof (value as Injected).request !== "function") {
    return null;
  }
  return value as Injected;
}

function pickPreferred(candidates: Injected[]): Injected | null {
  if (candidates.length === 0) return null;
  return (
    candidates.find((p) => p.isOkxWallet) ||
    candidates.find((p) => p.isMetaMask) ||
    candidates[0]
  );
}

export function getInjectedProvider(): EIP1193Provider | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    okxwallet?: Injected;
    ethereum?: Injected;
  };

  const candidates: Injected[] = [];
  const okx = asProvider(w.okxwallet);
  if (okx) candidates.push(okx);

  const eth = asProvider(w.ethereum);
  if (eth) {
    if (Array.isArray(eth.providers) && eth.providers.length > 0) {
      for (const p of eth.providers) {
        const injected = asProvider(p);
        if (injected) candidates.push(injected);
      }
    } else {
      candidates.push(eth);
    }
  }

  return pickPreferred(candidates);
}

export const WALLET_MISSING =
  "No injected wallet on this page. Unlock OKX Wallet (or MetaMask), pin the extension, then refresh. OKX Wallet is preferred for X Layer.";

/** Send a tx with gas already filled so OKX does not need to estimate. */
export async function sendPreparedTx(
  eth: EIP1193Provider,
  tx: {
    from: `0x${string}`;
    to?: `0x${string}`;
    data: `0x${string}`;
    value?: `0x${string}`;
    gas: `0x${string}`;
    gasPrice: `0x${string}`;
  },
): Promise<`0x${string}`}> {
  const params: Record<string, string> = {
    from: tx.from,
    data: tx.data,
    value: tx.value ?? "0x0",
    gas: tx.gas,
    gasPrice: tx.gasPrice,
  };
  if (tx.to) params.to = tx.to;
  const hash = await eth.request({
    method: "eth_sendTransaction",
    params: [params],
  });
  if (typeof hash !== "string" || !hash.startsWith("0x")) {
    throw new Error("Wallet did not return a transaction hash.");
  }
  return hash as `0x${string}`;
}
