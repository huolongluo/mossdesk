import { NextResponse } from "next/server";
import { getJob, saveJob } from "@/lib/store";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 503 });
  }
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const jobId = session.metadata?.jobId;
    if (jobId) {
      const job = await getJob(jobId);
      if (job) {
        job.payment.status = "paid";
        job.payment.paidAt = new Date().toISOString();
        job.payment.stripeSessionId = session.id;
        job.status = "paid";
        await saveJob(job);
      }
    }
  }
  return NextResponse.json({ received: true });
}
