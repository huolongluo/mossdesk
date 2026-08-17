"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INDUSTRIES } from "@/lib/config";

const EXAMPLES = [
  {
    label: "Bakery invoices",
    industry: "Cafe / bakery / restaurant",
    problem:
      "We cater office breakfasts but half the invoices sit unpaid for 3 weeks. I chase on WeChat at midnight and still feel rude. Need a polite collection sequence and a rule for when to stop cooking for non-payers.",
  },
  {
    label: "Plumber quotes",
    industry: "Trades (plumber, electrician, HVAC)",
    problem:
      "Customers text photos of leaks. I quote by gut, then they ghost or haggle after I am already on the road. Need a quoting script, deposit rule, and a same-day follow-up sequence.",
  },
  {
    label: "Gym no-shows",
    industry: "Clinic / wellness / gym",
    problem:
      "Intro sessions no-show about 40%. Front desk is one person. Need a reminder cadence, a freeze policy in plain language, and a win-back text for people who vanished after week two.",
  },
];

export function StartForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    businessName: "",
    industry: INDUSTRIES[0] as string,
    location: "",
    problem: "",
    constraints: "",
  });

  function applyExample(ex: (typeof EXAMPLES)[number]) {
    setForm((f) => ({
      ...f,
      industry: ex.industry,
      problem: ex.problem,
      businessName: f.businessName || ex.label,
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not open the job");
      router.push(`/job/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the job");
      setBusy(false);
    }
  }

  return (
    <form className="form card" onSubmit={onSubmit}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            className="btn-ghost"
            onClick={() => applyExample(ex)}
          >
            Try: {ex.label}
          </button>
        ))}
      </div>
      <div className="grid-2">
        <label>
          Your name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Business
          <input
            required
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
        </label>
        <label>
          Industry
          <select
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          >
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        City / neighborhood
        <input
          required
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="e.g. Chengdu, Jingxiu Road"
        />
      </label>
      <label>
        The mess, in your words
        <textarea
          required
          minLength={20}
          value={form.problem}
          onChange={(e) => setForm({ ...form, problem: e.target.value })}
          placeholder="Paste the WhatsApp chaos, the unpaid invoices, the no-show leak…"
        />
      </label>
      <label>
        Constraints (optional)
        <input
          value={form.constraints}
          onChange={(e) => setForm({ ...form, constraints: e.target.value })}
          placeholder="Budget, language, staff of 1, no discounts, etc."
        />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn-solid" disabled={busy} type="submit">
        {busy ? "Opening the job…" : "Let the agents take it"}
      </button>
    </form>
  );
}
