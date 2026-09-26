import { z } from "zod";
import config from "../../config/index.js";

const otpLength = config.OTP_LENGTH || 4;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  );

const emailSchema = z.string().email("Please provide a valid email");
const roleSchema = z.enum(["manager", "partner", "admin"], {
  message: "Role must be either manager, partner, or admin",
});

// invite schema
export const inviteSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),

    role: z.enum(["user", "partner", "admin", "manager"], {
      message: "Invalid role",
    }),

    name: z.string("Name is required").min(1, "Name cannot be empty"),

    phone: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be at most 15 digits")
      .optional(),
  }),
});

// Access Request schema - FIXED STRUCTURE

export const accessRequestSchemaValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    companyName: z.string().optional(),
    operatingCompany: z.string().optional(),
    terminalLocation: z.string().optional(),
    numberOfDriver: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    status: z.enum(["PENDING", "APPROVED", "DENIED"]).optional(),
  }),
});
export const accessRequestDriverSchemaValidator = z.object({
  body: z.object({
    id: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    status: z.enum(["PENDING", "APPROVED", "DENIED"]).optional(),
  }),
});

// Register schema - FIXED STRUCTURE
export const registerSchema = z.object({
  body: z.object({
    email: z.string().optional(),
    password: passwordSchema,
    firstName: z.string().max(100, "Max 100 carecter").optional(),
    lastName: z.string().max(100, "Max 100 carecter").optional(),
    roles: z.enum(["USER", "EDITOR", "MANAGER"]).default("USER"),
    termsAccepted: z.literal(true, {
      message: "You must accept the terms and conditions to register",
    }),
  }),
});
export const inviteRegisterSchema = z.object({
  body: z.object({
    password: passwordSchema,
  }),
  params: z.object({
    token: z.string().optional(),
  }),
});

// Verify Email Schema
export const verifyEmailSchema = z
  .object({
    params: z.object({
      token: z.string().optional(),
    }),
    query: z.object({
      token: z.string().optional(),
    }),
    body: z.object({
      email: z.string().email().optional(),
      otp: z.string().length(otpLength).optional(),
    }),
  })
  .refine(
    (data) =>
      data.params.token ||
      data.query.token ||
      (data.body.email && data.body.otp),
    {
      message: "Provide token OR (email + otp)",
      path: ["body"],
    },
  );

// // Resend Verification Code Schema
export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string("Email is required").email("Invalid email address"),
  }),
});

// // Login schema - FIXED STRUCTURE
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    rememberMe: z.boolean().optional().default(false),
  }),
});

// Logout schema
export const logoutSchema = z.object({
  body: z.object({
    allDevices: z.boolean().optional().default(false),
    refreshToken: z.string().optional(),
  }),
});

// // Change password schema - FIXED STRUCTURE
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  }),
});

// // Reset password schema - FIXED STRUCTURE
export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, "Reset token is required"),
    newPassword: passwordSchema,
    withMail: z.string().default("n"),
  }),
});

// // Forgot password schema - FIXED STRUCTURE
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const verifyForgotPasswordViaLinkSchema = z
  .object({
    query: z.object({
      token: z.string().optional(),
    }),
    body: z.object({
      email: z.string().email("Please provide valid email").optional(),
      otp: z
        .string()
        .min(otpLength, `Must be ${otpLength} digit`)
        .max(otpLength, `Max length ${otpLength}`)
        .optional(),
    }),
  })
  .refine(
    (data) => {
      const hasToken = !!data.query.token;
      const hasEmailOtp = !!data.body.email && !!data.body.otp;

      return hasToken || hasEmailOtp;
    },
    {
      message: "Provide either token OR (email + otp)",
      path: ["query", "token"], // error location (optional)
    },
  );

// // Verify OTP schema - FIXED STRUCTURE
export const verifyOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z.string().length(otpLength, `OTP must be ${otpLength} digits`),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().max(100).optional().nullable(),
    lastName: z.string().max(50).optional().nullable(),
    phone: z.string().max(50).optional().nullable(),
    address: z.string().max(255).optional().nullable(),
    country: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    zipCode: z.string().max(30).optional().nullable(),
    zip: z.string().max(30).optional().nullable(),
    nationality: z.string().max(100).optional().nullable(),
    dateOfBirth: z.string().max(50).optional().nullable(),
    about: z.string().max(500).optional().nullable(),
    photoUrl: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    // Travel Preferences fields
    pace: z.string().max(50).optional().nullable(),
    accommodations: z.union([z.array(z.string()), z.string()]).optional().nullable(),
    foodDietary: z.union([z.array(z.string()), z.string()]).optional().nullable(),
    foodNotes: z.string().max(500).optional().nullable(),
    interests: z.union([z.array(z.string()), z.string()]).optional().nullable(),
    practicalNeeds: z.union([z.array(z.string()), z.string()]).optional().nullable(),
    practicalNotes: z.string().max(500).optional().nullable(),
    generalNotes: z.string().max(1000).optional().nullable(),
    travelPreferences: z.any().optional().nullable(),
  }),
});
