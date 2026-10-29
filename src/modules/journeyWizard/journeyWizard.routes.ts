import { Router } from "express";
import { validate } from "../../middlewares/zod.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";
import { preDecode } from "../../middlewares/auth.middleware.js";

import {
  createJourneyWizardRequestController,
  getJourneyWizardRequestsController,
  updateJourneyWizardRequestController,
  deleteJourneyWizardRequestController,
} from "./journeyWizard.controller.js";

import {
  createJourneyWizardRequestValidator,
  getJourneyWizardRequestsValidator,
  updateJourneyWizardRequestValidator,
} from "./journeyWizard.validator.js";

const router = Router();

// Route for journey wizard submission (attaches authenticated user if session present)
router.post(
  "/",
  preDecode,
  publicApiLimiter,
  validate(createJourneyWizardRequestValidator),
  createJourneyWizardRequestController
);

// Unified journey requests route (Admin gets all, authenticated regular User gets their own requests)
router.get(
  "/",
  preDecode,
  validate(getJourneyWizardRequestsValidator),
  getJourneyWizardRequestsController
);

router.patch(
  "/:id",
  validate(updateJourneyWizardRequestValidator),
  updateJourneyWizardRequestController
);

router.delete(
  "/:id",
  deleteJourneyWizardRequestController
);

export default router;
