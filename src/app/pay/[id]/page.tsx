import { notFound } from "next/navigation";
import { PayPanel } from "@/components/PayPanel";
import { getJob } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();
  return (
    <section className="section">
      <p className="kicker">Collector</p>
      <h1>Pay the invoice the agent wrote.</h1>
      <p className="lede">
        Price was set by the Pricer, terms by the Collector. Humans do not
        re-quote at checkout.
      </p>
      <PayPanel job={job} />
    </section>
  );
}
