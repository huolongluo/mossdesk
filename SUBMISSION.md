# Devpost submission copy — MossDesk

**Hackathon:** Build with Gemini XPRIZE  
**Category:** Small Business Services  
**Project name:** MossDesk  
**Tagline:** Gemini agents that run a small-business front office — they price the work, do the work, and collect.

**Built with:** Gemini API (`gemini-3.5-flash-lite`), Google Cloud Run, Next.js, Stripe

---

## Elevator (≤350 chars)

Local shops drown in unpaid invoices, ghosted quotes, and no-shows. MossDesk is a Gemini-operated firm: five agents intake the mess, set a real USD price, ship a 7-day operating package, invoice, and escalate only when the auditor refuses to ship. Humans do not re-quote.

---

## What it does

MossDesk sells a **Desk Sprint**: a priced operating package for a single messy problem (collections, quoting, no-shows).

The customer describes the mess in plain language. A crew of Gemini agents then:

1. **Scout** — operating picture, constraints, risk flags  
2. **Pricer** — take or decline; SKU; dollar price under a hard policy floor/ceiling  
3. **Operator** — copy-paste scripts + 7-day sequence + metrics  
4. **Collector** — invoice terms and dunning  
5. **Auditor** — SHIP, ESCALATE, or REJECT with a quality score  

The customer pays the price the Pricer set. Checkout does not let a human override it.

The operator desk (`/ops`) is the production log: jobs, decisions, latency, model id, shipped vs escalated, and Stripe revenue separated from demo markers.

## How it uses Gemini

Every agent call is a live `generateContent` request to Gemini with `responseMimeType: application/json`. The Pricer and Auditor outputs are treated as **binding business decisions**, not suggestions. Policy clamps (price floor $29 / ceiling $249, auto-escalate below quality 70) are hard gates around the model, not instead of it.

## How it uses Google Cloud

Production host is **Cloud Run** (`Dockerfile`, `cloudrun.yaml`). Optional path: Vertex AI Gemini when `GEMINI_PROVIDER=vertex` and `GOOGLE_CLOUD_PROJECT` are set.

## What’s AI vs human

| AI (production) | Human |
| --- | --- |
| Intake, pricing, delivery, invoice terms, ship/escalate | Exceptions the Auditor escalates |
| Follow-up copy and dunning schedule | Bank/Stripe account, support for edge cases |
| Ops log | Marketing, first customers, tax |

## Testing instructions

1. Open the Cloud Run URL (or `pnpm dev` → http://localhost:3000).  
2. `/start` → fill the form or click a preset → submit.  
3. On the job page click **Dispatch the firm**. Wait ~30–90s while five agents run.  
4. Confirm the decision tape shows Scout → Pricer → Operator → Collector → Auditor.  
5. Open `/ops` and `/api/health`.  
6. `/pay/[id]` — Stripe if configured; otherwise the demo marker is **not** revenue.

If the site is private, there is no login wall on the public demo.

## Links to paste

- **Website:** _(Cloud Run URL)_  
- **GitHub:** https://github.com/huolongluo/mossdesk  
- **Video:** _(YouTube/Vimeo, ≤3 min — follow VIDEO_SCRIPT.md)_  
- **Google Cloud product:** Cloud Run  
- **Gemini model:** gemini-3.5-flash-lite  

## Circle Agentic Economy Prize

Opt-in: **No** for this build (Stripe checkout is human-completed, so it does not meet Circle’s “agent-driven USDC” bar). Do not claim the bonus unless you later wire Circle Agent Stack and capture a real USDC tx + explorer URL.
