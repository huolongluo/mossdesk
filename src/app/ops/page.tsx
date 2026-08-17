import Link from "next/link";
import { opsSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function OpsPage() {
  const snap = await opsSnapshot();
  return (
    <section className="section">
      <p className="kicker">Production ops</p>
      <h1>The firm, as it actually ran.</h1>
      <p className="lede">
        Every Gemini decision is persisted. This is the evidence desk for
        judges: jobs, decisions, shipped work, escalations, and only Stripe
        `paid` counts as revenue.
      </p>
      <div className="grid-3">
        <div className="stat">
          <h3>{snap.jobs}</h3>
          <p className="muted">Jobs</p>
        </div>
        <div className="stat">
          <h3>{snap.decisions}</h3>
          <p className="muted">Agent decisions</p>
        </div>
        <div className="stat">
          <h3>${snap.revenueUsd}</h3>
          <p className="muted">Arms-length revenue (Stripe)</p>
        </div>
        <div className="stat">
          <h3>{snap.shipped}</h3>
          <p className="muted">Shipped / invoiced</p>
        </div>
        <div className="stat">
          <h3>{snap.escalated}</h3>
          <p className="muted">Escalated to human</p>
        </div>
        <div className="stat">
          <h3>${snap.demoUsd}</h3>
          <p className="muted">Demo markers (not revenue)</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: 20, overflowX: "auto" }}>
        <table className="ops-table">
          <thead>
            <tr>
              <th>Opened</th>
              <th>Business</th>
              <th>Status</th>
              <th>Price</th>
              <th>Last decision</th>
            </tr>
          </thead>
          <tbody>
            {snap.recent.map((job) => {
              const last = job.logs[job.logs.length - 1];
              return (
                <tr key={job.id}>
                  <td className="mono">{job.createdAt.slice(0, 16).replace("T", " ")}</td>
                  <td>
                    <Link href={`/job/${job.id}`}>{job.customer.businessName}</Link>
                    <div className="muted">{job.customer.industry}</div>
                  </td>
                  <td>{job.status}</td>
                  <td>${job.payment.amountUsd || 0}</td>
                  <td>
                    {last ? (
                      <>
                        <div>
                          {last.agent}: {last.decision}
                        </div>
                        <div className="muted">{last.rationale}</div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
            {snap.recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  No jobs yet. <Link href="/start">Hire the firm</Link>.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
