import nodemailer from "nodemailer";
import { logConsole } from "./log.console.js";
import { logError } from "./log.error.js";

export const emailHelper = async ({
  to,
  subject,
  message,
  html,
  next,
  replyTo,
}: any) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"No Reply" <${process.env.EMAIL_USER}>`,
      replyTo: replyTo,
      to,
      subject,
      text: message || "",
      html: html || "",
    };

    const result = await transporter.sendMail(mailOptions);
    logConsole("Email sent: " + result.messageId);
    return result;
  } catch (err) {
    logError(err);
    if (next) return next(err);
  }
};

/*
 * Note: Once we'll have the SMTP setup, we'll convert it to SMTP otherwise we'll use gmail service if hosting provider allows us
 */
