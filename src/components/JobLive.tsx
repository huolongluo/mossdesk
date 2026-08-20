"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Job } from "@/lib/types";

const AGENTS = ["scout", "pricer", "operator", "collector", "auditor"] as const;

export function JobLive({ initial }: { initial: Job }) {
  const [job, setJob] = useState(initial);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let stop = false;
    async function tick() {
      const res = await fetch(`/api/jobs/${initial.id}`, { cache: "no-store" });
      if (!res.ok || stop) return;
      setJob(await res.json());
    }
    const id = setInterval(tick, 1200);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [initial.id]);

  async function run() {
    setError("");
    setStarting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/run`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Firm run failed");
      setJob(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Firm run failed");
    } finally {
      setStarting(false);
    }
  }

  const running = job.status === "running" || starting;

  return (
    <div className="section">
      <p className="kicker">Job {job.id.slice(0, 8)}</p>
      <h1>{job.customer.businessName}</h1>
      <p className="lede">
        {job.customer.name} · {job.customer.industry} · {job.customer.location}
      </p>
      <p>
        <span className={pillFor(job.status)}>{job.status}</span>{" "}
        {job.currentAgent ? (
          <span className="pill warn">live: {job.currentAgent}</span>
        ) : null}
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>The mess</h3>
        <p>{job.problem}</p>
        {job.constraints ? <p className="muted">Constraints: {job.constraints}</p> : null}
        {job.status === "intake" ? (
          <button className="btn-solid" onClick={run} disabled={running}>
            {running ? "Agents are working…" : "Dispatch the firm"}
          </button>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        {job.error ? <p className="error">{job.error}</p> : null}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Decision tape</h3>
        {AGENTS.map((agent) => {
          const entry = [...job.logs].reverse().find((l) => l.agent === agent);
          const active = job.currentAgent === agent;
          return (
            <div className="agent-row" key={agent}>
              <strong style={{ textTransform: "capitalize" }}>{agent}</strong>
              <div>
                {active ? <p>Thinking with Gemini…</p> : null}
                {entry ? (
                  <>
                    <p>
                      <span className="pill">{entry.decision}</span> {entry.rationale}
                    </p>
                    <p className="mono muted">
                      {entry.model} · {entry.latencyMs}ms · {entry.at}
                    </p>
                  </>
                ) : (
                  <p className="muted">{active ? "" : "Waiting"}</p>
                )}
              </div>
              <span className="muted">{active ? "●" : entry ? "done" : "—"}</span>
            </div>
          );
        })}
      </div>

      {job.pricing ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Pricer decision</h3>
          <p>
            {job.pricing.takeJob
              ? `Take job as ${job.pricing.sku.replace("_", " ")} for $${job.pricing.priceUsd} (complexity ${job.pricing.complexity}/5).`
              : `Declined: ${job.pricing.rejectReason}`}
          </p>
          <p className="muted">{job.pricing.rationale}</p>
          <p className="muted">{job.pricing.marginNote}</p>
        </div>
      ) : null}

      {job.deliverable ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>{job.deliverable.playbookTitle}</h3>
          <p>{job.deliverable.situationSummary}</p>
          <h3 style={{ marginTop: 16 }}>Operating rules</h3>
          <ul>
            {job.deliverable.operatingRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <h3>Scripts</h3>
          {job.deliverable.scripts.map((s) => (
            <div key={s.situation} style={{ marginBottom: 12 }}>
              <p className="muted">
                {s.channel} · {s.situation}
              </p>
              <div className="script">{s.message}</div>
            </div>
          ))}
          <h3>7-day sequence</h3>
          <ul>
            {job.deliverable.sevenDaySequence.map((s) => (
              <li key={`${s.day}-${s.action}`}>
                Day {s.day} · {s.owner}: {s.action} — {s.copy}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {job.audit ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Auditor</h3>
          <p>
            <span className={pillFor(job.audit.verdict)}>{job.audit.verdict}</span>{" "}
            quality {job.audit.qualityScore}/100
          </p>
          {job.audit.issues?.length ? (
            <ul>
              {job.audit.issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {job.status === "awaiting_payment" || job.status === "delivered" ? (
        <div className="hero-cta" style={{ marginTop: 18 }}>
          <Link className="btn-gold" href={`/pay/${job.id}`}>
            Settle ${job.payment.amountUsd} on X Layer
          </Link>
        </div>
      ) : null}

      {job.payment.chain ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>X Layer receivable</h3>
          <p>
            <span className="pill">{job.payment.chain.status}</span>{" "}
            {job.payment.chain.invoiceId
              ? `Invoice #${job.payment.chain.invoiceId}`
              : "Ready to mint on pay"}
          </p>
          <p className="mono muted">tape {job.payment.chain.tapeHash}</p>
          {job.payment.chain.settleTxHash ? (
            <p className="mono">settled {job.payment.chain.settleTxHash}</p>
          ) : null}
        </div>
      ) : null}

      {job.status === "paid" ? (
        <p className="pill">Paid {job.payment.paidAt}</p>
      ) : null}
    </div>
  );
}

function pillFor(status: string) {
  if (status === "ESCALATE" || status === "escalated" || status === "rejected" || status === "REJECT") {
    return "pill bad";
  }
  if (status === "running" || status === "awaiting_payment") return "pill warn";
  return "pill";
}
