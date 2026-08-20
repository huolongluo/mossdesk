import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";
import type { Job } from "@/lib/types";

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function jobsDir() {
  return path.join(getDataDir(), "jobs");
}

function jobPath(id: string) {
  return path.join(jobsDir(), `${id}.json`);
}

function indexPath() {
  return path.join(getDataDir(), "index.json");
}

export async function createJob(
  input: Pick<Job, "customer" | "problem" | "constraints">,
): Promise<Job> {
  const now = new Date().toISOString();
  const job: Job = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "intake",
    currentAgent: null,
    customer: input.customer,
    problem: input.problem,
    constraints: input.constraints,
    logs: [],
    payment: { amountUsd: 0, status: "unpriced" },
  };
  await saveJob(job);
  return job;
}

export async function saveJob(job: Job) {
  await ensureDir(jobsDir());
  job.updatedAt = new Date().toISOString();
  await fs.writeFile(jobPath(job.id), JSON.stringify(job, null, 2), "utf8");
  await upsertIndex(job);
}

export async function getJob(id: string): Promise<Job | null> {
  try {
    const raw = await fs.readFile(jobPath(id), "utf8");
    return JSON.parse(raw) as Job;
  } catch {
    return null;
  }
}

export async function listJobs(): Promise<Job[]> {
  await ensureDir(jobsDir());
  try {
    const raw = await fs.readFile(indexPath(), "utf8");
    const ids = JSON.parse(raw) as string[];
    const jobs = await Promise.all(ids.map((id) => getJob(id)));
    return jobs
      .filter((j): j is Job => Boolean(j))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    const files = await fs.readdir(jobsDir());
    const jobs = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map((f) => getJob(f.replace(/\.json$/, ""))),
    );
    return jobs
      .filter((j): j is Job => Boolean(j))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

async function upsertIndex(job: Job) {
  await ensureDir(getDataDir());
  let ids: string[] = [];
  try {
    ids = JSON.parse(await fs.readFile(indexPath(), "utf8")) as string[];
  } catch {
    ids = [];
  }
  ids = [job.id, ...ids.filter((id) => id !== job.id)];
  await fs.writeFile(indexPath(), JSON.stringify(ids, null, 2), "utf8");
}

export async function opsSnapshot() {
  const jobs = await listJobs();
  const paid = jobs.filter(
    (j) => j.payment.status === "paid" || j.payment.status === "demo_paid",
  );
  const onchain = jobs.filter((j) => j.payment.chain?.status === "settled");
  const revenueUsd = paid
    .filter((j) => j.payment.status === "paid")
    .reduce((sum, j) => sum + (j.payment.amountUsd || 0), 0);
  const onchainSettled = onchain.length;
  const demoUsd = paid
    .filter((j) => j.payment.status === "demo_paid")
    .reduce((sum, j) => sum + (j.payment.amountUsd || 0), 0);
  const decisions = jobs.reduce((n, j) => n + j.logs.length, 0);
  const shipped = jobs.filter(
    (j) => j.status === "delivered" || j.status === "paid" || j.status === "awaiting_payment",
  ).length;
  const escalated = jobs.filter((j) => j.status === "escalated").length;
  return {
    jobs: jobs.length,
    decisions,
    shipped,
    escalated,
    revenueUsd,
    demoUsd,
    onchainSettled,
    payingCustomers: new Set(
      jobs
        .filter((j) => j.payment.status === "paid")
        .map((j) => j.customer.email.toLowerCase()),
    ).size,
    recent: jobs.slice(0, 40),
  };
}
