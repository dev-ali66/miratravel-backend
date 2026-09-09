import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { accessMiddleware } from "../../middlewares/accessControl.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";

import {
  getSiteSettingsController,
  updateSiteSettingsController,
} from "./settings.controller.js";
import { updateSettingsValidator } from "./settings.validator.js";

const router = Router();

// Publicly readable for the frontend to populate header/footer/seo
router.get("/", getSiteSettingsController);

// Protected update for Admin
router.patch(
  "/",
  protect,
  validate(updateSettingsValidator),
  updateSiteSettingsController
);

router.put(
  "/",
  protect,
  validate(updateSettingsValidator),
  updateSiteSettingsController
);

export default router;
