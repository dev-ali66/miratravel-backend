import { Request, Response } from "express";
import Stripe from "stripe";
import config from "../../../config/index.js";
import prisma from "../../../config/prisma.js";
import { recalculateBookingState } from "../../booking/engine/paymentEngine.service.js";

const stripe = new Stripe(config.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-08-26.dahlia",
});

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    if (!(req as any).rawBody) {
      throw new Error("Missing raw body. Ensure express is configured correctly.");
    }
    
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      signature,
      config.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;
    }
    case "payment_intent.succeeded": {
      // Optional: Handle direct payment intents if not using checkout sessions
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // await handleSuccessfulPaymentIntent(paymentIntent);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
};

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata || !metadata.bookingId) {
    console.warn("⚠️ Webhook received but no bookingId in metadata");
    return;
  }

  const { bookingId, scheduleItemId } = metadata;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create the payment record
      await tx.paymentRecord.create({
        data: {
          bookingId,
          scheduleItemId: scheduleItemId || null,
          amount: (session.amount_total ?? 0) / 100, // Stripe uses cents
          currency: (session.currency ?? "usd").toUpperCase(),
          method: "STRIPE",
          pspTransactionRef: session.id,
          status: "SUCCEEDED",
          recordedBy: "SYSTEM_WEBHOOK",
        },
      });

      // 2. Update the schedule item if provided
      if (scheduleItemId) {
        await tx.paymentScheduleItem.update({
          where: { id: scheduleItemId },
          data: {
            status: "PAID",
            paidAmount: (session.amount_total ?? 0) / 100,
          },
        });
      }

      // 3. Recalculate the overall booking state
      await recalculateBookingState(bookingId, tx);
    });

    console.log(`✅ Successfully processed payment for booking ${bookingId}`);
  } catch (error) {
    console.error(`❌ Error processing payment for booking ${bookingId}:`, error);
    throw error;
  }
}
