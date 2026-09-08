import { Request } from "express";
import prisma from "../../config/prisma.js";

export const getDashboardStatisticsService = async (req: Request) => {
  // Run database aggregations in parallel
  const [
    totalBookings,
    allBookings,
    totalUsers,
    activeUsers,
    verifiedUsers,
    totalJourneys,
    totalStories,
    totalCountries,
    totalPlaces,
    allPaymentRecords,
  ] = await Promise.all([
    prisma.booking.count({ where: { deletedAt: null } }),
    prisma.booking.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        journey: {
          select: { id: true, title: true, price: true },
        },
        auth: {
          select: {
            id: true,
            email: true,
            userPersonalInfo: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    }),
    prisma.auth.count({ where: { isDeleted: false } }),
    prisma.auth.count({ where: { isDeleted: false, status: "ACTIVE" } }),
    prisma.auth.count({ where: { isDeleted: false, isVerified: true } }),
    prisma.journey.count({ where: { deletedAt: null } }),
    prisma.story.count({ where: { deletedAt: null } }),
    prisma.countryPage.count({ where: { deletedAt: null } }),
    prisma.placePage.count({ where: { deletedAt: null } }),
    prisma.paymentRecord.findMany({
      where: { status: "SUCCEEDED" },
      select: { amount: true, currency: true, paymentDate: true },
    }),
  ]);

  // Compute total gross revenue (sum of paid bookings & payment records)
  let totalRevenue = 0;
  for (const b of allBookings) {
    const paid = Number(b.paidAmount || 0);
    if (paid > 0) {
      totalRevenue += paid;
    } else if (b.bookingStatus === "CONFIRMED" || b.paymentStatus === "FULLY_PAID") {
      totalRevenue += Number(b.confirmedTotal || 0);
    }
  }

  // If there are recorded payments, add any difference
  for (const pr of allPaymentRecords) {
    const pAmt = Number(pr.amount || 0);
    if (pAmt > 0 && totalRevenue === 0) {
      totalRevenue += pAmt;
    }
  }

  // Monthly stats map (Jan - Dec)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueByMonth = new Array(12).fill(0);
  const bookingsByMonth = new Array(12).fill(0);

  for (const b of allBookings) {
    const bDate = new Date(b.createdAt);
    const month = bDate.getMonth();
    bookingsByMonth[month] += 1;

    const paid = Number(b.paidAmount || 0);
    if (paid > 0) {
      revenueByMonth[month] += paid;
    } else if (b.bookingStatus === "CONFIRMED" || b.paymentStatus === "FULLY_PAID") {
      revenueByMonth[month] += Number(b.confirmedTotal || 0);
    }
  }

  const revenueOverview = monthNames.map((name, idx) => ({
    name,
    total: Math.round(revenueByMonth[idx]),
  }));

  const monthlyBookings = monthNames.map((name, idx) => ({
    name,
    total: bookingsByMonth[idx],
  }));

  // Status breakdown
  const confirmedBookings = allBookings.filter(
    (b) => b.bookingStatus === "CONFIRMED" || b.paymentStatus === "FULLY_PAID"
  ).length;

  const underReviewBookings = allBookings.filter(
    (b) => b.bookingStatus === "UNDER_REVIEW" || b.bookingStatus === "REQUEST_SUBMITTED"
  ).length;

  const depositDueBookings = allBookings.filter(
    (b) =>
      b.bookingStatus === "APPROVED" ||
      b.bookingStatus === "AWAITING_DEPOSIT" ||
      b.bookingStatus === "AWAITING_FINAL_PAYMENT" ||
      b.paymentStatus === "DEPOSIT_PAID" ||
      b.paymentStatus === "PARTIALLY_PAID"
  ).length;

  const cancelledBookings = allBookings.filter(
    (b) => b.bookingStatus === "CANCELLED" || b.bookingStatus === "REJECTED"
  ).length;

  // Recent 6 bookings formatted for feed
  const recentActivity = allBookings.slice(0, 6).map((b) => {
    const travelerName = b.auth
      ? `${b.auth.userPersonalInfo?.firstName || ""} ${b.auth.userPersonalInfo?.lastName || ""}`.trim() || b.auth.email
      : `${b.travelerFirstName || ""} ${b.travelerLastName || ""}`.trim() || b.travelerEmail || "Guest Traveler";

    return {
      id: b.id,
      bookingNumber: b.bookingNumber,
      travelerName,
      travelerEmail: b.travelerEmail,
      journeyTitle: b.journey?.title || "Custom Journey",
      amount: Number(b.confirmedTotal || b.paidAmount || 0),
      currency: b.currency || "USD",
      bookingStatus: b.bookingStatus,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
    };
  });

  return {
    overview: {
      totalBookings,
      totalRevenue: Math.round(totalRevenue),
      totalTravelers: totalUsers,
      activeTravelers: activeUsers,
      verifiedTravelers: verifiedUsers,
      totalJourneys,
      totalStories,
      totalLocations: totalCountries + totalPlaces,
      pendingReviewBookings: underReviewBookings,
      confirmedBookings,
      depositDueBookings,
      cancelledBookings,
    },
    charts: {
      revenueOverview,
      monthlyBookings,
    },
    bookingStatus: {
      confirmed: confirmedBookings,
      underReview: underReviewBookings,
      depositDue: depositDueBookings,
      cancelled: cancelledBookings,
    },
    recentActivity,
  };
};
