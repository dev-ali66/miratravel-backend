import prisma from "../../config/prisma.js";
import ApiError from "../../utils/api.error.js";
import { emailHelper } from "../../utils/email.helper.js";
import config from "../../config/index.js";

export const createInquiry = async (data: any) => {
  const inquiryNumber = `INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const inquiry = await (prisma as any).inquiry.create({
    data: {
      inquiryNumber,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      destination: data.destination || null,
      travelDate: data.travelDate || null,
      travelers: data.travelers || null,
      journeyTypes: Array.isArray(data.journeyTypes) ? data.journeyTypes : [],
      message: data.message || null,
    },
  });

  // Send Email Notification to Admin
  try {
    const adminEmail = config.EMAIL_USER || "info@miratravel.nl";
    const journeyTypesList = inquiry.journeyTypes && inquiry.journeyTypes.length > 0
      ? inquiry.journeyTypes.join(", ")
      : "Not specified";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2B3424; color: #F5EFE2; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px;">New Travel Inquiry Received</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Inquiry Ref: <strong>${inquiryNumber}</strong></p>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 35%;">Full Name:</td>
              <td style="padding: 8px 0;">${inquiry.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${inquiry.email}" style="color: #2B3424;">${inquiry.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">${inquiry.phone || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Destination:</td>
              <td style="padding: 8px 0;">${inquiry.destination || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Travel Date:</td>
              <td style="padding: 8px 0;">${inquiry.travelDate || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Number of Travelers:</td>
              <td style="padding: 8px 0;">${inquiry.travelers || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Journey Types:</td>
              <td style="padding: 8px 0;">${journeyTypesList}</td>
            </tr>
          </table>

          ${inquiry.message ? `
            <div style="margin-top: 20px; padding: 15px; background-color: #f9f8f6; border-left: 4px solid #2B3424; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #2B3424;">Vision / Special Requests:</h4>
              <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${inquiry.message}</p>
            </div>
          ` : ''}
        </div>
        <div style="background-color: #f4f4f4; padding: 12px; text-align: center; font-size: 12px; color: #777;">
          Sent automatically from Mira Travel Website Inquiry System
        </div>
      </div>
    `;

    await emailHelper({
      to: adminEmail,
      replyTo: inquiry.email,
      subject: `New Inquiry [${inquiryNumber}]: ${inquiry.fullName} - ${inquiry.destination || 'Plan your escape'}`,
      message: `New Inquiry from ${inquiry.fullName} (${inquiry.email})`,
      html: emailHtml,
    });
  } catch (emailErr) {
    console.error("Failed to send inquiry admin email notification:", emailErr);
  }

  return inquiry;
};

export const getInquiries = async (filters: any) => {
  const { status, search, page = 1, limit = 10 } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { deletedAt: null };
  if (status) where.status = status;

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { destination: { contains: search, mode: "insensitive" } },
      { inquiryNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const [inquiries, total] = await Promise.all([
    (prisma as any).inquiry.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    }),
    (prisma as any).inquiry.count({ where }),
  ]);

  return { data: inquiries, total, page: Number(page), limit: Number(limit) };
};

export const updateInquiry = async (id: string, data: any) => {
  const existing = await (prisma as any).inquiry.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new ApiError("Inquiry not found", 404);
  }

  return await (prisma as any).inquiry.update({
    where: { id },
    data,
  });
};

export const deleteInquiry = async (id: string) => {
  const existing = await (prisma as any).inquiry.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new ApiError("Inquiry not found", 404);
  }

  return await (prisma as any).inquiry.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
