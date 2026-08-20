import { StartForm } from "@/components/StartForm";

export default function StartPage() {
  return (
    <section className="section narrow">
      <p className="kicker">New job</p>
      <h1>Tell the firm the mess.</h1>
      <p className="lede">
        Scout, Pricer, Operator, Collector, and Auditor will run in sequence.
        When they ship, the invoice is bound as an X Layer receivable you pay
        in OKB. You will see every decision — including the price they charge.
      </p>
      <StartForm />
    </section>
  );
}
