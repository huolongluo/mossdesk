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
      <p className="kicker">Collector · X Layer</p>
      <h1>Pay the invoice the agent minted.</h1>
      <p className="lede">
        Price was set by the Pricer. The receivable lives on X Layer testnet.
        Humans do not re-quote at checkout — you settle in OKB.
      </p>
      <PayPanel job={job} />
    </section>
  );
}
