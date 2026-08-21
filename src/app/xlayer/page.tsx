import Link from "next/link";
import { DeployContract } from "@/components/DeployContract";
import { getDeployedAddress } from "@/lib/deployment";
import {
  explorerAddress,
  XLAYER_TESTNET_ID,
  xLayerTestnet,
} from "@/lib/chain";

export const dynamic = "force-dynamic";

export default async function XLayerPage() {
  const address = await getDeployedAddress();
  return (
    <section className="section">
      <p className="kicker">Build X · AI Season · AI-RWA</p>
      <h1>Invoices as on-chain receivables.</h1>
      <p className="lede">
        MossDesk does not bolt a chatbot onto a token. Gemini agents make the
        commercial decisions. X Layer is where those decisions become a public
        trade receivable — priced, hashed, and settled in OKB.
      </p>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <article className="card">
          <h3>What is the RWA?</h3>
          <p>
            A small-business invoice is the oldest real-world asset in commerce:
            a claim on cash for work already scoped. MossDesk tokenizes that
            claim at the moment the Auditor ships. The agent decision tape is
            hashed into the receivable so anyone can check <em>why</em> that
            amount exists.
          </p>
        </article>
        <article className="card">
          <h3>Why X Layer</h3>
          <p>
            EVM settlement, cheap OKB gas, OKX explorer for judges, and a path
            to mainnet after the testnet proof. Chain ID {XLAYER_TESTNET_ID}{" "}
            now; mainnet 196 after the hackathon as required.
          </p>
        </article>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Live testnet contract</h3>
        {address ? (
          <>
            <p className="mono">{address}</p>
            <p>
              <a href={explorerAddress(address)} target="_blank" rel="noreferrer">
                {xLayerTestnet.blockExplorers.default.name} ↗
              </a>
            </p>
          </>
        ) : (
          <DeployContract />
        )}
        <p className="muted">
          RPC {xLayerTestnet.rpcUrls.default.http[0]} · native OKB · pay() and
          issueAndPay() are the only state changes a customer makes.
        </p>
      </div>

      <div className="flow">
        <article>
          <h3>01 · Agents bind</h3>
          <p>Scout, Pricer, Operator, Collector, Auditor. Price is not a suggestion.</p>
        </article>
        <article>
          <h3>02 · Mint receivable</h3>
          <p>jobId, USD→OKB amount, memo, keccak of the decision tape.</p>
        </article>
        <article>
          <h3>03 · Settle in OKB</h3>
          <p>Customer wallet pays exact wei. InvoiceSettled is the receipt.</p>
        </article>
      </div>

      <div className="hero-cta">
        <Link href="/start" className="btn-gold">
          Dispatch a job and settle it
        </Link>
        <Link href="/pay/9f884843-be4d-4829-819e-bcaaa670c9eb" className="btn-ghost">
          Pay the bakery invoice
        </Link>
        <Link href="/ops" className="btn-ghost">
          Ops log
        </Link>
      </div>
    </section>
  );
}
