# Devpost paste — MossDesk

Use this on https://xprize.devpost.com/ — category **Small Business Services**.

**Project name:** MossDesk  
**Tagline:** Gemini agents that run a small-business front office — they price the work, do the work, and collect.

**GitHub:** https://github.com/huolongluo/mossdesk  
**Website / testing:** http://localhost:3000 (Cloud Run URL still required for judges; this machine has no gcloud login yet)  
**Video:** record from VIDEO_SCRIPT.md, then paste YouTube/Vimeo URL  
**Built with:** Gemini API (`gemini-3.5-flash-lite`), Next.js, Stripe-ready checkout, Cloud Run Dockerfile

## Elevator

Local shops drown in unpaid invoices, ghosted quotes, and no-shows. MossDesk is a Gemini-operated firm: five agents intake the mess, set a real USD price, ship a 7-day operating package, invoice, and escalate only when the auditor refuses to ship. Humans do not re-quote.

## Testing instructions

1. Open the site.  
2. Click **Run live bakery job** (30–90s). Or `/start` with your own mess.  
3. Watch Scout → Pricer → Operator → Collector → Auditor on the job page.  
4. Open `/ops` and `/api/health` and `/api/evidence`.  
5. `/pay/[id]` — Stripe if configured; the local demo-pay button is **not** revenue.

## Circle prize

Opt in: **No**.

## Still required from the team (cannot be faked in git)

- Devpost Join + Submit  
- 3-minute video on YouTube/Vimeo  
- Google Cloud Run deploy (`gcloud` not installed on this machine)  
- At least one arms-length Stripe payment + P&L numbers  
