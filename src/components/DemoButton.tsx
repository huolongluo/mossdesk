"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DemoButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo failed");
      router.push(`/job/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo failed");
      setBusy(false);
    }
  }

  return (
    <div>
      <button className="btn-gold" disabled={busy} onClick={run} type="button">
        {busy ? "Gemini agents working… 30–90s" : "Run live bakery job"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
