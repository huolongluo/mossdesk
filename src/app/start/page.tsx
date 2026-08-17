import { StartForm } from "@/components/StartForm";

export default function StartPage() {
  return (
    <section className="section narrow">
      <p className="kicker">New job</p>
      <h1>Tell the firm the mess.</h1>
      <p className="lede">
        Scout, Pricer, Operator, Collector, and Auditor will run in sequence.
        You will see every decision land in the log — including the price they
        choose to charge you.
      </p>
      <StartForm />
    </section>
  );
}
