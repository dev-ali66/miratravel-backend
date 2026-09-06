// export const verificationEmailTemplate = ({
//   verificationCode,
//   verifyUrl,
//   otpExpiresMinutes,
// }) => `
// <div style="font-family: Arial; padding: 40px;">
//   <h2>Welcome to POLI 🚀</h2>

//   ${
//     verifyUrl
//       ? `
//       <h3>✅ Verify via Link</h3>
//       <a href="${verifyUrl}"
//          style="background:#51946D;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
//          Verify Email
//       </a>
//     `
//       : ""
//   }

//   ${
//     verificationCode
//       ? `
//       <h3 style="margin-top:20px;">🔐 OTP Code</h3>
//       <div style="font-size:24px;letter-spacing:5px;font-weight:bold;">
//         ${verificationCode}
//       </div>
//       <p>Expires in ${otpExpiresMinutes || 10} minutes</p>
//     `
//       : ""
//   }

//   ${
//     !verifyUrl && !verificationCode
//       ? `<p>No verification method available</p>`
//       : ""
//   }

// </div>
// `;

// export const forgotPasswordEmailTemplate = ({
//   name = "User",
//   otp,
//   resetUrl,
//   otpExpiresMinutes,
//   footer = "POLI Security Team",
// }) => `
// <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
//   <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">

//     <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">POLI</h2>
//     <p style="color: #6b7280; font-size: 14px; text-align: right;">
//       ${new Date()
//         .toLocaleString("en-GB", {
//           day: "2-digit",
//           month: "long",
//           year: "numeric",
//           hour: "numeric",
//           minute: "2-digit",
//           hour12: true,
//         })
//         .replace(",", " at")}
//     </p>

//     <h2 style="color: #1e293b; margin-bottom: 20px;">Password Reset Request 🔐</h2>
//     <p style="font-size: 16px; color: #111827;">Dear <strong>${name}</strong>,</p>
//     <p style="font-size: 16px; color: #111827; margin-top: 8px;">
//       You requested to reset your password. Use the following method(s) to reset it:
//     </p>

//     ${
//       resetUrl
//         ? `
//         <h3 style="margin-top:20px;">✅ Reset via Link</h3>
//         <a href="${resetUrl}"
//            style="background:#51946D;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
//            Reset Password
//         </a>
//       `
//         : ""
//     }

//     ${
//       otp
//         ? `
//         <h3 style="margin-top:20px;">🔑 OTP Code</h3>
//         <div style="font-size:24px;letter-spacing:5px;font-weight:bold; color: #333;">
//           ${otp}
//         </div>
//         <p>Expires in ${otpExpiresMinutes || 10} minutes</p>
//       `
//         : ""
//     }

//     ${!resetUrl && !otp ? `<p>No reset method available</p>` : ""}

//     <p style="margin-top:30px; font-size:12px; color:#777;">
//       If you did not request a password reset, you can safely ignore this email.
//     </p>
//     <p style="margin-top:10px; color:#6b7280;">${footer}</p>

//   </div>
// </div>
// `;

// export const inviteUserGreetingEmailTemplate = ({
//   companyName,
//   operatingCompany,
//   terminalLocation,
//   firstName,
//   lastName,
//   email,
//   phone,
//   status,
//   role,
//   otp,
//   otpExpiresAt,
//   verifyUrl,
//   footer = "POLI Security Team",
// }) => {
//   const fullName = `${firstName || ""} ${lastName || ""}`.trim();

//   return `
//   <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
//     <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 40px;">

//       <h2 style="color:#51946D;">${companyName}</h2>

//       <h2 style="margin-top: 10px;">✨ You're Invited!</h2>

//       <p>Hello <strong>${fullName || "User"}</strong>,</p>

//       <p>
//         You are invited </strong>
//         as a <strong>${role || status}</strong>.
//       </p>

//       <div style="background:#f3f4f6; padding:15px; border-radius:8px; margin:20px 0;">
//         <p><b>Name:</b> ${fullName}</p>
//         <p><b>Email:</b> ${email}</p>
//         <p><b>Phone:</b> ${phone || "-"}</p>
//         <p><b>Role:</b> ${role || "-"}</p>
//         ${terminalLocation ? `<p><b>Location:</b> ${terminalLocation}</p>` : ""}
//       </div>

//       ${
//         otp
//           ? `
//         <p style="margin-top:20px;">🔐 Your OTP Code:</p>
//         <div style="font-size:24px; font-weight:bold; letter-spacing:5px; background:#111827; color:#fff; padding:10px 20px; display:inline-block; border-radius:6px;">
//           ${otp}
//         </div>
//       `
//           : ""
//       }

//       ${
//         verifyUrl
//           ? `
//         <div style="text-align:center; margin:30px 0;">
//           <a href="${verifyUrl}" target="_blank"
//             style="background:#51946D; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">
//             Verify & Create Account
//           </a>
//         </div>
//       `
//           : ""
//       }

//       ${
//         otpExpiresAt
//           ? `<p style="font-size:14px; color:#6b7280;">⏳ OTP expires at: <strong>${otpExpiresAt}</strong></p>`
//           : ""
//       }

//       <p style="margin-top:20px; color:#6b7280;">
//         If you didn’t request this, just ignore this email.
//       </p>

//       <p style="margin-top:30px;">Warm regards,</p>
//       <p>${footer}</p>

//     </div>
//   </div>
//   `;
// };

// export const inviteDriverEmailTemplate = ({
//   companyName,
//   contractorName,
//   firstName,
//   lastName,
//   email,
//   phone,
//   role = "DRIVER",
//   verifyUrl,
//   inviteExpiresAt,
//   footer = "POLI Security Team",
// }) => {
//   const fullName = `${firstName || ""} ${lastName || ""}`.trim();

//   return `
//   <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">

//     <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 40px;">

//       <h2 style="color:#51946D;">${companyName || "Company"}</h2>

//       <h2 style="margin-top: 10px;">🚚 Driver Invitation</h2>

//       <p>Hello <strong>${fullName || "Driver"}</strong>,</p>

//       <p>
//         You have been invited by <strong>${contractorName || "your instructorInfo"}</strong>
//         to join as a <strong>${role}</strong>.
//       </p>

//       <div style="background:#f3f4f6; padding:15px; border-radius:8px; margin:20px 0;">
//         <p><b>Name:</b> ${fullName}</p>
//         <p><b>Email:</b> ${email}</p>
//         <p><b>Phone:</b> ${phone || "-"}</p>
//         <p><b>Role:</b> ${role}</p>
//       </div>

//       ${
//         verifyUrl
//           ? `
//         <div style="text-align:center; margin:30px 0;">
//           <a href="${verifyUrl}" target="_blank"
//             style="background:#51946D; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">
//             Accept Invitation & Create Account
//           </a>
//         </div>
//       `
//           : ""
//       }

//       ${
//         inviteExpiresAt
//           ? `<p style="font-size:14px; color:#6b7280;">
//               ⏳ This invitation expires at: <strong>${inviteExpiresAt}</strong>
//              </p>`
//           : ""
//       }

//       <p style="margin-top:20px; color:#6b7280;">
//         If you did not expect this invitation, you can safely ignore this email.
//       </p>

//       <p style="margin-top:30px;">Best regards,</p>
//       <p>${footer}</p>

//     </div>
//   </div>
//   `;
// };

// export const otpEmailTemplate = ({
//   title = "Your One-Time Password",
//   otp,
//   expiresMinutes = 15,
//   footer = `POLI Security Team`,
//   name = "User",
// }) => `
//   <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
//     <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
//       <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">POLI</h2>
//       <p style="color: #6b7280; font-size: 14px; text-align: right;">
//       ${new Date()
//         .toLocaleString("en-GB", {
//           day: "2-digit",
//           month: "long",
//           year: "numeric",
//           hour: "numeric",
//           minute: "2-digit",
//           hour12: true,
//         })
//         .replace(",", " at")}
//       </p>
//       <h2 style="color: #1e293b; margin-bottom: 30px;">${title}</h2>
//       <p style="font-size: 16px; color: #111827;">Dear <strong>${name}</strong>,</p>
//       <p style="font-size: 16px; color: #111827; margin-top: 8px;">Here is your One-Time Password to securely log in to your CM Exchange account:</p>
//       <h1 style="font-size: 32px; color: #51946D; margin: 30px 0;">${otp}</h1>
//       <p style="color: #4b5563;">Note: This OTP is valid for ${expiresMinutes} minutes.</p>
//       <p style="margin-top: 30px; color: #6b7280;">If you did not request this OTP, please disregard this email or contact our support team.</p>
//       <p style="margin-top: 40px; color: #1f2937;">Thank you for staying with us!</p>
//       <p style="margin-top: 10px; color: #6b7280;">${footer}</p>
//     </div>
//   </div>
// `;
// export const welcomeEmailTemplate = ({
//   name = "User",
//   email,
//   phone,
//   role,
//   footer = "POLI Team",
// }) => `
//   <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
//     <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
//       <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">POLI</h2>

//       <p style="color: #6b7280; font-size: 14px; text-align: right;">
//         ${new Date()
//           .toLocaleString("en-GB", {
//             day: "2-digit",
//             month: "long",
//             year: "numeric",
//             hour: "numeric",
//             minute: "2-digit",
//             hour12: true,
//           })
//           .replace(",", " at")}
//       </p>

//       <h2 style="color: #1e293b; margin-bottom: 30px;">🎉 Welcome to POLI!</h2>

//       <p style="font-size: 16px; color: #111827;">Hello <strong>${name}</strong>,</p>

//       <p style="font-size: 16px; color: #111827; margin-top: 8px;">
//         Congratulations! Your account has been successfully created and is now active.
//       </p>

//       <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 25px 0;">
//         <p style="margin: 4px 0; color: #1f2937;"><strong>Email:</strong> ${email}</p>
//         <p style="margin: 4px 0; color: #1f2937;"><strong>Phone:</strong> ${phone || "N/A"}</p>
//         <p style="margin: 4px 0; color: #1f2937;"><strong>Role:</strong> ${role}</p>
//       </div>

//       <p style="color: #4b5563; margin-top: 20px;">
//         You can now log in and start exploring all the features POLI has to offer.
//       </p>

//       <p style="margin-top: 40px; color: #1f2937;">Welcome aboard,</p>
//       <p style="margin-top: 10px; color: #6b7280;">${footer}</p>
//     </div>
//   </div>
// `;

// export const passwordChangedTemplate = (
//   name = "User",
//   footer = `POLI Security Team`,
// ) => `
//   <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
//     <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
//       <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">POLI</h2>
//       <p style="color: #6b7280; font-size: 14px; text-align: right;">
//         ${new Date()
//           .toLocaleString("en-GB", {
//             day: "2-digit",
//             month: "long",
//             year: "numeric",
//             hour: "numeric",
//             minute: "2-digit",
//             hour12: true,
//           })
//           .replace(",", " at")}
//       </p>
//       <h2 style="color: #1e293b; margin-bottom: 30px;">Password Changed Successfully</h2>
//       <p style="font-size: 16px; color: #111827;">Dear <strong>${name}</strong>,</p>
//       <p style="font-size: 16px; color: #111827; margin-top: 8px;">
//         We wanted to let you know that your account password has been changed successfully.
//         If you did not make this change, please contact our support team immediately.
//       </p>
//       <p style="margin-top: 40px; color: #1f2937;">Thank you for staying with us!</p>
//       <p style="margin-top: 10px; color: #6b7280;">${footer}</p>
//     </div>
//   </div>
// `;

// export const rejectionEmailTemplate = ({
//   name = "User",
//   reason,
//   footer = "POLI Support Team",
// }) => `
//   <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
//     <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
//       <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">POLI<span style="color:black">ceu</span></h2>
//       <p style="color: #6b7280; font-size: 14px; text-align: right;">
//         ${new Date()
//           .toLocaleString("en-GB", {
//             day: "2-digit",
//             month: "long",
//             year: "numeric",
//             hour: "numeric",
//             minute: "2-digit",
//             hour12: true,
//           })
//           .replace(",", " at")}
//       </p>
//       <h2 style="color: #1e293b; margin-bottom: 30px;">Identity Verification Update</h2>
//       <p style="font-size: 16px; color: #111827;">Dear <strong>${name}</strong>,</p>
//       <p style="font-size: 16px; color: #111827; margin-top: 8px;">
//         Thank you for submitting your identity verification. After careful review, we were unable to approve your verification at this time.
//       </p>
//       <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 30px 0;">
//         <p style="margin: 0 0 10px 0; color: #7f1d1d;"><strong>Reason:</strong></p>
//         <p style="margin: 0; color: #991b1b;">${reason}</p>
//       </div>
//       <p style="color: #4b5563; margin-top: 30px;">
//         You can submit a new verification request by ensuring:
//       </p>
//       <ul style="color: #4b5563; line-height: 1.8;">
//         <li>All document images are clear and legible</li>
//         <li>The document is valid and not expired</li>
//         <li>All information matches your profile details</li>
//         <li>Both front and back images are provided (for userInfo's license)</li>
//       </ul>
//       <p style="color: #4b5563; margin-top: 20px;">
//         If you have questions or need assistance, please don't hesitate to contact our support team.
//       </p>
//       <p style="margin-top: 40px; color: #1f2937;">Best regards,</p>
//       <p style="margin-top: 10px; color: #6b7280;">${footer}</p>
//     </div>
//   </div>
// `;
// export const universalHTML = (message = "Done") => `
// <!DOCTYPE html>
// <html>
// <head>
//   <title>Verification</title>
//   <style>
//     * {
//       margin: 0;
//       padding: 0;
//       box-sizing: border-box;
//       font-family: Inter, system-ui, -apple-system, sans-serif;
//     }

//     body {
//       height: 100vh;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       background: #0b0f19;
//       color: #e6edf3;
//     }

//     .card {
//       padding: 40px 48px;
//       border-radius: 14px;
//       text-align: center;
//       min-width: 340px;

//       background: rgba(255, 255, 255, 0.03);
//       backdrop-filter: blur(8px);
//       border: 1px solid rgba(255,255,255,0.06);

//       box-shadow:
//         0 10px 25px rgba(0,0,0,0.4),
//         0 0 0 1px rgba(255,255,255,0.02);

//       animation: fade 0.35s ease;
//     }

//     @keyframes fade {
//       from {
//         opacity: 0;
//         transform: translateY(8px);
//       }
//       to {
//         opacity: 1;
//         transform: translateY(0);
//       }
//     }

//     h2 {
//       font-size: 18px;
//       font-weight: 500;
//       letter-spacing: 0.2px;
//       margin-bottom: 8px;
//     }

//     p {
//       font-size: 13px;
//       color: #8b949e;
//     }

//   </style>
// </head>
// <body>

//   <div class="card">
//     <h2>${message}</h2>
//     <p>You can close this tab.</p>
//   </div>

// </body>
// </html>
// `;

export const verificationEmailTemplate = ({
  verificationCode,
  verifyUrl,
  otpExpiresMinutes,
}: any): string => `
<div style="font-family: Arial; padding: 40px;">
  <h2>Welcome to POLI 🚀</h2>

  ${
    verifyUrl
      ? `
      <h3>✅ Verify via Link</h3>
      <a href="${verifyUrl}" 
         style="background:#51946D;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
         Verify Email
      </a>
    `
      : ""
  }

  ${
    verificationCode
      ? `
      <h3 style="margin-top:20px;">🔐 OTP Code</h3>
      <div style="font-size:24px;letter-spacing:5px;font-weight:bold;">
        ${verificationCode}
      </div>
      <p>Expires in ${otpExpiresMinutes || 10} minutes</p>
    `
      : ""
  }

  ${
    !verifyUrl && !verificationCode
      ? `<p>No verification method available</p>`
      : ""
  }
</div>
`;

export const forgotPasswordEmailTemplate = ({
  name = "User",
  otp,
  resetUrl,
  otpExpiresMinutes,
  footer = "POLI Security Team",
}: any): string => `
<div style="font-family: Arial; padding: 40px; background-color: #f9f9fb;">
  <div style="max-width: 600px; margin: auto; background: #fff; padding: 40px;">
    
    <h2>POLI</h2>
    <h2>Password Reset Request 🔐</h2>

    <p>Dear <strong>${name}</strong></p>

    ${
      resetUrl
        ? `
        <a href="${resetUrl}" 
           style="background:#51946D;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
           Reset Password
        </a>
      `
        : ""
    }

    ${
      otp
        ? `
        <h3>OTP</h3>
        <div style="font-size:24px;font-weight:bold;">${otp}</div>
        <p>Expires in ${otpExpiresMinutes || 10} minutes</p>
      `
        : ""
    }

    ${!resetUrl && !otp ? `<p>No reset method available</p>` : ""}

    <p>${footer}</p>
  </div>
</div>
`;

export const inviteUserGreetingEmailTemplate = ({
  companyName,
  firstName,
  lastName,
  email,
  phone,
  status,
  role,
  otp,
  otpExpiresAt,
  verifyUrl,
  footer = "POLI Security Team",
}: any): string => {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  return `
  <div style="font-family: Arial;">
    <h2>${companyName}</h2>

    <h2>✨ You're Invited!</h2>

    <p>Hello <strong>${fullName || "User"}</strong></p>

    <div>
      <p>Email: ${email}</p>
      <p>Phone: ${phone || "-"}</p>
      <p>Role: ${role || status || "-"}</p>
    </div>

    ${
      otp
        ? `
        <div><b>OTP:</b> ${otp}</div>
      `
        : ""
    }

    ${
      verifyUrl
        ? `
        <a href="${verifyUrl}">Verify Account</a>
      `
        : ""
    }

    ${otpExpiresAt ? `<p>Expires: ${otpExpiresAt}</p>` : ""}

    <p>${footer}</p>
  </div>
  `;
};

export const inviteDriverEmailTemplate = ({
  companyName,
  contractorName,
  firstName,
  lastName,
  email,
  phone,
  role = "DRIVER",
  verifyUrl,
  inviteExpiresAt,
  footer = "POLI Security Team",
}: any): string => {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  return `
  <div style="font-family: Arial;">
    <h2>${companyName || "Company"}</h2>

    <h2>🚚 Driver Invitation</h2>

    <p>Hello ${fullName || "Driver"}</p>

    <p>
      Invited by <b>${contractorName || "Team"}</b>
      as <b>${role}</b>
    </p>

    <p>Email: ${email}</p>
    <p>Phone: ${phone || "-"}</p>

    ${
      verifyUrl
        ? `
        <a href="${verifyUrl}">Accept Invitation</a>
      `
        : ""
    }

    ${inviteExpiresAt ? `<p>Expires: ${inviteExpiresAt}</p>` : ""}

    <p>${footer}</p>
  </div>
  `;
};

export const otpEmailTemplate = ({
  title = "Your One-Time Password",
  otp,
  expiresMinutes = 15,
  footer = "POLI Security Team",
  name = "User",
}: any): string => `
<div>
  <h2>${title}</h2>
  <p>Dear ${name}</p>

  <h1>${otp}</h1>
  <p>Expires in ${expiresMinutes} minutes</p>

  <p>${footer}</p>
</div>
`;

export const welcomeEmailTemplate = ({
  name = "User",
  email,
  phone,
  role,
  footer = "POLI Team",
}: any): string => `
<div>
  <h2>🎉 Welcome ${name}</h2>

  <p>Email: ${email}</p>
  <p>Phone: ${phone || "N/A"}</p>
  <p>Role: ${role}</p>

  <p>${footer}</p>
</div>
`;

export const passwordChangedTemplate = (
  name = "User",
  footer = "POLI Security Team",
): string => `
<div>
  <h2>Password Changed</h2>
  <p>Dear ${name}</p>
  <p>Password updated successfully.</p>
  <p>${footer}</p>
</div>
`;

export const rejectionEmailTemplate = ({
  name = "User",
  reason,
  footer = "POLI Support Team",
}: any): string => `
<div>
  <h2>Verification Failed</h2>

  <p>Dear ${name}</p>

  <p><b>Reason:</b> ${reason}</p>

  <p>${footer}</p>
</div>
`;

export const universalHTML = (message = "Done"): string => `
<!DOCTYPE html>
<html>
<body>
  <div>
    <h2>${message}</h2>
    <p>You can close this tab.</p>
  </div>
</body>
</html>
`;
