import { StatusCodes } from "http-status-codes";
import config from "../../config/index.js";
import ApiError from "../../utils/api.error.js";
import AuthHelper from "../../utils/auth.helper.js";
import { emailHelper } from "../../utils/email.helper.js";
import prisma from "../../config/prisma.js";
import {
  forgotPasswordEmailTemplate,
  passwordChangedTemplate,
  universalHTML,
  verificationEmailTemplate,
} from "../../shared/email_template.service.js";
import { Request } from "express";
import { uploadFilesToCloudinary } from "../../shared/upload_cloudinary.service.js";
import { object } from "zod";

// export const accessRequestContractorService = async (data: any, role: any, authId: any) => {
//     const validateExistingRequest = (existingRequest: any) => {
//         if (!existingRequest) return;

//         if (existingRequest.inviteTokenUsed) {
//             throw new ApiError("Token already used", StatusCodes.BAD_REQUEST);
//         }

//         if (existingRequest.status === "PENDING") {
//             throw new ApiError("Request already pending", StatusCodes.CONFLICT);
//         }

//         if (
//             existingRequest.status === "APPROVED" &&
//             existingRequest.inviteExpiresAt > new Date()
//         ) {
//             throw new ApiError("Already approved. Check email.", StatusCodes.CONFLICT);
//         }

//         if (
//             existingRequest.status === "APPROVED" &&
//             existingRequest.inviteExpiresAt < new Date()
//         ) {
//             return {
//                 status: "EXPIRE TOKEN",
//                 inviteExpiresAt: null,
//                 inviteTokenHash: null
//             };
//         }

//         return {};
//     };

//     // 1. Check user
//     const existingUser = await prisma?.auth.findFirst({
//         where: { email: data.email }
//     });

//     if (existingUser) {
//         if (existingUser.isDeleted) {
//             throw new ApiError("Account deleted. Contact support.", StatusCodes.CONFLICT);
//         }
//         throw new ApiError("User already exists", StatusCodes.CONFLICT);
//     }

//     // 2. Role
//     const requesterRole = await prisma?.role.findFirst({
//         where: { name: role }
//     });

//     if (!requesterRole) {
//         throw new ApiError("Invalid role", StatusCodes.BAD_REQUEST);
//     }

//     // ================= INSTRUCTOR =================
//     if (role === "INSTRUCTOR" && !authId) {

//         const existingRequest = await prisma.accessRequest.findFirst({
//             where: { email: data.email }
//         });

//         const updatedFields = validateExistingRequest(existingRequest);

//         await prisma?.accessRequest.create({
//             data: {
//                 ...data,
//                 ...updatedFields,
//                 roles: {
//                     connect: [{ id: requesterRole.id }]
//                 }
//             }
//         });
//     }

//     // ================= DRIVER =================
//     if (role === "DRIVER" && authId) {

//         const existingRequest = await prisma?.driverAccessRequest.findFirst({
//             where: { email: data.email }
//         });

//         const updatedFields = validateExistingRequest(existingRequest);

//         // get instructorInfo safely
//         const user = await prisma?.auth.findFirst({
//             where: { id: authId },
//             select: {
//                 instructorInfo: { select: { id: true } }
//             }
//         });
//         if (!user?.instructorInfo?.id) {
//             throw new ApiError("Contractor not found for this user", StatusCodes.BAD_REQUEST);
//         }

//         return await prisma?.driverAccessRequest.create({
//             data: {
//                 ...data,
//                 contractorInfoId: user.instructorInfo.id,
//                 roles: {
//                     connect: [{ id: requesterRole.id }]
//                 }
//             },
//             select: {
//                 id: true,
//                 firstName: true,
//                 lastName: true,
//                 email: true,
//                 phone: true,
//                 status: true,
//                 createdAt: true,

//                 instructorInfo: {
//                     select: {
//                         id: true,
//                         email: true,
//                         status: true
//                     }
//                 },

//                 instructorInfo: {
//                     select: {
//                         id: true,
//                         companyName: true,
//                         firstName: true,
//                         lastName: true,
//                         phone: true,
//                         status: true
//                     }
//                 },
//                 roles: {
//                     select: {
//                         name: true
//                     }
//                 }
//             }
//         });

//     }

// };

export const createAccountService = async (req: any) => {
  await prisma.auth.deleteMany({
    where: { email: "aaliahammedpriom66@gmail.com" },
  });
  let user: any;
  let request: any;
  let updateData: any = {};
  let { email, password, firstName, lastName, roles, termsAccepted } = req.validated.body;
  if (!termsAccepted) {
    throw new ApiError(
      "You must accept the terms and conditions to register",
      StatusCodes.BAD_REQUEST,
    );
  }
  const token = req.validated?.params?.token;
  const hashedPassword = await AuthHelper.hashPassword(password);
  // normalize roles → always array
  if (typeof roles === "string") {
    roles = [roles];
  }

  if (!Array.isArray(roles)) {
    throw new ApiError("Roles must be string or array", 400);
  }

  if (roles.length > 1) {
    throw new ApiError("Only one role allowed for now", 400);
  }
  const role = roles[0];
  // ================= Registration Condition Check =================
  const directRegister = config.DIRECT_REGISTER.toUpperCase() === "TRUE";
  const tokenRegister = config.TOKEN_REGISTER.toUpperCase() === "TRUE";
  if (!directRegister && !tokenRegister)
    throw new ApiError(
      "Register service is unavailable",
      StatusCodes.BAD_REQUEST,
    );
  if (!directRegister && !token)
    throw new ApiError("Register only with Token", StatusCodes.BAD_REQUEST);
  if (!tokenRegister && (!email || !password))
    throw new ApiError(
      "Register with token not allowed",
      StatusCodes.BAD_REQUEST,
    );

  // ================= DIRECT REGISTER =================
  if (directRegister) {
    const existingUser = await prisma?.auth.findFirst({ where: { email } });
    if (existingUser) {
      if (existingUser.isDeleted) {
        throw new ApiError(
          "Account deleted. Contact support.",
          StatusCodes.CONFLICT,
        );
      }
      throw new ApiError("User already exists", StatusCodes.CONFLICT);
    }
    const dbRoles = await prisma?.role.findMany({
      where: { name: { in: roles } },
    });
    if (!dbRoles)
      throw new ApiError("Invalid roles provided", StatusCodes.BAD_REQUEST);

    if (dbRoles.length === 0) {
      throw new ApiError("Invalid roles provided", StatusCodes.BAD_REQUEST);
    }

    if (dbRoles.length !== roles.length) {
      throw new ApiError("Some roles are invalid", StatusCodes.BAD_REQUEST);
    }
    const roleConnections = dbRoles.map(
      (role: { id: string; name: string }) => ({ id: role.id }),
    );
    const otp = AuthHelper.generateOtp();
    const hashedOtp = await AuthHelper.hashPassword(otp);
    const otpExpiresAt = new Date(
      Date.now() + config.JWT_INVITE_TOKEN_EXPIRES_IN * 60 * 1000,
    );

    const emailToken = AuthHelper.generateInviteToken({ email, otp });

    user = await prisma?.auth.create({
      data: {
        email,
        roles: {
          connect: roleConnections,
        },
        password: hashedPassword,
        termsAccepted: termsAccepted ?? false,
        termsAcceptedAt: termsAccepted ? new Date() : null,
        otp: hashedOtp,
        otpExpiresAt,
        emailToken,
        userPersonalInfo: {
          create: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
          },
        },
        userSettings: {
          create: {},
        },
      },
    });
    const verifyUrl = `${config.OTP_BASE_URL}/auth/verify-email/${emailToken}`;

    const html = verificationEmailTemplate({
      verificationCode: otp,
      verifyUrl,
      otpExpiresMinutes: otpExpiresAt,
    });

    emailHelper({
      to: user.email,
      subject: "Verify your email",
      html,
    });

    return {
      code: StatusCodes.CREATED,
      success: true,
      message: "User registered ! Verifiy email",
      data: { id: user.id, email: user.email },
    };
  }

  // // ================= TOKEN REGISTER =================
  // if (token && tokenRegister) {

  //     const payload = AuthHelper.verifyInviteToken(token);
  //     if (!payload) throw new ApiError("Request a new invite token", StatusCodes.BAD_REQUEST);

  //     if (role === "INSTRUCTOR") {
  //         request = await prisma?.accessRequest.findUnique({
  //             where: { email: payload.email },
  //             include: {
  //                 roles: true
  //             }
  //         });
  //     }

  //     if (role === "DRIVER") {
  //         request = await prisma?.driverAccessRequest.findUnique({
  //             where: { email: payload.email },
  //             include: {
  //                 roles: true
  //             }
  //         });
  //     }
  //     if (!request) throw new ApiError("Request not found", StatusCodes.NOT_FOUND);

  //     if (!request.inviteTokenHash) {
  //         throw new ApiError("No token found in DB", StatusCodes.BAD_REQUEST);
  //     }

  //     const isValid = await AuthHelper.comparePassword(
  //         token,
  //         request.inviteTokenHash
  //     );

  //     if (!isValid) {
  //         throw new ApiError("Request a new invite token", StatusCodes.BAD_REQUEST);
  //     }

  //     if (request.inviteExpiresAt < new Date()) {
  //         throw new ApiError("Request a new invite token", StatusCodes.BAD_REQUEST);
  //     }

  //     const existingUser = await prisma?.auth.findFirst({
  //         where: { email: request.email }
  //     });

  //     if (existingUser) {
  //         if (existingUser.isDeleted) {
  //             await prisma?.accessRequest.update({
  //                 where: { id: request.id },
  //                 data: {
  //                     status: "DELETE",
  //                     inviteExpiresAt: null,
  //                     inviteTokenHash: null
  //                 },
  //             });
  //             throw new ApiError("Account deleted. Contact support.", StatusCodes.CONFLICT);
  //         }
  //         await prisma?.accessRequest.update({
  //             where: { id: request.id },
  //             data: {
  //                 status: "CREATED",
  //                 inviteExpiresAt: null,
  //                 inviteTokenHash: null
  //             },
  //         });
  //         throw new ApiError("User already exists", StatusCodes.CONFLICT);
  //     }

  //     if (role === "INSTRUCTOR") {
  //         const result = await prisma?.$transaction(async (tx) => {
  //             const user = await tx.auth.create({
  //                 data: {
  //                     email: request.email,
  //                     roles: {
  //                         connect: request.roles.map(role => ({
  //                             id: role.id
  //                         })),
  //                     },
  //                     password: hashedPassword,
  //                     isVerified: true,
  //                     otp: null,
  //                     otpExpiresAt: null,
  //                     emailToken: null,
  //                     instructorInfo: {
  //                         create: {
  //                             ...(request.companyName && { companyName: request.companyName }),
  //                             ...(request.firstName && { firstName: request.firstName }),
  //                             ...(request.lastName && { lastName: request.lastName }),
  //                             ...(request.phone && { phone: request.phone }),
  //                         },
  //                     },
  //                 },
  //             });

  //             await tx.accessRequest.update({
  //                 where: { id: request.id },
  //                 data: {
  //                     status: "CREATED",
  //                     inviteExpiresAt: null,
  //                     inviteTokenHash: null,
  //                     inviteTokenUsed: true,

  //                 },
  //             });

  //             return { id: user.id, email: user.email };
  //         });
  //         return {
  //             code: StatusCodes.CREATED,
  //             success: true,
  //             message: "User registered",
  //             data: result,
  //         };
  //     }

  //     if (role === "DRIVER") {

  //         const result = await prisma?.$transaction(async (tx) => {

  //             const user = await tx.auth.create({
  //                 data: {
  //                     email: request.email,
  //                     roles: {
  //                         connect: request.roles.map(role => ({
  //                             id: role.id
  //                         })),
  //                     },
  //                     password: hashedPassword,
  //                     isVerified: true,
  //                     otp: null,
  //                     otpExpiresAt: null,
  //                     emailToken: null,
  //                     userInfo: {
  //                         create: {
  //                             ...(request.firstName && { firstName: request.firstName }),
  //                             ...(request.lastName && { lastName: request.lastName }),
  //                             ...(request.phone && { phone: request.phone }),
  //                             ...(request.contractorInfoId && {
  //                                 contractorInfoId: request.contractorInfoId,
  //                             }),
  //                         },
  //                     },
  //                 },
  //             });

  //             await tx.driverAccessRequest.update({
  //                 where: { id: request.id },
  //                 data: {
  //                     status: "CREATED",
  //                     inviteExpiresAt: null,
  //                     inviteTokenHash: null,
  //                     inviteTokenUsed: true,
  //                 },
  //             });

  //             return { id: user.id, email: user.email };
  //         });
  //         return {
  //             code: StatusCodes.CREATED,
  //             success: true,
  //             message: "User registered",
  //             data: result,
  //         };
  //     }
  // }

  // throw new ApiError("Invalid registration flow", StatusCodes.BAD_REQUEST);
};

export const verifyEmail = async ({ token, email, otp }: any) => {
  const verifyAndUpdateUser = async (user: any, otp: string) => {
    if (user.isVerified) {
      return { message: "Already verified" };
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new ApiError("OTP not found", 400);
    }

    if (user.otpExpiresAt < new Date()) {
      throw new ApiError("OTP expired", 400);
    }

    const isValid = await AuthHelper.comparePassword(otp, user.otp);

    if (!isValid) {
      throw new ApiError("Invalid OTP", 400);
    }

    await prisma?.auth.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
        emailToken: null,
      },
    });
  };
  // 🟢 CASE 1: LINK
  if (token) {
    const payload = AuthHelper.verifyInviteToken(token);

    if (
      !payload ||
      typeof payload !== "object" ||
      !("email" in payload) ||
      !("otp" in payload)
    ) {
      throw new Error("Invalid or expired token");
    }

    const user = await prisma.auth.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        roles: true,
        isVerified: true,
        emailToken: true,
        otpExpiresAt: true,
        otp: true,
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    if (user.emailToken !== token) {
      throw new ApiError("Invalid token", 400);
    }

    await verifyAndUpdateUser(user, payload.otp);

    return { message: "Verified via link" };
  }
  // 🟡 CASE 2: OTP
  if (email && otp) {
    const user = await prisma.auth.findUnique({
      where: { email },
      select: {
        id: true,
        isVerified: true,
        otp: true,
        otpExpiresAt: true,
        roles: true,
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    await verifyAndUpdateUser(user, otp);

    return { message: "Verified via OTP" };
  }

  throw new ApiError("Provide token OR (email + otp)", 400);
};

export const resendVerificationCode = async (
  { email }: any,
  OTP_CONFIG: any,
) => {
  const user = await prisma?.auth.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      isVerified: true,
      roles: true,
    },
  });

  if (!user) {
    throw new ApiError("User not found", StatusCodes.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new ApiError("Email is already verified", StatusCodes.BAD_REQUEST);
  }

  //  Generate OTP
  const otp = AuthHelper.generateOtp();
  const hashedOtp = await AuthHelper.hashPassword(otp);
  const otpExpiresAt = new Date(
    Date.now() + OTP_CONFIG.expiresMinutes * 60 * 1000,
  );

  //  Generate email verification token (link)
  const emailToken = AuthHelper.generateInviteToken({
    id: user.id,
    email: user.email,
    otp,
    otpExpiresAt,
  });

  //  Update user in DB
  await prisma?.auth.update({
    where: { id: user.id },
    data: {
      otp: hashedOtp,
      otpExpiresAt,
      emailToken,
    },
  });

  // Create verification link
  const verifyUrl = `${config.OTP_BASE_URL}/auth/verify-email/${emailToken}`;

  const html = verificationEmailTemplate({
    verificationCode: otp || null,
    verifyUrl: verifyUrl || null,
    otpExpiresMinutes: OTP_CONFIG?.expiresMinutes || null,
  });
  // 5️⃣ Send email
  const result = await emailHelper({
    to: user.email,
    subject: "Verify your email",
    html,
  });

  if (!result?.accepted?.length) {
    throw new ApiError(
      "Failed to send verification email. Please try again later.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return {
    message: "Verification email has been resent with OTP + Link",
  };
};

export const loginUserService = async ({
  email,
  password,
  rememberMe = false,
  req,
}: {
  email: string;
  password: string;
  rememberMe?: boolean;
  req: Request;
}) => {
  //  Find user
  const user = await prisma?.auth.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      isVerified: true,
      isDeleted: true,
      lockUntil: true,
      status: true,
      password: true,
      failedLoginAttempts: true,
      roles: {
        include: {
          permissions: true,
        },
      },
      userPersonalInfo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      userSettings: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) throw new ApiError("Unauthorized", StatusCodes.UNAUTHORIZED);
  if (
    !user.isVerified &&
    user.roles.some(
      (role: { id: string; name: string }) => role.name === "INSTRUCTOR",
    )
  )
    return { message: "Pending, Waiting for admin approval" };
  if (!user.isVerified)
    throw new ApiError(
      "Please verify your email before logging in",
      StatusCodes.FORBIDDEN,
    );
  if (user.isDeleted)
    throw new ApiError("Your account has been deleted", StatusCodes.FORBIDDEN);
  if (user.lockUntil && new Date() < user.lockUntil) {
    throw new ApiError(
      `Account locked until ${user.lockUntil}`,
      StatusCodes.LOCKED,
    );
  }
  //  Check password
  const isMatch = await AuthHelper.comparePassword(password, user.password);
  if (!isMatch) {
    const newAttempts = user.failedLoginAttempts + 1;
    const isLocking = newAttempts >= config.LOGIN_FAILED_ATTEMPTS;

    await prisma?.auth.update({
      where: { email },
      data: {
        failedLoginAttempts: { increment: 1 },
        lockUntil: isLocking
          ? new Date(Date.now() + config.LOGIN_LOCKED_UNTIL * 60 * 1000)
          : null,
      },
    });

    const remainingAttempts = Math.max(
      config.LOGIN_FAILED_ATTEMPTS - newAttempts,
      0,
    );

    throw new ApiError(
      isLocking
        ? `Account locked for ${config.LOGIN_LOCKED_UNTIL} minutes due to too many failed attempts.`
        : `Invalid password! Attempt: ${newAttempts}, Remaining: ${remainingAttempts}`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  //  Generate access token
  const { password: _password, ...safeUser } = user;
  const accessToken = AuthHelper.generateAccessToken(safeUser);

  let refreshToken: string | null = null;
  let refreshOptions: any = null;

  const baseCookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : ("lax" as const),
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  // Only create persistent session and refresh token if rememberMe is enabled
  if (rememberMe) {
    const tokenFamily = await AuthHelper.generateTokenFamily();
    refreshToken = AuthHelper.generateRefreshToken({
      id: user.id,
      email: user.email,
      tokenFamily,
    }) as string;

    // Hash refresh token
    const hashedRefreshToken = await AuthHelper.hashToken(refreshToken as string);

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + config.REFRESH_TOKEN_COOKIE_EXPIRE_DAYS,
    );

    // Create session in database
    await prisma?.session.create({
      data: {
        authId: user.id,
        refreshTokenHash: hashedRefreshToken,
        tokenFamily,
        deviceName: req.body?.deviceName || "N/A",
        userAgent: req.headers["user-agent"] || "N/A",
        ipAddress:
          (typeof req.headers["x-forwarded-for"] === "string"
            ? req.headers["x-forwarded-for"].split(",")[0].trim()
            : Array.isArray(req.headers["x-forwarded-for"])
              ? req.headers["x-forwarded-for"][0]
              : undefined) ||
          req.socket.remoteAddress ||
          req.ip ||
          "N/A",
        fingerprintHash: "N/A",
        expiresAt,
        lastUsedAt: new Date(),
      },
    });

    refreshOptions = {
      ...baseCookieOptions,
      maxAge: config.REFRESH_TOKEN_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
    };
  }

  await prisma?.auth.update({
    where: { email },
    data: {
      failedLoginAttempts: 0,
      lockUntil: null,
    },
  });

  //  Remove sensitive user fields
  const { password: pw, ...userData } = user;

  const accessOptions = {
    ...baseCookieOptions,
    maxAge: config.JWT_ACCESS_TOKEN_EXPIRES_IN * 60 * 1000,
  };

  //  Return tokens + cookie options
  return {
    accessToken,
    refreshToken,
    user: userData,
    accessOptions,
    refreshOptions,
  };
};

export const refreshTokenService = async (token: string, req: any) => {
  // hash token
  const hashedToken = await AuthHelper.hashToken(token);

  //  verify JWT
  let payload;
  payload = AuthHelper.verifyRefreshToken(token);

  if (!payload || typeof payload !== "object")
    throw new ApiError("Invalid or expired refresh token", 401);

  // find session
  const session = await prisma?.session.findFirst({
    where: {
      refreshTokenHash: hashedToken,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  // reuse detection
  if (!session) {
    await prisma?.session.updateMany({
      where: {
        tokenFamily: payload.tokenFamily,
      },
      data: {
        isRevoked: true,
        revokeReason: "reuse_detected",
      },
    });

    throw new ApiError("Session compromised", 401);
  }

  const user = session.user;

  // generate tokens
  const newAccessToken = AuthHelper.generateAccessToken({
    id: user.id,
    email: user.email,
  });

  const newRefreshToken = AuthHelper.generateRefreshToken({
    id: user.id,
    tokenFamily: session.tokenFamily,
  });

  //  hash new refresh token
  const newHashedToken = await AuthHelper.hashToken(newRefreshToken as string);

  //  expiry
  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + config.REFRESH_TOKEN_COOKIE_EXPIRE_DAYS,
  );

  //  revoke old session
  await prisma?.session.update({
    where: { id: session.id },
    data: {
      isRevoked: true,
      revokeReason: "rotated",
      lastUsedAt: new Date(),
    },
  });

  // 8️⃣ create new session
  await prisma?.session.create({
    data: {
      authId: user.id,
      refreshTokenHash: newHashedToken,
      tokenFamily: session.tokenFamily,
      deviceName: req.body?.deviceName || "N/A",
      userAgent: req.headers["user-agent"] || "N/A",
      ipAddress:
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.socket.remoteAddress ||
        req.ip,
      fingerprintHash: "N/A",
      expiresAt,
      lastUsedAt: new Date(),
    },
  });

  // 9️⃣ return with cookie options
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessOptions: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    },
    refreshOptions: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: config.REFRESH_TOKEN_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
    },
  };
};

export const logoutSingleDeviceService = async (token: string) => {
  const payload = AuthHelper.verifyRefreshToken(token);
  if (!payload || typeof payload !== "object")
    throw new ApiError("Invalid or expired refresh token", 401);
  const session = await prisma?.session.updateMany({
    where: { tokenFamily: payload.tokenFamily, isRevoked: false },
    data: {
      isRevoked: true,
      revokeReason: "logout",
      lastUsedAt: new Date(),
    },
  });
  if (!session) {
    throw new ApiError("Session not found or already revoked", 404);
  }
};

export const logoutAllDevicesService = async (authId: string) => {
  await prisma?.session.updateMany({
    where: { authId, isRevoked: false },
    data: {
      isRevoked: true,
      revokeReason: "logout_all",
      lastUsedAt: new Date(),
    },
  });
};

export const forgotPasswordService = async (email: string) => {
  //  Find user
  const user = await prisma?.auth.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      isDeleted: true,
    },
  });
  // Always return success for security (email enumeration protection)
  if (!user || user.isDeleted) return true;

  //  Generate OTP + hashed OTP
  const otp = AuthHelper.generateOtp();
  const hashedOtp = await AuthHelper.hashPassword(otp);
  const otpExpiresAt = new Date(
    Date.now() + config.PASSWORD_RESET_EXPIRE_IN * 60 * 1000,
  );
  const emailToken = AuthHelper.generateResetPasswordLinkToken({
    email: user.email,
    otp,
    expiresAt: otpExpiresAt.toISOString(),
  });
  const hashedEmailToken = await AuthHelper.hashPassword(emailToken as string);

  //  Update user in DB
  await prisma?.auth.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedOtp,
      passwordResetExpiresAt: otpExpiresAt,
      emailToken: hashedEmailToken,
    },
  });

  //  Create reset link
  const resetUrl = `${process.env.OTP_BASE_URL}/auth/verify-forgot-password?token=${emailToken}`;

  //  Send email (OTP + link)
  const html = forgotPasswordEmailTemplate({
    name: user.email,
    otp,
    resetUrl,
    otpExpiresMinutes: config.PASSWORD_RESET_EXPIRE_IN,
    footer: "POLI Security Team",
  });

  const result = await emailHelper({
    to: user.email,
    subject: "🔐 Password Reset Request",
    html,
  });

  if (!result?.accepted?.length) {
    throw new ApiError(
      "Failed to send password reset email. Please try again later.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return true;
};

export const verifyForgotPasswordService = async ({
  token,
  email,
  otp,
}: {
  token: string;
  email: string;
  otp: string;
}) => {
  if (token) {
    const payload = await AuthHelper.verifyResetPasswordLinkToken(token);
    if (!payload || typeof payload !== "object")
      throw new ApiError("Invalid or expired token", 401);
    email = payload.email;
    otp = payload.otp;
  }

  const user = await prisma?.auth.findUnique({
    where: { email },
    select: {
      id: true,
      emailToken: true,
      passwordResetToken: true,
      passwordResetExpiresAt: true,
    },
  });
  if (!user) throw new ApiError("User not found", StatusCodes.NOT_FOUND);
  if (!user.passwordResetToken)
    throw new ApiError("No OTP request found", StatusCodes.BAD_REQUEST);
  if (token && user.emailToken) {
    const isValid = await AuthHelper.comparePassword(token, user.emailToken);
    if (!isValid) throw new ApiError("Invalid Token", StatusCodes.UNAUTHORIZED);
  }
  if (user.passwordResetExpiresAt && user.passwordResetExpiresAt < new Date())
    throw new ApiError("OTP has expired", StatusCodes.UNAUTHORIZED);

  const isValid = await AuthHelper.comparePassword(
    otp,
    user.passwordResetToken,
  );
  if (!isValid) throw new ApiError("Invalid OTP", StatusCodes.UNAUTHORIZED);

  const passwordResetToken = AuthHelper.generateResetToken();
  const hashedResetToken = AuthHelper.hashToken(passwordResetToken);
  const resetExpires = new Date(
    Date.now() + config.PASSWORD_RESET_EXPIRE_IN * 60 * 1000,
  );

  await prisma?.auth.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedResetToken,
      passwordResetExpiresAt: resetExpires,
    },
  });
  if (!token)
    return {
      message: "OTP verified successfully",
      passwordResetToken,
      expiresIn: `${config.PASSWORD_RESET_EXPIRE_IN} minutes`,
    };

  return {
    html: `
  <html>
  <head>
    <title>Reset Password</title>
    <link rel="stylesheet" href="/reset.css" />
  </head>

  <body>
    <div class="overlay">
      <div class="modal">
        <h2>Reset your password</h2>
        <p>Password must be 6+ chars, include upper, lower & special</p>

        <form method="POST" action="${process.env.OTP_BASE_URL}/auth/reset-password" id="resetForm">
          
          <input type="hidden" name="resetToken" value="${passwordResetToken}" />
          <input type="hidden" name="withMail" value="y" />

          <div class="field">
            <input type="password" id="newPassword" name="newPassword" placeholder="New Password" required />
            
            <svg id="toggleNew" class="eye" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12a5 5 0 110-10 5 5 0 010 10z"/>
            </svg>
          </div>

          <div class="field">
            <input type="password" id="confirmPassword" placeholder="Confirm Password" required />
            
            <svg id="toggleConfirm" class="eye" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12a5 5 0 110-10 5 5 0 010 10z"/>
            </svg>
          </div>

          <div id="error" class="error"></div>

          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>

  </body>
  </html>
  `,
  };
};

export const resetPasswordService = async ({
  newPassword,
  resetToken,
  withMail,
}: {
  newPassword: string;
  resetToken: string;
  withMail: string;
}) => {
  if (!resetToken) {
    throw new ApiError("Reset token is required", StatusCodes.BAD_REQUEST);
  }

  const hashedToken = AuthHelper.hashToken(resetToken);

  const user = await prisma?.auth.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      email: true,
      userPersonalInfo: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(
      "Invalid or expired reset token",
      StatusCodes.UNAUTHORIZED,
    );
  }

  const hashedPassword = await AuthHelper.hashPassword(newPassword);

  await prisma?.auth.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  const fullName =
    [user.userPersonalInfo?.firstName, user.userPersonalInfo?.lastName]
      .filter(Boolean)
      .join(" ") || user.email;

  const html = passwordChangedTemplate(fullName || "User");

  await emailHelper({
    to: user.email,
    subject: "🔒 Password Changed Successfully",
    message: "Your password has been changed successfully.",
    html,
  });

  if (withMail === "y")
    return {
      html: universalHTML(
        `Your password has been successfully updated. You can now sign in to your ${fullName} account.`,
      ),
    };

  return {
    message: `Your password has been successfully updated. You can now sign in to your ${fullName} account.`,
  };
};
