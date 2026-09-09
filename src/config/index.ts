import dotenvFlow from "dotenv-flow";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  try {
    dotenvFlow.config({
      path: path.resolve(process.cwd()),
      silent: true,
    });
  } catch (error) {
    console.log("Dotenv flow config failed, using process.env directly");
  }
}

const config = {
  NODE_ENV: process.env.NODE_ENV || "production",
  PORT: Number(process.env.PORT) || 5010,
  DATABASE_URL: process.env.DATABASE_URL,
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(",").map((o) =>
    o.trim(),
  ) || [
    "http://localhost:5173",
    "http://localhost",
    "http://172.16.200.233:5173",
  ],

  SOCKET_ALLOWED_ORIGINS:
    process.env.SOCKET_ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [],

  BCRYPT_SALT: Number(process.env.BCRYPT_JS_SALT_ROUNDS) || 12,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRES_IN:
    Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN) || 15,

  JWT_INVITE_TOKEN_SECRET: process.env.JWT_INVITE_TOKEN_SECRET,
  JWT_INVITE_TOKEN_EXPIRES_IN:
    Number(process.env.JWT_INVITE_TOKEN_EXPIRES_IN) || 60,

  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_EXPIRES_IN:
    Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) || 30 * 60 * 24,
  IS_PRODUCTION: process.env.NODE_ENV === "production",

  REFRESH_TOKEN_COOKIE_EXPIRE_DAYS:
    Number(process.env.REFRESH_TOKEN_COOKIE_EXPIRE_DAYS) || 15,

  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM:
    process.env.EMAIL_FROM || `"No Reply" <${process.env.EMAIL_USER}>`,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_TIMEOUT: Number(process.env.REDIS_TIMEOUT) || 500,

  API_VERSION: process.env.API_VERSION,
  OTP_EXPIRE_MINUTE: Number(process.env.OTP_EXPIRE_MINUTE) || 10,
  OTP_BASE_URL: process.env.OTP_BASE_URL,

  PASSWORD_RESET_EXPIRE_IN: Number(process.env.PASSWORD_RESET_EXPIRE_IN) || 10,

  LOGIN_FAILED_ATTEMPTS: Number(process.env.LOGIN_FAILED_ATTEMPTS) || 5,
  LOGIN_LOCKED_UNTIL: Number(process.env.LOGIN_LOCKED_UNTIL) || 15,

  DIRECT_REGISTER: process.env.DIRECT_REGISTER || "TRUE",
  TOKEN_REGISTER: process.env.TOKEN_REGISTER || "TRUE",

  PASSWORD_LENGTH: Number(process.env.PASSWORD_LENGTH) || 8,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
};

export default config;
