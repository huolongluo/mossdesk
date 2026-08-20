import Link from "next/link";
import { DemoButton } from "@/components/DemoButton";
import { getDeployedAddress } from "@/lib/deployment";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const contract = await getDeployedAddress();
  return (
    <>
      <section className="hero">
        <p className="kicker">Build X · AI Season · AI-RWA on X Layer</p>
        <h1>Gemini agents that mint invoices on-chain.</h1>
        <p className="lede">
          MossDesk is a professional firm run by five Gemini agents. They take
          a shop&apos;s mess, set a real price, ship a 7-day operating package,
          then mint that invoice as a trade receivable on X Layer and collect
          in OKB. Humans only handle exceptions.
        </p>
        <div className="hero-cta">
          <DemoButton />
          <Link href="/start" className="btn-solid">
            Hire with your own mess
          </Link>
          <Link href="/xlayer" className="btn-ghost">
            How the RWA works
          </Link>
        </div>
        {contract ? (
          <p className="mono muted" style={{ marginTop: 18 }}>
            X Layer testnet · {contract}
          </p>
        ) : (
          <p className="muted" style={{ marginTop: 18 }}>
            Contract deploy pending — the product loop still runs; settlement
            lights up once MossDeskInvoice is on chain 1952.
          </p>
        )}
      </section>

      <section className="section" id="how">
        <p className="kicker">The business</p>
        <h2>Local shops drown in follow-up. We settle the claim on X Layer.</h2>
        <p className="muted">
          Bakeries with unpaid catering invoices. Plumbers quoting over
          WhatsApp. Gyms with no-show leaks. They do not need another dashboard.
          They need someone who will decide what to say, what to charge, and a
          public receivable when it is time to collect.
        </p>
        <div className="flow">
          <article>
            <h3>01 · Intake</h3>
            <p>Owner describes the mess in plain language. Scout turns it into an operating picture.</p>
          </article>
          <article>
            <h3>02 · Price</h3>
            <p>Pricer sets a real USD price under policy. Decline if the job is legal or medical advice.</p>
          </article>
          <article>
            <h3>03 · Mint & collect</h3>
            <p>
              Auditor ships. Collector binds a receivable. Customer pays OKB on
              X Layer. InvoiceSettled is the receipt.
            </p>
          </article>
        </div>
      </section>

      <section className="section" id="agents">
        <p className="kicker">AI-native operations</p>
        <h2>Five agents. One on-chain receivable.</h2>
        <div className="grid-2">
          <div className="card">
            <h3>Scout</h3>
            <p>Who the customer is, the core pain, constraints, and risk flags. No work starts without this.</p>
          </div>
          <div className="card">
            <h3>Pricer</h3>
            <p>Takes or declines the job. Sets Desk Sprint vs retainer and a dollar amount between $29 and $249.</p>
          </div>
          <div className="card">
            <h3>Operator</h3>
            <p>Writes copy-paste scripts, a 7-day sequence, metrics, and risks. This is the product.</p>
          </div>
          <div className="card">
            <h3>Collector + Auditor</h3>
            <p>
              Terms, dunning, quality gate — then the decision tape is hashed
              into MossDeskInvoice on X Layer.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="rwa">
        <p className="kicker">AI-RWA</p>
        <h2>The invoice is the asset.</h2>
        <p className="lede">
          A receivable is a claim on cash for work already scoped. That is a
          real-world asset. MossDesk issues it when Gemini is done deciding,
          not when a founder fills a mint form. Judges can open the explorer,
          read InvoiceIssued / InvoiceSettled, and match the tapeHash back to
          the ops log.
        </p>
        <div className="hero-cta">
          <Link href="/start" className="btn-gold">
            Start with a messy WhatsApp thread
          </Link>
          <Link href="/ops" className="btn-ghost">
            Open the ops desk
          </Link>
        </div>
      </section>
    </>
  );
}
