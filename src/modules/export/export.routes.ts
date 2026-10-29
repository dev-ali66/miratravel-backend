import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import {
  exportBookingsController,
  exportUsersController,
  exportInquiriesController,
  exportNewsletterController,
  exportAuditLogsController,
  exportJourneyRequestsController,
} from "./export.controller.js";
import { downloadItineraryController } from "../booking/booking/booking.controller.js";

const router = Router();

router.get("/bookings", protect, publicApiLimiter, exportBookingsController);
router.get("/users", protect, publicApiLimiter, exportUsersController);
router.get("/inquiries", protect, publicApiLimiter, exportInquiriesController);
router.get("/newsletter", protect, publicApiLimiter, exportNewsletterController);
router.get("/audit-logs", protect, publicApiLimiter, exportAuditLogsController);
router.get("/journey-requests", protect, publicApiLimiter, exportJourneyRequestsController);
router.get("/itinerary/:id", protect, publicApiLimiter, downloadItineraryController);

export default router;
