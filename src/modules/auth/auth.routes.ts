import express from "express";
import {
  loginLimiter,
  otpApiLimiter,
  passwordApiLimiter,
  publicApiLimiter,
} from "../../middlewares/limiter.middleware.js";
import { validate } from "../../middlewares/zod.middleware.js";
import {
  changePassword,
  createAccountController,
  createContractorAccountController,
  createDriverAccountController,
  forgotPasswordController,
  getCurrentUser,
  getUserInfo,
  getUserSessionsController,
  revokeDeviceSessionController,
  revokeAllOtherSessionsController,
  logoutController,
  refreshTokenController,
  resendVerificationCode,
  resetPasswordController,
  updateProfile,
  userLoginController,
  verifyEmail,
  verifyForgotPasswordController,
} from "./auth.controller.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  inviteRegisterSchema,
  loginSchema,
  logoutSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
  verifyForgotPasswordViaLinkSchema,
  verifyOtpSchema,
} from "./auth.validator.js";
import {
  checkBlockedIP,
  checkBruteForce,
  checkDeviceTrust,
  protect,
} from "../../middlewares/auth.middleware.js";
import { uploadFile } from "../../middlewares/multer.middleware.js";
import { csrfProtection } from "../../middlewares/csrf.middleware.js";
import config from "../../config/index.js";

const router = express.Router();

router.post(
  "/register",
  publicApiLimiter,
  ...uploadFile(),
  validate(registerSchema),
  createAccountController,
);

router.post(
  "/register/instructorInfo/:token",
  publicApiLimiter,
  ...uploadFile(),
  validate(inviteRegisterSchema),
  createContractorAccountController,
);

router.post(
  "/register/userInfo/:token",
  publicApiLimiter,
  ...uploadFile(),
  validate(inviteRegisterSchema),
  createDriverAccountController,
);

router.post(
  "/verify-email",
  otpApiLimiter,
  ...uploadFile(),
  validate(verifyEmailSchema),
  verifyEmail,
);

router.get(
  "/verify-email/:token",
  otpApiLimiter,
  ...uploadFile(),
  validate(verifyEmailSchema),
  verifyEmail,
);

router.post(
  "/resend-verification",
  otpApiLimiter,
  ...uploadFile(),
  validate(resendVerificationSchema),
  resendVerificationCode,
);

router.post(
  "/login",
  loginLimiter,
  // csrfProtection,
  checkBlockedIP,
  checkBruteForce,
  checkDeviceTrust,
  ...uploadFile(),
  validate(loginSchema),
  userLoginController,
);

router.post(
  "/refresh-token",
  publicApiLimiter,
  // csrfProtection,
  refreshTokenController,
);

router.post(
  "/logout",
  protect,
  publicApiLimiter,
  // csrfProtection,
  ...uploadFile(),
  validate(logoutSchema),
  logoutController,
);

router.post(
  "/forgot-password",
  otpApiLimiter,
  ...uploadFile(),
  validate(forgotPasswordSchema),
  forgotPasswordController,
);

router.get(
  "/verify-forgot-password",
  otpApiLimiter,
  ...uploadFile(),
  validate(verifyForgotPasswordViaLinkSchema),
  verifyForgotPasswordController,
);

router.post(
  "/verify-forgot-password",
  otpApiLimiter,
  ...uploadFile(),
  validate(verifyForgotPasswordViaLinkSchema),
  verifyForgotPasswordController,
);

router.get(
  "/reset-password",
  publicApiLimiter,
  validate(resetPasswordSchema),
  resetPasswordController,
);
router.post(
  "/reset-password",
  publicApiLimiter,
  validate(resetPasswordSchema),
  resetPasswordController,
);

router.get("/me", protect, getCurrentUser);

router.get("/sessions", protect, getUserSessionsController);
router.delete("/sessions/all-other", protect, revokeAllOtherSessionsController);
router.delete("/sessions/:sessionId", protect, revokeDeviceSessionController);

router.get("/user-info", protect, getUserInfo);

router.post(
  "/change-password",
  protect,
  passwordApiLimiter,
  validate(changePasswordSchema),
  changePassword,
);

router.post(
  "/me",
  protect,
  publicApiLimiter,
  ...uploadFile(["image"], [10], 1),
  validate(updateProfileSchema),
  updateProfile,
);

// GET route just for CSRF token
// router.get(
//   "/csrf-token",
//   csrfProtection,
//   (req: Request, res: Response, next: NextFunction) => {
//     const token = req.csrfToken();

//     res.cookie("XSRF-TOKEN", token, {
//       httpOnly: false,
//       sameSite: "strict",
//       secure: config.IS_PRODUCTION,
//     });

//     res.json({ csrfToken: token });
//   }
// );

export default router;
