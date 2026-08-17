import { randomUUID } from "crypto";
import {
  ESCALATE_ABOVE_USD,
  PRICE_CEILING_USD,
  PRICE_FLOOR_USD,
} from "@/lib/config";
import { generateJson } from "@/lib/gemini";
import { saveJob } from "@/lib/store";
import type {
  AgentName,
  AuditorOutput,
  CollectorOutput,
  DecisionLog,
  Job,
  OperatorOutput,
  PricingOutput,
  ScoutOutput,
} from "@/lib/types";

const FIRM =
  "You are an operating partner inside MossDesk, a Gemini-native professional firm for local small businesses. You make real operating decisions. Be specific, concrete, and useful. Never invent fake phone numbers or fake laws. Write in the customer's language if they wrote in Chinese; otherwise English. Return ONLY valid JSON.";

function log(
  job: Job,
  agent: AgentName,
  decision: string,
  rationale: string,
  payload: unknown,
  meta: { model: string; latencyMs: number },
) {
  const entry: DecisionLog = {
    id: randomUUID(),
    at: new Date().toISOString(),
    agent,
    decision,
    rationale,
    payload,
    model: meta.model,
    latencyMs: meta.latencyMs,
  };
  job.logs.push(entry);
}

function jobBrief(job: Job) {
  return JSON.stringify(
    {
      customer: job.customer,
      problem: job.problem,
      constraints: job.constraints,
      scout: job.scout,
      pricing: job.pricing,
      deliverable: job.deliverable,
      collection: job.collection,
    },
    null,
    2,
  );
}

export async function runFirm(job: Job): Promise<Job> {
  job.status = "running";
  job.error = undefined;
  await saveJob(job);

  try {
    await runScout(job);
    await runPricer(job);
    if (!job.pricing?.takeJob) {
      job.status = "rejected";
      job.currentAgent = null;
      await saveJob(job);
      return job;
    }
    await runOperator(job);
    await runCollector(job);
    await runAuditor(job);

    if (job.audit?.verdict === "REJECT") {
      job.status = "rejected";
    } else if (job.audit?.verdict === "ESCALATE" || job.audit?.humanNeeded) {
      job.status = "escalated";
    } else {
      job.status = "awaiting_payment";
      job.payment.status = "invoiced";
      job.payment.amountUsd = job.pricing?.priceUsd ?? PRICE_FLOOR_USD;
    }
    job.currentAgent = null;
    await saveJob(job);
    return job;
  } catch (err) {
    job.status = "escalated";
    job.currentAgent = null;
    job.error = err instanceof Error ? err.message : "Firm run failed";
    await saveJob(job);
    return job;
  }
}

async function runScout(job: Job) {
  job.currentAgent = "scout";
  await saveJob(job);
  const { data, latencyMs, model } = await generateJson<ScoutOutput>({
    system: `${FIRM}
Role: SCOUT. Intake partner. Extract a usable operating picture.
Schema:
{
  "businessOneLiner": string,
  "customerWho": string,
  "corePain": string,
  "constraints": string[],
  "successLooksLike": string,
  "riskFlags": string[]
}`,
    user: jobBrief(job),
  });
  job.scout = data;
  log(
    job,
    "scout",
    "INTAKE_COMPLETE",
    data.corePain,
    data,
    { model, latencyMs },
  );
  await saveJob(job);
}

async function runPricer(job: Job) {
  job.currentAgent = "pricer";
  await saveJob(job);
  const { data, latencyMs, model } = await generateJson<PricingOutput>({
    system: `${FIRM}
Role: PRICER. You set the price the customer will pay MossDesk. This is a binding commercial decision.
Policy:
- Floor $${PRICE_FLOOR_USD}, ceiling $${PRICE_CEILING_USD}.
- Desk Sprint is a one-time operating package. Desk Retainer only if the mess is clearly ongoing.
- Complexity 1-2 → $29-$59. Complexity 3 → $79-$129. Complexity 4-5 → $149-$199.
- If legal/medical advice is required, takeJob=false.
- If price would exceed $${ESCALATE_ABOVE_USD}, still cap at ceiling and note it.
Schema:
{
  "takeJob": boolean,
  "rejectReason": string,
  "sku": "desk_sprint" | "desk_retainer",
  "priceUsd": number,
  "complexity": 1 | 2 | 3 | 4 | 5,
  "marginNote": string,
  "rationale": string
}`,
    user: jobBrief(job),
  });
  const price = clampPrice(Number(data.priceUsd) || PRICE_FLOOR_USD);
  job.pricing = { ...data, priceUsd: price, takeJob: Boolean(data.takeJob) };
  job.payment.amountUsd = job.pricing.takeJob ? price : 0;
  log(
    job,
    "pricer",
    job.pricing.takeJob ? "SET_PRICE" : "DECLINE_JOB",
    job.pricing.rationale || job.pricing.rejectReason || "Priced",
    job.pricing,
    { model, latencyMs },
  );
  await saveJob(job);
}

async function runOperator(job: Job) {
  job.currentAgent = "operator";
  await saveJob(job);
  const { data, latencyMs, model } = await generateJson<OperatorOutput>({
    system: `${FIRM}
Role: OPERATOR. Deliver the work the customer paid for: a 7-day operating package they can run tomorrow morning.
Write scripts they can copy-paste. Be local and practical. No fluff.
Schema:
{
  "playbookTitle": string,
  "situationSummary": string,
  "operatingRules": string[],
  "scripts": [{"situation": string, "channel": "sms"|"whatsapp"|"email"|"in_person", "message": string}],
  "sevenDaySequence": [{"day": number, "action": string, "owner": "owner"|"staff"|"agent", "copy": string}],
  "metricsToWatch": string[],
  "risks": string[]
}`,
    user: jobBrief(job),
  });
  job.deliverable = data;
  log(
    job,
    "operator",
    "PACKAGE_READY",
    data.playbookTitle,
    data,
    { model, latencyMs },
  );
  await saveJob(job);
}

async function runCollector(job: Job) {
  job.currentAgent = "collector";
  await saveJob(job);
  const { data, latencyMs, model } = await generateJson<CollectorOutput>({
    system: `${FIRM}
Role: COLLECTOR. You decide how MossDesk gets paid for THIS job, and you draft the dunning sequence if they stall.
Policy: due_on_delivery unless the customer is clearly cash-tight, then net7. Never waive unless takeJob was borderline charity — default waive=false.
Schema:
{
  "terms": "due_on_delivery" | "net7",
  "invoiceMemo": string,
  "dunning": [{"day": number, "channel": "email"|"sms", "message": string}],
  "waive": boolean
}`,
    user: jobBrief(job),
  });
  job.collection = { ...data, waive: false };
  log(
    job,
    "collector",
    "INVOICE_TERMS",
    data.invoiceMemo,
    job.collection,
    { model, latencyMs },
  );
  await saveJob(job);
}

async function runAuditor(job: Job) {
  job.currentAgent = "auditor";
  await saveJob(job);
  const { data, latencyMs, model } = await generateJson<AuditorOutput>({
    system: `${FIRM}
Role: AUDITOR. You are the last gate. Decide SHIP, REVISE, ESCALATE, or REJECT.
SHIP if the package is specific enough that the owner can act today.
ESCALATE if legal/medical/financial-advice risk, or qualityScore < 70.
REJECT only if we should not have taken the job.
Schema:
{
  "verdict": "SHIP" | "REVISE" | "ESCALATE" | "REJECT",
  "qualityScore": number,
  "issues": string[],
  "humanNeeded": boolean,
  "humanReason": string
}`,
    user: jobBrief(job),
  });
  const quality = Math.max(0, Math.min(100, Number(data.qualityScore) || 0));
  let verdict = data.verdict;
  if (quality < 70 && verdict === "SHIP") verdict = "ESCALATE";
  if (verdict === "REVISE") verdict = "ESCALATE";
  job.audit = {
    ...data,
    qualityScore: quality,
    verdict,
    humanNeeded: verdict === "ESCALATE" || Boolean(data.humanNeeded),
  };
  log(
    job,
    "auditor",
    verdict,
    job.audit.humanReason || `quality ${quality}`,
    job.audit,
    { model, latencyMs },
  );
  await saveJob(job);
}

function clampPrice(n: number) {
  const rounded = Math.round(n);
  return Math.min(PRICE_CEILING_USD, Math.max(PRICE_FLOOR_USD, rounded));
}
