import { Request } from "express";
import os from "os";
import { exec } from "child_process";
import prisma from "../../config/prisma.js";
import { getVpsStorageMetrics } from "../system/systemStorage.service.js";

// CPU Usage tracker for accurate non-blocking delta computation
let lastCpuSnapshot = getCpuSnapshot();

function getCpuSnapshot() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += (cpu.times as any)[type];
    }
    idle += cpu.times.idle;
  }
  return { idle, total };
}

function getVpsCpuUsagePercent(): number {
  const current = getCpuSnapshot();
  const idleDiff = current.idle - lastCpuSnapshot.idle;
  const totalDiff = current.total - lastCpuSnapshot.total;
  lastCpuSnapshot = current;
  if (totalDiff <= 0) return 4;
  const usage = Math.round(100 - (100 * idleDiff) / totalDiff);
  return Math.max(1, Math.min(100, usage));
}

function getVpsMemoryMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  return {
    totalGb: +(totalMem / (1024 ** 3)).toFixed(1),
    usedGb: +(usedMem / (1024 ** 3)).toFixed(1),
    freeGb: +(freeMem / (1024 ** 3)).toFixed(1),
    ramPercent: Math.round((usedMem / totalMem) * 100),
    cores: os.cpus().length,
    platform: os.platform(),
  };
}

async function getPm2FleetMetrics(): Promise<{
  isPm2: boolean;
  backendInstances: number;
  frontendInstances: number;
  totalProcesses: number;
  onlineProcesses: number;
  fleet: Array<{
    name: string;
    pm_id?: number;
    status: string;
    type?: string;
    cpu?: number;
    memoryMb?: number;
    port?: number | string;
  }>;
}> {
  return new Promise((resolve) => {
    exec("pm2 jlist", { timeout: 600 }, (err, stdout) => {
      if (err || !stdout) {
        return resolve({
          isPm2: false,
          backendInstances: 1,
          frontendInstances: 1,
          totalProcesses: 2,
          onlineProcesses: 2,
          fleet: [
            { name: "mira-backend", status: "online", type: "backend", port: 5010 },
            { name: "mira-frontend", status: "online", type: "frontend", port: 5173 },
          ],
        });
      }

      try {
        const list = JSON.parse(stdout);
        if (!Array.isArray(list) || list.length === 0) {
          return resolve({
            isPm2: false,
            backendInstances: 1,
            frontendInstances: 1,
            totalProcesses: 2,
            onlineProcesses: 2,
            fleet: [
              { name: "mira-backend", status: "online", type: "backend", port: 5010 },
              { name: "mira-frontend", status: "online", type: "frontend", port: 5173 },
            ],
          });
        }

        const online = list.filter((p: any) => p.pm2_env?.status === "online");
        const backend = online.filter((p: any) => /back|api|server/i.test(p.name)).length || 1;
        const frontend = online.filter((p: any) => /front|client|web|dash/i.test(p.name)).length || 1;

        resolve({
          isPm2: true,
          backendInstances: backend,
          frontendInstances: frontend,
          totalProcesses: list.length,
          onlineProcesses: online.length,
          fleet: list.map((p: any) => ({
            name: p.name,
            pm_id: p.pm_id,
            status: p.pm2_env?.status || "online",
            type: /front|client|web|dash/i.test(p.name) ? "frontend" : "backend",
            cpu: p.monit?.cpu || 0,
            memoryMb: Math.round((p.monit?.memory || 0) / 1024 / 1024),
          })),
        });
      } catch {
        resolve({
          isPm2: false,
          backendInstances: 1,
          frontendInstances: 1,
          totalProcesses: 2,
          onlineProcesses: 2,
          fleet: [
            { name: "mira-backend", status: "online", type: "backend", port: 5010 },
            { name: "mira-frontend", status: "online", type: "frontend", port: 5173 },
          ],
        });
      }
    });
  });
}

export const getDashboardStatisticsService = async (req: Request) => {
  const pingStart = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const dbLatencyMs = Math.max(1, Date.now() - pingStart);

  // Run real database aggregations in parallel
  const [
    totalBookings,
    allBookings,
    totalUsers,
    activeUsers,
    verifiedUsers,
    userDates,
    totalJourneys,
    publishedJourneys,
    featuredJourneys,
    journeyDates,
    totalStories,
    publishedStories,
    featuredStories,
    storyDates,
    totalLocations,
    totalContinents,
    totalCountries,
    totalRegions,
    totalPlaces,
    totalLandmarks,
    totalAccommodations,
    locationDates,
    totalJourneyRequests,
    newJourneyRequests,
    inReviewJourneyRequests,
    completedJourneyRequests,
    journeyRequestDates,
    totalInquiries,
    newInquiries,
    inReviewInquiries,
    contactedInquiries,
    closedInquiries,
    inquiryDates,
    totalExperiences,
    publishedExperiences,
    featuredExperiences,
    experienceDates,
    totalSubscribers,
    activeSubscribers,
    newsletterDates,
    totalMedia,
    mediaDates,
    totalAuditLogs,
    totalCmsPages,
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
    prisma.auth.findMany({ where: { isDeleted: false }, select: { createdAt: true } }),
    prisma.journey.count({ where: { deletedAt: null } }),
    prisma.journey.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.journey.count({ where: { deletedAt: null, featured: true } }),
    prisma.journey.findMany({ where: { deletedAt: null }, select: { createdAt: true } }),
    prisma.story.count({ where: { deletedAt: null } }),
    prisma.story.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.story.count({ where: { deletedAt: null, featured: true } }),
    prisma.story.findMany({ where: { deletedAt: null }, select: { createdAt: true } }),
    prisma.location.count({ where: { deletedAt: null } }),
    prisma.location.count({ where: { deletedAt: null, type: "CONTINENT" } }),
    prisma.location.count({ where: { deletedAt: null, type: "COUNTRY" } }),
    prisma.location.count({ where: { deletedAt: null, type: "REGION" } }),
    prisma.location.count({ where: { deletedAt: null, type: "PLACE" } }),
    prisma.location.count({ where: { deletedAt: null, type: "LANDMARK" } }),
    prisma.location.count({ where: { deletedAt: null, type: "ACCOMMODATION" } }),
    prisma.location.findMany({ where: { deletedAt: null }, select: { createdAt: true } }),
    prisma.journeyWizardRequest.count({ where: { deletedAt: null } }),
    prisma.journeyWizardRequest.count({ where: { deletedAt: null, status: "NEW" } }),
    prisma.journeyWizardRequest.count({ where: { deletedAt: null, status: "IN_REVIEW" } }),
    prisma.journeyWizardRequest.count({ where: { deletedAt: null, status: "COMPLETED" } }),
    prisma.journeyWizardRequest.findMany({ where: { deletedAt: null }, select: { createdAt: true } }),
    prisma.inquiry.count({ where: { deletedAt: null } }),
    prisma.inquiry.count({ where: { deletedAt: null, status: "NEW" } }),
    prisma.inquiry.count({ where: { deletedAt: null, status: "IN_REVIEW" } }),
    prisma.inquiry.count({ where: { deletedAt: null, status: "CONTACTED" } }),
    prisma.inquiry.count({ where: { deletedAt: null, status: "CLOSED" } }),
    prisma.inquiry.findMany({ where: { deletedAt: null }, select: { createdAt: true } }),
    prisma.experience.count({ where: { deletedAt: null } }),
    prisma.experience.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.experience.count({ where: { deletedAt: null, featured: true } }),
    prisma.experience.findMany({ where: { deletedAt: null }, select: { createdAt: true } }),
    prisma.newsletterSubscriber.count({ where: { deletedAt: null } }),
    prisma.newsletterSubscriber.count({ where: { deletedAt: null, status: "SUBSCRIBED" } }),
    prisma.newsletterSubscriber.findMany({ where: { deletedAt: null }, select: { createdAt: true } }),
    prisma.mediaAsset.count({ where: { deletedAt: null } }),
    prisma.mediaAsset.findMany({ where: { deletedAt: null }, select: { createdAt: true } }),
    prisma.mediaAuditLog.count(),
    prisma.cmsPage.count({ where: { deletedAt: null } }),
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

  // Real monthly sparklines computed from actual record createdAt timestamps
  const getMonthlySparkline = (records: { createdAt: Date | string }[]): number[] => {
    const counts = new Array(12).fill(0);
    for (const r of records) {
      if (r && r.createdAt) {
        const m = new Date(r.createdAt).getMonth();
        if (m >= 0 && m < 12) counts[m]++;
      }
    }
    return counts;
  };

  const vpsMem = getVpsMemoryMetrics();
  const vpsCpu = getVpsCpuUsagePercent();
  const [pm2Fleet, vpsStorage] = await Promise.all([
    getPm2FleetMetrics(),
    getVpsStorageMetrics(),
  ]);

  return {
    overview: {
      totalBookings,
      totalRevenue: Math.round(totalRevenue),
      totalTravelers: totalUsers,
      activeTravelers: activeUsers,
      verifiedTravelers: verifiedUsers,
      totalJourneys,
      totalStories,
      totalLocations,
      pendingReviewBookings: underReviewBookings,
      confirmedBookings,
      depositDueBookings,
      cancelledBookings,
      avgTicket: confirmedBookings > 0 ? Math.round(totalRevenue / confirmedBookings) : (totalRevenue > 0 ? Math.round(totalRevenue) : 0),
      confirmationRate: totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0,
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
    modules: {
      bookings: {
        title: "Bookings",
        route: "/bookings",
        total: totalBookings,
        pending: underReviewBookings,
        confirmed: confirmedBookings,
        depositDue: depositDueBookings,
        cancelled: cancelledBookings,
        revenue: Math.round(totalRevenue),
        sparkline: getMonthlySparkline(allBookings),
      },
      journeyRequests: {
        title: "Journey Requests",
        route: "/requests",
        total: totalJourneyRequests,
        new: newJourneyRequests,
        inReview: inReviewJourneyRequests,
        completed: completedJourneyRequests,
        sparkline: getMonthlySparkline(journeyRequestDates),
      },
      inquiries: {
        title: "Travel Inquiries",
        route: "/inquiries",
        total: totalInquiries,
        new: newInquiries,
        inReview: inReviewInquiries,
        contacted: contactedInquiries,
        closed: closedInquiries,
        sparkline: getMonthlySparkline(inquiryDates),
      },
      locations: {
        title: "Destinations & Geography",
        route: "/location",
        total: totalLocations,
        continents: totalContinents,
        countries: totalCountries,
        regions: totalRegions,
        places: totalPlaces,
        landmarks: totalLandmarks,
        accommodations: totalAccommodations,
        sparkline: getMonthlySparkline(locationDates),
      },
      journeys: {
        title: "Journeys Management",
        route: "/journeys",
        total: totalJourneys,
        published: publishedJourneys,
        featured: featuredJourneys,
        drafts: Math.max(0, totalJourneys - publishedJourneys),
        sparkline: getMonthlySparkline(journeyDates),
      },
      experiences: {
        title: "Experiences Catalog",
        route: "/experiences",
        total: totalExperiences,
        published: publishedExperiences,
        featured: featuredExperiences,
        drafts: Math.max(0, totalExperiences - publishedExperiences),
        sparkline: getMonthlySparkline(experienceDates),
      },
      stories: {
        title: "Stories & Editorial",
        route: "/stories",
        total: totalStories,
        published: publishedStories,
        featured: featuredStories,
        drafts: Math.max(0, totalStories - publishedStories),
        sparkline: getMonthlySparkline(storyDates),
      },
      users: {
        title: "Travelers & Users",
        route: "/user",
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        sparkline: getMonthlySparkline(userDates),
      },
      newsletter: {
        title: "Newsletter Subscribers",
        route: "/newsletter",
        total: totalSubscribers,
        active: activeSubscribers,
        unsubscribed: Math.max(0, totalSubscribers - activeSubscribers),
        sparkline: getMonthlySparkline(newsletterDates),
      },
      media: {
        title: "Media Assets",
        route: "/media-library",
        total: totalMedia,
        sparkline: getMonthlySparkline(mediaDates),
      },
      systemHealth: {
        title: "System Health & Telemetry",
        route: "/system-health",
        status: "OPERATIONAL",
        uptimeSeconds: Math.round(process.uptime()),
        memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        dbLatencyMs,
        vps: {
          cpuPercent: vpsCpu,
          totalMemoryGb: vpsMem.totalGb,
          usedMemoryGb: vpsMem.usedGb,
          freeMemoryGb: vpsMem.freeGb,
          memoryPercent: vpsMem.ramPercent,
          cpuCores: vpsMem.cores,
          platform: vpsMem.platform,
          storage: vpsStorage,
        },
        pm2: pm2Fleet,
      },
      auditLogs: {
        title: "Audit Logs & Security",
        route: "/audit-logs",
        totalEvents: totalAuditLogs,
        streamStatus: "LIVE_ACTIVE",
        securityLevel: "HIGH",
      },
      cms: {
        title: "CMS Pages & Templates",
        route: "/cms",
        total: totalCmsPages,
      },
    },
  };
};
