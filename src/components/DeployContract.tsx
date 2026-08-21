"use client";

import { useEffect, useState } from "react";
import { createWalletClient, custom } from "viem";
import { XLAYER_TESTNET_ID } from "@/lib/chain";

import { getInjectedProvider, WALLET_MISSING } from "@/lib/wallet";

export function DeployContract() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [registered, setRegistered] = useState("");

  useEffect(() => {
    fetch("/api/chain", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.address) setRegistered(d.address);
      })
      .catch(() => undefined);
  }, []);

  async function deploy() {
    setError("");
    setBusy(true);
    try {
      const eth = getInjectedProvider();
      if (!eth) throw new Error(WALLET_MISSING);

      const bytecodeRes = await fetch("/api/chain/bytecode");
      const artifact = await bytecodeRes.json();
      if (!bytecodeRes.ok) throw new Error("Could not load contract bytecode.");

      const chainId = `0x${XLAYER_TESTNET_ID.toString(16)}`;
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
      } catch {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId,
              chainName: "X Layer Testnet",
              nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
              rpcUrls: ["https://testrpc.xlayer.tech/terigon"],
              blockExplorerUrls: [
                "https://www.okx.com/web3/explorer/xlayer-test",
              ],
            },
          ],
        });
      }

      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];
      const from = accounts[0] as `0x${string}`;
      if (!from) throw new Error("No account.");

      const wallet = createWalletClient({
        transport: custom(eth),
      });
      const hash = await wallet.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        account: from,
        chain: {
          id: XLAYER_TESTNET_ID,
          name: "X Layer Testnet",
          nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
          rpcUrls: { default: { http: ["https://testrpc.xlayer.tech/terigon"] } },
        },
      });
      setResult(hash);

      let address = "";
      for (let i = 0; i < 40; i++) {
        const receipt = (await eth.request({
          method: "eth_getTransactionReceipt",
          params: [hash],
        })) as { contractAddress?: string } | null;
        if (receipt?.contractAddress) {
          address = receipt.contractAddress;
          break;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      if (!address) throw new Error("Deploy sent, but no contract address yet. Check explorer.");

      const saved = await fetch("/api/chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, txHash: hash, deployer: from }),
      });
      const data = await saved.json();
      if (!saved.ok) throw new Error(data.error || "Register failed");
      setRegistered(data.address);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deploy failed");
      setBusy(false);
    }
  }

  if (registered) {
    return (
      <p className="mono">
        Live contract {registered}
      </p>
    );
  }

  return (
    <div>
      <button className="btn-gold" type="button" disabled={busy} onClick={deploy}>
        {busy ? "Deploying on X Layer…" : "Deploy MossDeskInvoice with my wallet"}
      </button>
      <p className="muted" style={{ marginTop: 8 }}>
        Needs a little testnet OKB from the{" "}
        <a href="https://web3.okx.com/xlayer/faucet" target="_blank" rel="noreferrer">
          faucet
        </a>
        . One deploy is enough for the whole desk.
      </p>
      {result ? <p className="mono">tx {result}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
