import { Router } from "express";
import { validate } from "../../middlewares/zod.middleware.js";
import { publicApiLimiter } from "../../middlewares/limiter.middleware.js";

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

// Public route for frontend submission
router.post(
  "/",
  publicApiLimiter,
  validate(createJourneyWizardRequestValidator),
  createJourneyWizardRequestController
);

// Admin routes
router.get(
  "/",
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
