import { Router } from "express";
import { protect } from "../../../middlewares/auth.middleware.js";
import { publicApiLimiter } from "../../../middlewares/limiter.middleware.js";
import {
  deleteCmsPageSectionsController,
  getCmsPageSectionsController,
  manageCmsPageSectionsController,
} from "./cmspagesections.controller.js";
import { accessMiddleware } from "../../../middlewares/accessControl.middleware.js";
import { uploadFile } from "../../../middlewares/multer.middleware.js";
import { validate } from "../../../middlewares/zod.middleware.js";
import { getCmsPageSectionsValidator, manageCmsPageSectionsValidator } from "./cmspagesections.validator.js";

const router = Router();

router.get(
  "/",
  publicApiLimiter,
  validate(getCmsPageSectionsValidator),
  getCmsPageSectionsController,
);
router.post(
  "/",
  protect,
  publicApiLimiter,
  accessMiddleware("CmsPageSections"),
  ...uploadFile(),
  validate(manageCmsPageSectionsValidator),
  manageCmsPageSectionsController,
);
router.delete(
  "/",
  protect,
  publicApiLimiter,
  ...uploadFile(),
  accessMiddleware("CmsPageSections"),
  deleteCmsPageSectionsController,
);

export default router;
