import Link from "next/link";
import { DemoButton } from "@/components/DemoButton";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="kicker">Small Business Services · Gemini-operated firm</p>
        <h1>A front office that actually decides.</h1>
        <p className="lede">
          MossDesk is not a chatbot bolted onto a form. It is a professional
          firm run by five Gemini agents: they take the mess, set the price,
          write the operating package, invoice, and only wake a human when the
          auditor refuses to ship.
        </p>
        <div className="hero-cta">
          <DemoButton />
          <Link href="/start" className="btn-solid">
            Hire with your own mess
          </Link>
          <Link href="/ops" className="btn-ghost">
            Open the ops desk
          </Link>
        </div>
      </section>

      <section className="section" id="how">
        <p className="kicker">The business</p>
        <h2>Local shops drown in follow-up. We sell the missing operator.</h2>
        <p className="muted">
          Bakeries with unpaid catering invoices. Plumbers quoting over
          WhatsApp. Gyms with no-show leaks. They do not need another dashboard.
          They need someone who will decide what to say, what to charge, and
          what happens on day 3 if nobody replies.
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
            <h3>03 · Deliver & collect</h3>
            <p>Operator ships a 7-day playbook. Collector invoices. Auditor ships or escalates.</p>
          </article>
        </div>
      </section>

      <section className="section" id="agents">
        <p className="kicker">AI-native operations</p>
        <h2>Five agents. Five binding decisions.</h2>
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
            <p>Payment terms and dunning are decided, then a quality gate: SHIP, ESCALATE, or REJECT.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="kicker">Category impact</p>
        <h2>Every local business gets an operator, not a prompt box.</h2>
        <p className="lede">
          Professional services used to mean a consultant at $200/hour who
          disappears after the slide deck. MossDesk productizes that operator
          into a priced job with an audit trail — so a two-person shop can buy
          the same discipline a bigger firm takes for granted.
        </p>
        <div className="hero-cta">
          <Link href="/start" className="btn-gold">
            Start with a messy WhatsApp thread
          </Link>
        </div>
      </section>
    </>
  );
}
