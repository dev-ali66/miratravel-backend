import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import config from "../config/index.js";

class AuthHelper {
  // JWT Token Methods
  static generateInviteToken(payload: object) {
    if (payload && config.JWT_INVITE_TOKEN_SECRET)
      return jwt.sign(payload, config.JWT_INVITE_TOKEN_SECRET, {
        expiresIn: `${config.JWT_INVITE_TOKEN_EXPIRES_IN}m`,
      });
  }

  static verifyInviteToken(token: string) {
    try {
      if (token && config.JWT_INVITE_TOKEN_SECRET)
        return jwt.verify(token, config.JWT_INVITE_TOKEN_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  // JWT Token Methods
  static generateResetPasswordLinkToken(payload: object) {
    if (payload && config.JWT_INVITE_TOKEN_SECRET)
      return jwt.sign(payload, config.JWT_INVITE_TOKEN_SECRET, {
        expiresIn: `${config.JWT_INVITE_TOKEN_EXPIRES_IN}m`,
      });
  }

  static verifyResetPasswordLinkToken(token: string) {
    try {
      if (token && config.JWT_INVITE_TOKEN_SECRET)
        return jwt.verify(token, config.JWT_INVITE_TOKEN_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  static generateAccessToken(payload: object) {
    if (payload && config.JWT_ACCESS_TOKEN_SECRET)
      return jwt.sign(payload, config.JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: `${config.JWT_ACCESS_TOKEN_EXPIRES_IN}m`,
      });
  }

  static verifyAccessToken(token: any) {
    try {
      if (token && config.JWT_ACCESS_TOKEN_SECRET)
        return jwt.verify(token, config.JWT_ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  static generateRefreshToken(payload: object) {
    if (payload && config.JWT_REFRESH_TOKEN_SECRET)
      return jwt.sign(payload, config.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: `${config.JWT_REFRESH_TOKEN_EXPIRES_IN}m`,
      });
  }

  static verifyRefreshToken(token: string) {
    try {
      if (token && config.JWT_REFRESH_TOKEN_SECRET)
        return jwt.verify(token, config.JWT_REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  // Password Methods
  static async hashPassword(password: string) {
    return await bcrypt.hash(password, config.BCRYPT_SALT);
  }
  static async comparePassword(
    candidatePassword: string,
    hashedPassword: string,
  ) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Tokens Methods

  static hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  static compareToken(candidateToken: string, hashedToken: string) {
    return (
      crypto.createHash("sha256").update(candidateToken).digest("hex") ===
      hashedToken
    );
  }

  // static async hashToken(token) {
  //   return await bcrypt.hash(token, config.BCRYPT_SALT);
  // }

  // static async compareToken(candidateToken, hashedToken) {
  //   return await bcrypt.compare(candidateToken, hashedToken);
  // }

  // Reset Token Methods
  static generateResetToken() {
    return crypto.randomBytes(32).toString("hex");
  }
  //  Token Family Methods
  static generateTokenFamily() {
    return crypto.randomBytes(32).toString("hex");
  }

  // OTP Methods
  static generateOtp(length: number = config.OTP_LENGTH || 4) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length);
    return Math.floor(crypto.randomInt(min, max)).toString();
  }
}

export default AuthHelper;
