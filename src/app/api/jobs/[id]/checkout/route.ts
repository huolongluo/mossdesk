import { NextResponse } from "next/server";
import { appUrl, hasStripe } from "@/lib/config";
import { getJob, saveJob } from "@/lib/store";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const job = await getJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.payment.status === "paid" || job.payment.status === "demo_paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }
  if (job.status !== "awaiting_payment" && job.status !== "delivered") {
    return NextResponse.json(
      { error: "This job is not ready to invoice yet." },
      { status: 409 },
    );
  }

  const amount = Math.round((job.payment.amountUsd || 0) * 100);
  if (amount < 100) {
    return NextResponse.json({ error: "No invoice amount." }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    demo?: boolean;
  };

  if (!hasStripe()) {
    if (body.demo) {
      job.payment.status = "demo_paid";
      job.payment.paidAt = new Date().toISOString();
      job.status = "paid";
      await saveJob(job);
      return NextResponse.json({
        ok: true,
        mode: "demo",
        message:
          "Local demo payment recorded. This is NOT arms-length revenue. Configure Stripe for real charges.",
      });
    }
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY for real checkout, or retry with demo:true for a local marker.",
        mode: "local",
      },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const origin = appUrl(request.url);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: job.customer.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: `MossDesk ${job.pricing?.sku === "desk_retainer" ? "Retainer" : "Desk Sprint"}`,
            description: job.deliverable?.playbookTitle || "Operating package",
          },
        },
      },
    ],
    success_url: `${origin}/job/${job.id}?paid=1`,
    cancel_url: `${origin}/pay/${job.id}?canceled=1`,
    metadata: { jobId: job.id, product: "mossdesk" },
  });
  job.payment.stripeSessionId = session.id;
  await saveJob(job);
  return NextResponse.json({ checkoutUrl: session.url });
}
