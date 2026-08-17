# Video script (≤ 3:00) — MossDesk

Record in English. Show the live product, not slides. Do not use copyrighted music.

**0:00–0:18 · The problem**  
On camera or VO: “Small shops do not have a front office. Quotes live in WhatsApp. Invoices die in a notebook.”  
Show a messy example (bakery / plumber preset).

**0:18–0:35 · The claim**  
“MossDesk is a Gemini-operated firm. Five agents take the job, set the price, do the work, and collect. Humans only handle exceptions.”  
Cut to homepage, then `/start`.

**0:35–1:40 · Live run (the money shot)**  
- Fill `/start` (or preset) and submit.  
- Click **Dispatch the firm**.  
- Stay on the job page while Scout → Pricer → Operator → Collector → Auditor land.  
- Zoom the decision tape: model name, latency, SET_PRICE with a dollar amount.  
- Scroll the playbook: a real script they could send today.

Say: “The Pricer just bound a price. I did not type it.”

**1:40–2:15 · Ops, not a demo**  
Open `/ops`. Point at jobs, decision count, shipped vs escalated.  
Open one JSON log or the health endpoint if it helps.  
“This is production: every decision persisted.”

**2:15–2:40 · Money**  
Open `/pay/[id]`. If Stripe is live, complete a **real third-party** payment (not your own card if you can avoid it). Show the paid state.  
If you only have a Stripe dashboard screenshot, show it here and say the amount and that it is arms-length.

**2:40–3:00 · Close**  
“Category: Small Business Services. Google Cloud Run in production. Gemini on every job. The firm is already at work.”  
End on `/ops` or the paid playbook, not a logo sting.
