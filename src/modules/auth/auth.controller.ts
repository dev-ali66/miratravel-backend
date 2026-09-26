import catchAsync from "../../utils/catch.async.js";
import successResponse from "../../utils/success.response.js";
import {
  passwordChangedTemplate,
  universalHTML,
} from "../../shared/email_template.service.js";
import { emailHelper } from "../../utils/email.helper.js";
import ApiError from "../../utils/api.error.js";
import { StatusCodes } from "http-status-codes";
import config from "../../config/index.js";
import AuthHelper from "../../utils/auth.helper.js";
import * as AuthService from "./auth.service.js";
import { NextFunction, Request, Response } from "express";
import { uploadFilesToCloudinary } from "../../shared/upload_cloudinary.service.js";
import { deleteFromCloudinary } from "../../shared/delete_cloudinary.service.js";
import { auditLogger } from "../../logger/audit.logger.js";
import prisma from "../../config/prisma.js";
const OTP_CONFIG = {
  expiresMinutes: config.OTP_EXPIRE_MINUTE,
};

// export const accessRequestContractorController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const result = await AuthService.accessRequestContractorService(req.validated?.body, "INSTRUCTOR", undefined)
//     successResponse({
//       res,
//       code: StatusCodes.CREATED,
//       success: true,
//       message: "Request Send Successfully",
//       data: result,
//     });
//   } catch (err: any) {
//     throw new ApiError(err.message, StatusCodes.BAD_REQUEST)
//   }
// });

export const createAccountController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.createAccountService(req);
    successResponse({
      res,
      ...result,
    });
  },
);

export const createContractorAccountController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    req.validated = req.validated || {};
    req.validated.body = req.validated?.body || {};
    req.validated.body.roles = ["CONTRACTOR"];
    try {
      const result = await AuthService.createAccountService(req);
      successResponse({
        res,
        code: StatusCodes.CREATED,
        success: true,
        message: "User registered! Verify your email.",
        data: result,
      });
    } catch (err: any) {
      throw new ApiError(err.message, StatusCodes.BAD_REQUEST);
    }
  },
);


export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenFromParams = req.validated?.params?.token;
      const tokenFromQuery = req.validated?.query?.token;
      const token = tokenFromParams || tokenFromQuery;
      const { email, otp } = req.validated?.body;
      const result = await AuthService.verifyEmail({
        token,
        email,
        otp,
      });

      if (tokenFromParams) return res.send(universalHTML(result.message));
      return successResponse({
        res,
        message: result.message,
        data: null,
      });
    } catch (err: any) {
      next(err);
      // throw new ApiError(err.message, StatusCodes.BAD_REQUEST)
    }
  },
);

export const resendVerificationCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.validated?.body ?? {};

      const result = await AuthService.resendVerificationCode(
        { email },
        OTP_CONFIG,
      );

      return successResponse({
        res,
        code: StatusCodes.OK,
        success: true,
        message: result.message,
        data: null,
      });
    } catch (err: any) {
      next(err);
    }
  },
);

export const userLoginController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, rememberMe } = req.validated?.body ?? req.body ?? {};
    const result = await AuthService.loginUserService({
      email,
      password,
      rememberMe: Boolean(rememberMe),
      req,
    });
    if (result.accessToken && result.accessOptions) {
      res.cookie(
        "accessToken",
        result.accessToken,
        result.accessOptions as any,
      );
    }

    if (result.refreshToken && result.refreshOptions) {
      res.cookie(
        "refreshToken",
        result.refreshToken,
        result.refreshOptions as any,
      );
    } else {
      res.clearCookie("refreshToken", { path: "/" });
    }

    // Audit Log: Login Success
    await auditLogger({
      req,
      action: "AUTH_LOGIN_SUCCESS",
      entity: "Auth",
      entityId: result.user?.id || email,
      status: "SUCCESS",
      metadata: {
        description: `User ${email} signed in successfully via credentials. (Remember: ${Boolean(rememberMe)})`,
        role: result.user?.roles || "USER",
      },
    });

    successResponse({
      res,
      code: StatusCodes.CREATED,
      success: true,
      message: result.message ? result.message : "User logged in successfully!",
      data: result.user
        ? {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken || null,
            user: result.user,
            session: result.session,
          }
        : null,
    });
  },
);

// REFRESH TOKEN
export const refreshTokenController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      throw new ApiError("No refresh token provided", 401);
    }

    const result = await AuthService.refreshTokenService(token, req);

    if (result.accessToken && result.accessOptions) {
      res.cookie(
        "accessToken",
        result.accessToken,
        result.accessOptions as any,
      );
    }

    if (result.refreshToken && result.refreshOptions) {
      res.cookie(
        "refreshToken",
        result.refreshToken,
        result.refreshOptions as any,
      );
    }

    return successResponse({
      res,
      code: 200,
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        session: result.session,
      },
    });
  },
);

// LOGOUT CONTROLLER
export const logoutController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { allDevices, refreshToken: bodyRefreshToken } =
      req.validated?.body ?? req.body ?? {};
    const token = req.cookies?.refreshToken || bodyRefreshToken;

    if (allDevices) {
      await AuthService.logoutAllDevicesService(req.auth.id);
    } else if (token) {
      try {
        await AuthService.logoutSingleDeviceService(token);
      } catch {
        // Fallback: revoke latest active session for this auth user
        await prisma.session.updateMany({
          where: { authId: req.auth.id, isRevoked: false },
          data: {
            isRevoked: true,
            revokeReason: "logout",
            lastUsedAt: new Date(),
          },
        });
      }
    } else {
      // Fallback if no refreshToken provided: revoke active sessions for this user
      await prisma.session.updateMany({
        where: { authId: req.auth.id, isRevoked: false },
        data: {
          isRevoked: true,
          revokeReason: "logout",
          lastUsedAt: new Date(),
        },
      });
    }

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    // Audit Log: Logout
    await auditLogger({
      req,
      action: "AUTH_LOGOUT",
      entity: "Auth",
      entityId: req.auth?.id || "session",
      status: "SUCCESS",
      metadata: {
        description: `User ${req.auth?.email || "User"} logged out${allDevices ? " from all devices" : ""}.`,
      },
    });

    return successResponse({
      res,
      code: 200,
      success: true,
      message: "Logout successful",
    });
  },
);

export const getUserSessionsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authId = req.auth?.id;
    if (!authId) {
      throw new ApiError("Unauthorized", StatusCodes.UNAUTHORIZED);
    }

    const result = await AuthService.getUserSessionsService(authId);

    return successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message: "User active sessions fetched successfully",
      data: result,
    });
  },
);

export const revokeDeviceSessionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authId = req.auth?.id;
    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;

    if (!authId) {
      throw new ApiError("Unauthorized", StatusCodes.UNAUTHORIZED);
    }
    if (!sessionId) {
      throw new ApiError("Session ID is required", StatusCodes.BAD_REQUEST);
    }

    const result = await AuthService.revokeDeviceSessionService(authId, sessionId);

    // Audit Log: Device Revocation
    await auditLogger({
      req,
      action: "AUTH_DEVICE_REVOKED",
      entity: "Session",
      entityId: sessionId,
      status: "SUCCESS",
      metadata: {
        description: `User ${req.auth?.email || "User"} revoked session/device (${sessionId}).`,
      },
    });

    return successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message: result.message,
      data: null,
    });
  },
);

export const revokeAllOtherSessionsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authId = req.auth?.id;
    const currentRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!authId) {
      throw new ApiError("Unauthorized", StatusCodes.UNAUTHORIZED);
    }

    const result = await AuthService.revokeAllOtherSessionsService(
      authId,
      currentRefreshToken,
    );

    // Audit Log: Revoke All Other Devices
    await auditLogger({
      req,
      action: "AUTH_ALL_OTHER_DEVICES_REVOKED",
      entity: "Session",
      entityId: authId,
      status: "SUCCESS",
      metadata: {
        description: `User ${req.auth?.email || "User"} revoked all other active sessions.`,
      },
    });

    return successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message: result.message,
      data: null,
    });
  },
);

// FORGOT PASSWORD
export const forgotPasswordController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.validated?.body;

    await AuthService.forgotPasswordService(email);

    return successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message:
        "If an account exists, an OTP and reset link will be sent to your email",
      data: null,
    });
  },
);

// VERIFY OTP
export const verifyForgotPasswordController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Content-Security-Policy", "script-src 'self'");
    const { message, passwordResetToken, expiresIn, html } =
      await AuthService.verifyForgotPasswordService({
        token: req.validated?.query?.token,
        email: req.validated?.body?.email,
        otp: req.validated?.body?.otp,
      });

    if (html) return res.send(html);
    return successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message,
      data: { passwordResetToken, expiresIn },
    });
  },
);

// RESET PASSWORD
export const resetPasswordController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { newPassword, resetToken, withMail } = req.validated?.body;
    const { message, html } = await AuthService.resetPasswordService({
      newPassword,
      resetToken,
      withMail,
    });
    if (html) return res.send(html);
    return successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message,
      data: null,
    });
  },
);

// ==========================================
export const getCurrentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.auth;
    if (!user) {
      throw new ApiError("User not found", StatusCodes.NOT_FOUND);
    }

    successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  },
);

// GET CURRENT INFO

export const getUserInfo = catchAsync(async (req: Request, res: Response) => {
  const authId = req.auth.id;

  const user = await prisma.auth.findUnique({
    where: { id: authId },
    select: {
      id: true,
      email: true,
      isVerified: true,
      status: true,
      createdAt: true,

      roles: {
        select: {
          id: true,
          name: true,
        },
      },
      userPersonalInfo: true,
      userSettings: true,
      userTravelPreferences: true,
    },
  });

  if (!user) {
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);
  }

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: user,
  });
});
// CHANGE PASSWORD
export const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.validated?.body;
    const authId = req.auth.id;

    const user = await prisma?.auth.findUnique({
      where: { id: authId },
    });

    if (!user) {
      throw new ApiError("User not found", StatusCodes.NOT_FOUND);
    }
    const isMatch = await AuthHelper.comparePassword(
      currentPassword,
      user.password,
    );

    if (!isMatch) {
      throw new ApiError(
        "Current password is incorrect",
        StatusCodes.UNAUTHORIZED,
      );
    }

    const hashedPassword = await AuthHelper.hashPassword(newPassword);

    await prisma.auth.update({
      where: { id: authId },
      data: {
        password: hashedPassword,
      },
    });

    const fullName = `${user?.email || ""}`.trim();

    const html = passwordChangedTemplate(fullName || "User");

    await emailHelper({
      to: user.email,
      subject: "🔒 Password Changed Successfully",
      message: "Your password has been changed successfully.",
      html,
    });

    successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message: "Password changed successfully",
      data: null,
    });
  },
);

// UPDATE PROFILE
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const body = req.validated?.body;
  const files = req.files;
  const personalData: any = {};

  // ================= PERSONAL INFO =================
  if (body?.firstName !== undefined) personalData.firstName = body.firstName;
  if (body?.lastName !== undefined) personalData.lastName = body.lastName;
  if (body?.about !== undefined) personalData.about = body.about;
  if (body?.phone !== undefined) personalData.phone = body.phone;
  if (body?.address !== undefined) personalData.address = body.address;
  if (body?.country !== undefined) personalData.country = body.country;
  if (body?.city !== undefined) personalData.city = body.city;
  if (body?.state !== undefined) personalData.state = body.state;
  if (body?.zipCode !== undefined || body?.zip !== undefined) personalData.zipCode = body.zipCode ?? body.zip;
  if (body?.nationality !== undefined) personalData.nationality = body.nationality;
  if (body?.dateOfBirth !== undefined) personalData.dateOfBirth = body.dateOfBirth;
  if (body?.photoUrl === "") personalData.photoUrl = [];

  // ================= TRAVEL PREFERENCES =================
  const travelData: any = {};
  const tpSource = body?.travelPreferences && typeof body.travelPreferences === "object" ? body.travelPreferences : body;

  const parseArrayOrJson = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val.trim()) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return val.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return undefined;
  };

  if (tpSource?.pace !== undefined && tpSource.pace !== null) {
    const paceUpper = String(tpSource.pace).toUpperCase();
    if (["RELAXED", "BALANCED", "ACTIVE"].includes(paceUpper)) {
      travelData.pace = paceUpper as any;
    }
  }
  if (tpSource?.accommodations !== undefined && tpSource.accommodations !== null) {
    const parsed = parseArrayOrJson(tpSource.accommodations);
    if (parsed) travelData.accommodations = parsed;
  }
  if (tpSource?.foodDietary !== undefined && tpSource.foodDietary !== null) {
    const parsed = parseArrayOrJson(tpSource.foodDietary);
    if (parsed) travelData.foodDietary = parsed;
  }
  if (tpSource?.foodNotes !== undefined && tpSource.foodNotes !== null) travelData.foodNotes = tpSource.foodNotes;
  if (tpSource?.interests !== undefined && tpSource.interests !== null) {
    const parsed = parseArrayOrJson(tpSource.interests);
    if (parsed) travelData.interests = parsed;
  }
  if (tpSource?.practicalNeeds !== undefined && tpSource.practicalNeeds !== null) {
    const parsed = parseArrayOrJson(tpSource.practicalNeeds);
    if (parsed) travelData.practicalNeeds = parsed;
  }
  if (tpSource?.practicalNotes !== undefined && tpSource.practicalNotes !== null) travelData.practicalNotes = tpSource.practicalNotes;
  if (tpSource?.generalNotes !== undefined && tpSource.generalNotes !== null) travelData.generalNotes = tpSource.generalNotes;

  // ================= FILE UPLOAD (REPLACE + DELETE OLD CLOUDINARY) =================
  const allowedFileFields = ["photoUrl"];

  if (files && Array.isArray(files)) {
    for (const file of files) {
      const field = file.fieldname;
      if (!allowedFileFields.includes(field)) continue;
      // 🔥 GET EXISTING IMAGES
      const existingRecord = await prisma.auth.findUnique({
        where: { id: req.auth.id },
        select: {
          userPersonalInfo: {
            select: {
              photoUrl: true,
            },
          },
        },
      });

      const oldImages = existingRecord?.userPersonalInfo?.photoUrl || [];

      // 🔥 DELETE OLD IMAGES FROM CLOUDINARY
      if (oldImages.length) {
        await Promise.all(
          oldImages.map(async (url: string) => {
            try {
              const result = await deleteFromCloudinary(url);
            } catch (err) {
              console.error("Cloudinary delete error:", err);
            }
          }),
        );
      }

      // 🔥 UPLOAD NEW IMAGE
      const result: any = await uploadFilesToCloudinary(
        file.buffer,
        file.mimetype,
        field,
        {},
      );

      personalData.photoUrl = [result.secure_url];
    }
  }

  // ================= BUILD UPDATE OBJECT =================
  const data: any = {};

  if (Object.keys(personalData).length) {
    data.userPersonalInfo = {
      upsert: {
        update: personalData,
        create: personalData,
      },
    };
  }

  if (Object.keys(travelData).length) {
    data.userTravelPreferences = {
      upsert: {
        update: travelData,
        create: travelData,
      },
    };
  }

  // ================= UPDATE USER =================
  const updated = await prisma.auth.update({
    where: { id: req.auth.id },
    data,
    select: {
      id: true,
      email: true,
      status: true,
      roles: true,
      userPersonalInfo: true,
      userTravelPreferences: true,
    },
  });

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: "Profile updated successfully",
    data: updated,
  });
});
