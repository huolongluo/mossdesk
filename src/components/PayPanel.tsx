"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { encodeFunctionData, type EIP1193Provider, type Hex } from "viem";
import type { Job } from "@/lib/types";
import { INVOICE_ABI } from "@/lib/chain";
import { getInjectedProvider, sendPreparedTx, WALLET_MISSING } from "@/lib/wallet";

type InvoicePayload = {
  ready: boolean;
  chainId: number;
  chainName: string;
  rpcUrl: string;
  explorer: string;
  contract: Hex | null;
  contractExplorer: string | null;
  amountUsd: number;
  amountOkb: string;
  alreadyIssued: boolean;
  invoiceId: string | null;
  issueTx: string | null;
  settled: boolean;
  settleTx: string | null;
  params: {
    jobIdBytes32: Hex;
    amountWei: string;
    memo: string;
    tapeHash: Hex;
  };
};

export function PayPanel({ job }: { job: Job }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoicePayload | null>(null);
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    fetch(`/api/jobs/${job.id}/invoice`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setInvoice)
      .catch((err) => setError(err instanceof Error ? err.message : "Invoice load failed"));
  }, [job.id]);

  const explorerTx = useMemo(() => {
    if (!txHash || !invoice) return "";
    return `${invoice.explorer}/tx/${txHash}`;
  }, [txHash, invoice]);

  async function ensureChain(eth: EIP1193Provider, payload: InvoicePayload) {
    const hexId = `0x${payload.chainId.toString(16)}`;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexId }],
      });
    } catch (err) {
      const code = (err as { code?: number })?.code;
      if (code === 4902 || code === -32603) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexId,
              chainName: payload.chainName,
              nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
              rpcUrls: [payload.rpcUrl],
              blockExplorerUrls: [payload.explorer],
            },
          ],
        });
        return;
      }
      throw err;
    }
  }

  async function connect() {
    setError("");
    const eth = getInjectedProvider();
    if (!eth) {
      setError(WALLET_MISSING);
      return;
    }
    if (!invoice) return;
    await ensureChain(eth, invoice);
    const accounts = (await eth.request({
      method: "eth_requestAccounts",
    })) as string[];
    setAccount(accounts[0] || "");
  }

  async function payOnChain() {
    setError("");
    setBusy(true);
    try {
      const eth = getInjectedProvider();
      if (!eth) throw new Error(WALLET_MISSING);
      if (!invoice?.contract) throw new Error("Invoice contract is not deployed yet.");
      await ensureChain(eth, invoice);
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];
      const from = accounts[0];
      if (!from) throw new Error("Wallet returned no account.");
      setAccount(from);

      const value = BigInt(invoice.params.amountWei);
      const data = invoice.alreadyIssued && invoice.invoiceId
        ? encodeFunctionData({
            abi: INVOICE_ABI,
            functionName: "pay",
            args: [BigInt(invoice.invoiceId)],
          })
        : encodeFunctionData({
            abi: INVOICE_ABI,
            functionName: "issueAndPay",
            args: [
              invoice.params.jobIdBytes32,
              value,
              invoice.params.memo,
              invoice.params.tapeHash,
            ],
          });

      const feesRes = await fetch("/api/chain/fees", { cache: "no-store" });
      const fees = (await feesRes.json()) as {
        gasPrice?: Hex;
        callGas?: Hex;
      };
      if (!feesRes.ok || !fees.gasPrice) {
        throw new Error("Could not load X Layer gas price.");
      }

      const hash = await sendPreparedTx(eth, {
        from: from as Hex,
        to: invoice.contract,
        data,
        value: `0x${value.toString(16)}`,
        gas: fees.callGas || "0x7a120",
        gasPrice: fees.gasPrice,
      });
      setTxHash(hash);

      const settle = await fetch(`/api/jobs/${job.id}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: hash }),
      });
      const settled = await settle.json();
      if (!settle.ok) throw new Error(settled.error || "On-chain verify failed");
      router.push(`/job/${job.id}?paid=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "X Layer payment failed");
      setBusy(false);
    }
  }

  async function checkout(demo = false) {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      router.push(`/job/${job.id}?paid=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  }

  if (job.payment.status === "paid" || invoice?.settled) {
    return (
      <div className="card">
        <h3>Settled on X Layer</h3>
        <p>Invoice paid. The receivable is extinguished on-chain.</p>
        {invoice?.settleTx ? (
          <p>
            <a href={invoice.settleTx} target="_blank" rel="noreferrer">
              View settlement ↗
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="card">
      <p className="kicker">X Layer testnet · AI-RWA</p>
      <h3>
        Invoice · ${job.payment.amountUsd} · {job.collection?.terms || "due_on_delivery"}
      </h3>
      <p>{job.collection?.invoiceMemo || job.deliverable?.playbookTitle}</p>
      <p className="muted">
        Pricer bound the USD price. Collector bound this as a trade receivable.
        You settle in OKB on X Layer. Humans do not re-quote.
      </p>
      {invoice ? (
        <div className="chain-meta">
          <p>
            <span className="pill">X Layer {invoice.chainId}</span>{" "}
            <strong>{invoice.amountOkb}</strong>
          </p>
          <p className="mono muted">
            {invoice.contract
              ? `contract ${invoice.contract}`
              : "No invoice contract yet."}
          </p>
          {!invoice.contract ? (
            <p>
              <a href="/xlayer">Deploy MossDeskInvoice on X Layer first →</a>
            </p>
          ) : null}
          {invoice.contractExplorer ? (
            <p>
              <a href={invoice.contractExplorer} target="_blank" rel="noreferrer">
                Open contract on explorer ↗
              </a>
            </p>
          ) : null}
        </div>
      ) : (
        <p className="muted">Loading invoice from X Layer…</p>
      )}
      <div className="hero-cta">
        <button className="btn-ghost" disabled={busy} onClick={connect} type="button">
          {account ? `Connected ${account.slice(0, 6)}…${account.slice(-4)}` : "Connect wallet"}
        </button>
        <button
          className="btn-gold"
          disabled={busy || !invoice?.contract}
          onClick={payOnChain}
          type="button"
        >
          {busy ? "Waiting for X Layer…" : "Pay with OKB on X Layer"}
        </button>
      </div>
      {txHash ? (
        <p className="mono">
          tx {txHash}{" "}
          {explorerTx ? (
            <a href={explorerTx} target="_blank" rel="noreferrer">
              explorer ↗
            </a>
          ) : null}
        </p>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
      <p className="muted" style={{ marginTop: 16 }}>
        Need testnet OKB?{" "}
        <a href="https://web3.okx.com/xlayer/faucet" target="_blank" rel="noreferrer">
          X Layer faucet
        </a>
        . Fallback Stripe / demo marker is only for wallets that cannot switch chain.
      </p>
      <div className="hero-cta">
        <button className="btn-ghost" disabled={busy} onClick={() => checkout(false)} type="button">
          Pay with Stripe instead
        </button>
        <button className="btn-ghost" disabled={busy} onClick={() => checkout(true)} type="button">
          Record demo payment (not on-chain)
        </button>
      </div>
    </div>
  );
}
