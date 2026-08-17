# MossDesk

**Gemini agents that run a small-business front office.**  
They intake the mess, **set the price**, deliver a 7-day operating package, invoice, and only wake a human when the auditor refuses to ship.

Built for [Build with Gemini XPRIZE](https://www.geminixprize.com/) · **Small Business Services** · [github.com/huolongluo/mossdesk](https://github.com/huolongluo/mossdesk)

Live local: [http://localhost:3000](http://localhost:3000)

---

## Why this can win

Judges score three things equally: **business viability**, **AI-native operations**, **category impact**.

MossDesk is not “a chatbot that drafts copy.” It is a **firm**:

| Agent | Binding decision |
| --- | --- |
| Scout | What the operating picture is |
| Pricer | Take/decline the job + USD price ($29–$249) |
| Operator | The product (scripts + 7-day sequence) |
| Collector | Payment terms + dunning |
| Auditor | SHIP / ESCALATE / REJECT |

Every decision is written to `.data/jobs/*.json` and shown on `/ops`. Humans do not re-quote at checkout.

## Stack (rule-compliant)

- **Gemini API** (`gemini-3.5-flash-lite` via `@google/genai`) — required LLM calls
- **Google Cloud Run** — production host (`Dockerfile`)
- Optional **Vertex AI** if `GEMINI_PROVIDER=vertex`
- Stripe Checkout for arms-length revenue (optional locally, required for prize evidence)

## Quick start

```bash
cd mossdesk
cp .env.example .env.local
# put GEMINI_API_KEY from https://aistudio.google.com/apikey
pnpm install
pnpm dev
```

1. Open `/start`
2. Paste a messy shop problem (or use a preset)
3. **Dispatch the firm** — watch `/job/[id]` as agents decide
4. Pay on `/pay/[id]` (Stripe) or record a **demo marker** (not revenue)
5. Show `/ops` to judges

## Deploy to Cloud Run

```bash
gcloud run deploy mossdesk --source . --region us-central1 --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_KEY,NEXT_PUBLIC_APP_URL=https://YOUR_SERVICE_URL
```

Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` when you take real cards. Point the webhook at `/api/stripe/webhook`.

Cloud Run’s filesystem is ephemeral. For a multi-instance production store, mount a volume or swap `src/lib/store.ts` to Firestore. The default JSON store is enough to demonstrate production agent logs on a single instance.

## Submission pack

| File | Use |
| --- | --- |
| [SUBMISSION.md](./SUBMISSION.md) | Devpost fields (English) |
| [NARRATIVE.md](./NARRATIVE.md) | 500–1000 word written narrative |
| [VIDEO_SCRIPT.md](./VIDEO_SCRIPT.md) | ≤3 minute demo script |
| [P_AND_L.md](./P_AND_L.md) | Revenue / cost template (fill with real numbers) |

## Honest constraint

XPRIZE counts **arms-length third-party revenue**, not founder payments and not the local “demo payment” button. Get at least one real Stripe charge from a shop that is not you or your family, export the dashboard, and put it in `P_AND_L.md` before you submit.

## License

MIT
