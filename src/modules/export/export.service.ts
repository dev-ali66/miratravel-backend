import prisma from "../../config/prisma.js";
import { AuditService } from "../audit/audit.service.js";

// Helper to escape CSV values according to RFC 4180
export function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  if (val instanceof Date) {
    return `"${val.toISOString()}"`;
  }
  let str = String(val);
  // Double quote any existing quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export function buildCsv(headers: string[], rows: any[][]): string {
  const headerRow = headers.map((h) => escapeCsv(h)).join(",");
  const dataRows = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(","));
  // \uFEFF is UTF-8 Byte Order Mark for Microsoft Excel compatibility
  return `\uFEFF${[headerRow, ...dataRows].join("\r\n")}`;
}

// ---------------------------------------------------------------------------
// 1. BOOKINGS EXPORT
// ---------------------------------------------------------------------------
export const exportBookingsService = async (query: any = {}) => {
  const { search, bookingStatus, paymentStatus, departureFrom, departureTo } = query;

  const where: any = {
    deletedAt: null,
  };

  if (bookingStatus && bookingStatus !== "ALL") {
    where.bookingStatus = bookingStatus;
  }
  if (paymentStatus && paymentStatus !== "ALL") {
    where.paymentStatus = paymentStatus;
  }
  if (search) {
    const q = String(search).trim();
    where.OR = [
      { bookingNumber: { contains: q, mode: "insensitive" } },
      { travelerFirstName: { contains: q, mode: "insensitive" } },
      { travelerLastName: { contains: q, mode: "insensitive" } },
      { travelerEmail: { contains: q, mode: "insensitive" } },
      { travelerPhone: { contains: q, mode: "insensitive" } },
    ];
  }
  if (departureFrom || departureTo) {
    where.travelDepartureDate = {
      ...(departureFrom ? { gte: new Date(departureFrom) } : {}),
      ...(departureTo ? { lte: new Date(departureTo) } : {}),
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      journey: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          currency: true,
        },
      },
    },
  });

  const headers = [
    "Booking Reference #",
    "Created Date (UTC)",
    "Booking Status",
    "Payment Status",
    "Journey Title",
    "Journey Slug",
    "Traveler Full Name",
    "Traveler First Name",
    "Traveler Last Name",
    "Traveler Email",
    "Traveler Phone",
    "Traveler Nationality",
    "Traveler Type",
    "Adults",
    "Children",
    "Children Ages",
    "Travel Arrival Date",
    "Travel Departure Date",
    "Duration (Days)",
    "Currency",
    "Confirmed Total",
    "Paid Amount",
    "Outstanding Balance",
    "Approval Date",
    "Traveler Message / Notes",
    "Terms Agreed",
  ];

  const rows = bookings.map((b) => {
    const arrival = b.travelArrivalDate ? new Date(b.travelArrivalDate) : null;
    const departure = b.travelDepartureDate ? new Date(b.travelDepartureDate) : null;
    let durationDays = "—";
    if (arrival && departure && !isNaN(arrival.getTime()) && !isNaN(departure.getTime())) {
      const diffMs = departure.getTime() - arrival.getTime();
      durationDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24))).toString();
    }

    return [
      b.bookingNumber,
      b.createdAt ? b.createdAt.toISOString() : "",
      b.bookingStatus,
      b.paymentStatus,
      b.journey?.title || "N/A",
      b.journey?.slug || "",
      `${b.travelerFirstName || ""} ${b.travelerLastName || ""}`.trim(),
      b.travelerFirstName || "",
      b.travelerLastName || "",
      b.travelerEmail || "",
      b.travelerPhone || "",
      b.travelerNationality || "",
      b.travelerType || "SOLO",
      b.adults ?? 0,
      b.children ?? 0,
      Array.isArray(b.childrenAges) ? b.childrenAges.join("; ") : "",
      arrival ? arrival.toISOString().split("T")[0] : "",
      departure ? departure.toISOString().split("T")[0] : "",
      durationDays,
      b.currency || "EUR",
      b.confirmedTotal ? Number(b.confirmedTotal) : 0,
      b.paidAmount ? Number(b.paidAmount) : 0,
      b.outstandingAmount ? Number(b.outstandingAmount) : 0,
      b.approvalDate ? b.approvalDate.toISOString() : "",
      b.travelerMessage || "",
      b.agreedToTerms ? "YES" : "NO",
    ];
  });

  const filename = `mira_bookings_export_${new Date().toISOString().split("T")[0]}.csv`;
  const csvContent = buildCsv(headers, rows);

  return {
    filename,
    csvContent,
    count: bookings.length,
    data: bookings,
  };
};

// ---------------------------------------------------------------------------
// 2. USERS EXPORT
// ---------------------------------------------------------------------------
export const exportUsersService = async (query: any = {}) => {
  const { search, role, status, isVerified } = query;

  const where: any = {
    isDeleted: false,
  };

  if (status && status !== "ALL") {
    where.status = status;
  }
  if (isVerified !== undefined && isVerified !== "" && isVerified !== "ALL") {
    where.isVerified = isVerified === "true" || isVerified === true;
  }
  if (role && role !== "ALL") {
    where.roles = {
      some: {
        name: {
          equals: String(role).toUpperCase(),
          mode: "insensitive",
        },
      },
    };
  }
  if (search) {
    const q = String(search).trim();
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      {
        userPersonalInfo: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { country: { contains: q, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const users = await prisma.auth.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      roles: true,
      userPersonalInfo: true,
      _count: {
        select: { bookings: true },
      },
    },
  });

  const headers = [
    "User ID",
    "Email Address",
    "Full Name",
    "First Name",
    "Last Name",
    "Phone Number",
    "Role(s)",
    "Account Status",
    "Email Verified",
    "Total Bookings Count",
    "Nationality",
    "Country",
    "State / Province",
    "City",
    "Address",
    "Zip Code",
    "Date of Birth",
    "Registered Date (UTC)",
    "Last Updated",
  ];

  const rows = users.map((u) => {
    const info = u.userPersonalInfo;
    const rolesStr = u.roles?.map((r) => r.name).join(", ") || "USER";
    const fullName = `${info?.firstName || ""} ${info?.lastName || ""}`.trim() || u.email.split("@")[0];

    return [
      u.id,
      u.email,
      fullName,
      info?.firstName || "",
      info?.lastName || "",
      info?.phone || "",
      rolesStr,
      u.status,
      u.isVerified ? "YES" : "NO",
      u._count?.bookings ?? 0,
      info?.nationality || "",
      info?.country || "",
      info?.state || "",
      info?.city || "",
      info?.address || "",
      info?.zipCode || "",
      info?.dateOfBirth || "",
      u.createdAt ? u.createdAt.toISOString() : "",
      u.updatedAt ? u.updatedAt.toISOString() : "",
    ];
  });

  const filename = `mira_users_export_${new Date().toISOString().split("T")[0]}.csv`;
  const csvContent = buildCsv(headers, rows);

  return {
    filename,
    csvContent,
    count: users.length,
    data: users,
  };
};

// ---------------------------------------------------------------------------
// 3. INQUIRIES EXPORT
// ---------------------------------------------------------------------------
export const exportInquiriesService = async (query: any = {}) => {
  const { search, status } = query;

  const where: any = {
    deletedAt: null,
  };

  if (status && status !== "ALL") {
    where.status = status;
  }
  if (search) {
    const q = String(search).trim();
    where.OR = [
      { inquiryNumber: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { destination: { contains: q, mode: "insensitive" } },
    ];
  }

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Inquiry Reference #",
    "Status",
    "Traveler Full Name",
    "Email Address",
    "Phone Number",
    "Target Destination",
    "Intended Travel Date",
    "Number of Travelers",
    "Journey Types",
    "Traveler Message",
    "Admin Internal Notes",
    "Submitted Date (UTC)",
    "Last Updated",
  ];

  const rows = inquiries.map((i) => [
    i.inquiryNumber || i.id,
    i.status,
    i.fullName || "",
    i.email || "",
    i.phone || "",
    i.destination || "",
    i.travelDate || "",
    i.travelers || "",
    Array.isArray(i.journeyTypes) ? i.journeyTypes.join("; ") : "",
    i.message || "",
    i.adminNotes || "",
    i.createdAt ? i.createdAt.toISOString() : "",
    i.updatedAt ? i.updatedAt.toISOString() : "",
  ]);

  const filename = `mira_inquiries_export_${new Date().toISOString().split("T")[0]}.csv`;
  const csvContent = buildCsv(headers, rows);

  return {
    filename,
    csvContent,
    count: inquiries.length,
    data: inquiries,
  };
};

// ---------------------------------------------------------------------------
// 4. NEWSLETTER EXPORT
// ---------------------------------------------------------------------------
export const exportNewsletterService = async (query: any = {}) => {
  const { search, status } = query;

  const where: any = {
    deletedAt: null,
  };

  if (status && status !== "ALL") {
    where.status = status;
  }
  if (search) {
    const q = String(search).trim();
    where.email = { contains: q, mode: "insensitive" };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Subscriber ID",
    "Email Address",
    "Subscription Status",
    "Acquisition Source",
    "Subscribed Date (UTC)",
    "Last Updated",
  ];

  const rows = subscribers.map((s) => [
    s.id,
    s.email,
    s.status,
    s.source || "FOOTER",
    s.createdAt ? s.createdAt.toISOString() : "",
    s.updatedAt ? s.updatedAt.toISOString() : "",
  ]);

  const filename = `mira_newsletter_export_${new Date().toISOString().split("T")[0]}.csv`;
  const csvContent = buildCsv(headers, rows);

  return {
    filename,
    csvContent,
    count: subscribers.length,
    data: subscribers,
  };
};

// ---------------------------------------------------------------------------
// 5. AUDIT LOGS EXPORT
// ---------------------------------------------------------------------------
export const exportAuditLogsService = async (query: any = {}) => {
  const { search, action, status } = query;

  const logsResult = AuditService.getLogs({
    search: search ? String(search).trim() : undefined,
    action: action && action !== "ALL" ? String(action) : undefined,
    status: status && status !== "ALL" ? (status as any) : undefined,
    limit: 5000,
  });

  const headers = [
    "Log ID",
    "Timestamp (UTC)",
    "Actor Name",
    "Actor Email",
    "Actor Role",
    "Action Taken",
    "Entity Type",
    "Entity ID",
    "Event Status",
    "IP Address",
    "HTTP Method",
    "API Route",
    "Event Details",
  ];

  const rows = logsResult.data.map((l) => [
    l.id,
    l.timestamp,
    l.actorName || "",
    l.actorEmail || "",
    l.actorRole || "",
    l.action || "",
    l.entityType || "",
    l.entityId || "",
    l.status || "SUCCESS",
    l.ipAddress || "",
    l.method || "",
    l.path || "",
    l.details || "",
  ]);

  const filename = `mira_audit_logs_export_${new Date().toISOString().split("T")[0]}.csv`;
  const csvContent = buildCsv(headers, rows);

  return {
    filename,
    csvContent,
    count: logsResult.data.length,
    data: logsResult.data,
  };
};

// ---------------------------------------------------------------------------
// 6. JOURNEY WIZARD REQUESTS EXPORT
// ---------------------------------------------------------------------------
export const exportJourneyRequestsService = async (query: any = {}) => {
  const { search, status } = query;

  const where: any = {
    deletedAt: null,
  };

  if (status && status !== "ALL" && status !== "") {
    where.status = status;
  }
  if (search) {
    const q = String(search).trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const requests = await prisma.journeyWizardRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Request ID",
    "Status",
    "Requester Name",
    "Email Address",
    "Phone Number",
    "Duration",
    "Budget",
    "Budget Description",
    "Journey Types",
    "Travel Styles",
    "Pace Preference",
    "Comfort Level",
    "Special Notes / Requests",
    "Received Date (UTC)",
  ];

  const rows = requests.map((r) => [
    r.id,
    r.status || "NEW",
    r.name || "",
    r.email || "",
    r.phone || "",
    r.duration || "",
    r.budget ?? "",
    r.budgetText || "",
    Array.isArray(r.journeyTypes) ? r.journeyTypes.join("; ") : "",
    Array.isArray(r.travelStyles) ? r.travelStyles.join("; ") : "",
    r.pace || "",
    r.comfortLevel || "",
    r.notes || "",
    r.createdAt ? r.createdAt.toISOString() : "",
  ]);

  const filename = `mira_journey_requests_export_${new Date().toISOString().split("T")[0]}.csv`;
  const csvContent = buildCsv(headers, rows);

  return {
    filename,
    csvContent,
    count: requests.length,
    data: requests,
  };
};
