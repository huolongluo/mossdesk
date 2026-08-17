"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/types";

export function PayPanel({ job }: { job: Job }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function checkout(demo = false) {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      router.push(`/job/${job.id}?paid=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3>
        Invoice · ${job.payment.amountUsd} · {job.collection?.terms || "due_on_delivery"}
      </h3>
      <p>{job.collection?.invoiceMemo || job.deliverable?.playbookTitle}</p>
      <div className="hero-cta">
        <button className="btn-gold" disabled={busy} onClick={() => checkout(false)}>
          Pay with Stripe
        </button>
        <button className="btn-ghost" disabled={busy} onClick={() => checkout(true)}>
          Record demo payment (not revenue)
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <p className="muted">
        Demo payment is for local testing only. XPRIZE judges count arms-length
        Stripe or bank revenue, not this marker.
      </p>
    </div>
  );
}
