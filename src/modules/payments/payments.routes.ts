import { Router } from "express";
import { handleStripeWebhook } from "./stripe/stripe.controller.js";

const router = Router();

// Stripe Webhook Endpoint
// Notice: We don't use the standard `validate` middleware here because Stripe webhooks 
// need raw body and signature verification handled by `handleStripeWebhook`.
router.post("/stripe/webhook", handleStripeWebhook);

export default router;
