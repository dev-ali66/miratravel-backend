import { StatusCodes } from "http-status-codes";
import ApiError from "../../../utils/api.error.js";
import prisma from "../../../config/prisma.js";

// Helper to extract values from string or { value: string } CMS fields
const val = (field: any, defaultVal = ""): string => {
  if (field === null || field === undefined) return defaultVal;
  if (typeof field === "string") return field;
  if (typeof field === "object" && "value" in field) {
    return field.value ?? defaultVal;
  }
  return String(field);
};

// Helper to extract roles
export const extractUserRoles = (auth: any): string[] => {
  if (!auth) return [];
  const raw = auth.roles || auth.role;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((r: any) => (typeof r === "string" ? r : r?.name || ""))
      .filter(Boolean)
      .map((r: string) => r.toUpperCase());
  }
  if (typeof raw === "string") {
    return [raw.toUpperCase()];
  }
  return [];
};

export const isStaffOrAdmin = (auth: any): boolean => {
  const roles = extractUserRoles(auth);
  const adminRoles = ["ADMIN", "SUPER_ADMIN", "MANAGER", "STAFF"];
  return roles.some((r) => adminRoles.includes(r));
};

interface NormalizedDay {
  dayNumber: number;
  title?: string;
  description: string;
}

interface NormalizedChapter {
  chapterNumber?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  days: NormalizedDay[];
}

interface NormalizedItinerary {
  title: string;
  subtitle: string;
  description: string;
  chapters: NormalizedChapter[];
}

/**
 * Parses raw journey itinerary JSON (both chapter-based and flat day-based).
 */
export function parseJourneyItinerary(rawItinerary: any): NormalizedItinerary {
  const result: NormalizedItinerary = {
    title: val(rawItinerary?.title, "Curated Day-by-Day Itinerary"),
    subtitle: val(rawItinerary?.subtitle, "Bespoke Journey Narrative"),
    description: val(rawItinerary?.description, "Each day is designed to balance structured discovery with spontaneous wonder."),
    chapters: [],
  };

  if (!rawItinerary) return result;

  const rawItems = Array.isArray(rawItinerary.items)
    ? rawItinerary.items
    : Array.isArray(rawItinerary.days)
      ? rawItinerary.days
      : [];

  let currentDayCounter = 1;

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];

    // Check if item is a chapter (has nested days array)
    if (Array.isArray(item.days) && item.days.length > 0) {
      const chapterDays: NormalizedDay[] = item.days.map((d: any) => {
        const dayNum = typeof d.dayNumber === "number" ? d.dayNumber : currentDayCounter++;
        return {
          dayNumber: dayNum,
          title: val(d.title, `Day ${dayNum}`),
          description: val(d.description, val(d.notes, "")),
        };
      });

      const imageUrl =
        item.multimedia?.image?.url ||
        item.image?.url ||
        (typeof item.image === "string" ? item.image : null) ||
        null;

      result.chapters.push({
        chapterNumber: val(item.chapterNumber, `Chapter ${i + 1}`),
        title: val(item.title, `Chapter ${i + 1}`),
        subtitle: val(item.subtitle, ""),
        description: val(item.description, ""),
        imageUrl,
        days: chapterDays,
      });
    } else {
      // Flat day structure
      const dayNum = typeof item.dayNumber === "number" ? item.dayNumber : (i + 1);
      const dayItem: NormalizedDay = {
        dayNumber: dayNum,
        title: val(item.title, `Day ${dayNum}`),
        description: val(item.description, val(item.notes, "")),
      };

      if (result.chapters.length === 0) {
        result.chapters.push({
          chapterNumber: "1",
          title: "Expedition Itinerary",
          subtitle: "Full Day-by-Day Route",
          description: "",
          imageUrl: null,
          days: [dayItem],
        });
      } else {
        result.chapters[0].days.push(dayItem);
      }
    }
  }

  return result;
}

/**
 * Formats a date into a clean luxury string, e.g. "15 October 2026"
 */
function formatDate(d: any): string {
  if (!d) return "To be determined";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "To be determined";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "To be determined";
  }
}

/**
 * Calculates number of nights between two dates
 */
function calculateNights(start: any, end: any): number {
  if (!start || !end) return 0;
  try {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  } catch {
    return 0;
  }
}

/**
 * Generates an official, print-perfect standalone HTML document for MIRA Travel Itineraries.
 */
export function generateItineraryHtml(data: {
  bookingReference: string;
  bookingStatus: string;
  traveler: {
    fullName: string;
    email: string;
    phone?: string | null;
    adults?: number;
    children?: number;
    type?: string;
  };
  travelDates: {
    arrival: any;
    departure: any;
    nights: number;
  };
  journey: {
    title: string;
    subtitle?: string | null;
    pace?: string | null;
    comfortLevel?: string | null;
    price?: any;
    currency?: string;
    heroImage?: string | null;
  };
  itinerary: NormalizedItinerary;
  accommodations?: any;
  whatsIncluded?: any;
}): string {
  const {
    bookingReference,
    bookingStatus,
    traveler,
    travelDates,
    journey,
    itinerary,
    accommodations,
    whatsIncluded,
  } = data;

  const arrivalStr = formatDate(travelDates.arrival);
  const departureStr = formatDate(travelDates.departure);
  const totalDays = travelDates.nights ? travelDates.nights + 1 : "Flexible";
  const nightsStr = travelDates.nights ? `${travelDates.nights} Nights / ${totalDays} Days` : "Bespoke Duration";

  const partySize =
    (traveler.adults || 1) + (traveler.children ? ` Adult(s), ${traveler.children} Child(ren)` : ` Traveler(s)`);

  const inclusionsList: string[] = [];
  if (Array.isArray(whatsIncluded?.inclusions)) {
    inclusionsList.push(...whatsIncluded.inclusions.map((i: any) => val(i)));
  } else if (Array.isArray(whatsIncluded?.items)) {
    inclusionsList.push(...whatsIncluded.items.map((i: any) => val(i)));
  }

  const accommodationsList: any[] = [];
  if (Array.isArray(accommodations?.items)) {
    accommodationsList.push(...accommodations.items);
  } else if (Array.isArray(accommodations)) {
    accommodationsList.push(...accommodations);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MIRA Travel Itinerary — ${bookingReference}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #182D09;
      --primary-dark: #101F06;
      --secondary: #2B3424;
      --gold: #C69A59;
      --gold-light: #F4E8D6;
      --sand: #FAF7F2;
      --sand-dark: #F2ECE1;
      --text-main: #1D231A;
      --text-muted: #5A6555;
      --border: #E5DFC9;
      --border-light: #ECE7D8;
      --white: #FFFFFF;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Outfit', sans-serif;
      color: var(--text-main);
      background-color: var(--sand);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      padding: 30px 15px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: var(--white);
      border: 1px solid var(--border);
      box-shadow: 0 10px 40px rgba(24, 45, 9, 0.06);
      overflow: hidden;
    }

    /* Print control toolbar (hidden in print) */
    .toolbar {
      max-width: 900px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--primary);
      color: var(--white);
      padding: 14px 24px;
      border-radius: 4px;
    }
    .toolbar span {
      font-size: 13px;
      letter-spacing: 0.5px;
    }
    .print-btn {
      background: var(--gold);
      color: var(--white);
      border: none;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.2s;
    }
    .print-btn:hover {
      opacity: 0.9;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #182D09 0%, #2B3424 100%);
      color: var(--white);
      padding: 48px 40px;
      position: relative;
    }
    .brand-eyebrow {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: var(--gold);
      font-weight: 600;
      margin-bottom: 8px;
    }
    .journey-title {
      font-family: 'Playfair Display', serif;
      font-size: 34px;
      font-weight: 600;
      line-height: 1.25;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    .journey-subtitle {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.85);
      max-width: 650px;
      font-weight: 300;
      line-height: 1.5;
    }

    .ref-badge-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      font-size: 12px;
    }
    .ref-code {
      font-family: monospace;
      font-size: 13px;
      letter-spacing: 1px;
      background: rgba(255, 255, 255, 0.1);
      padding: 4px 10px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .status-pill {
      background: var(--gold);
      color: var(--primary-dark);
      font-weight: 600;
      padding: 4px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Meta Cards Grid */
    .meta-section {
      background: var(--sand);
      border-bottom: 1px solid var(--border);
      padding: 30px 40px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
    }
    .meta-box {
      border-left: 2px solid var(--gold);
      padding-left: 14px;
    }
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      font-weight: 600;
      margin-bottom: 4px;
    }
    .meta-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary);
    }

    /* Body sections */
    .section {
      padding: 40px;
      border-bottom: 1px solid var(--border-light);
    }
    .section-heading {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      color: var(--primary);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-eyebrow {
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--gold);
      font-weight: 600;
      margin-bottom: 6px;
    }
    .section-intro {
      font-size: 13.5px;
      color: var(--text-muted);
      margin-bottom: 24px;
    }

    /* Traveler Overview */
    .traveler-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      background: var(--sand);
      padding: 20px;
      border: 1px solid var(--border);
    }
    .traveler-item span:first-child {
      display: block;
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .traveler-item span:last-child {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-main);
    }

    /* Chapters & Days */
    .chapter {
      margin-bottom: 35px;
      page-break-inside: avoid;
    }
    .chapter:last-child {
      margin-bottom: 0;
    }
    .chapter-header {
      background: var(--sand);
      padding: 16px 20px;
      border-left: 4px solid var(--primary);
      margin-bottom: 20px;
    }
    .chapter-number {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--gold);
      font-weight: 700;
    }
    .chapter-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      color: var(--primary);
      margin-top: 2px;
    }
    .chapter-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .days-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding-left: 8px;
    }
    .day-row {
      display: flex;
      gap: 18px;
      align-items: flex-start;
      page-break-inside: avoid;
    }
    .day-badge {
      width: 48px;
      height: 48px;
      background: var(--primary);
      color: var(--white);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-weight: 700;
    }
    .day-badge span:first-child {
      font-size: 9px;
      letter-spacing: 1px;
      text-transform: uppercase;
      opacity: 0.8;
      line-height: 1;
    }
    .day-badge span:last-child {
      font-size: 16px;
      line-height: 1.1;
    }
    .day-body {
      flex: 1;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 16px;
    }
    .day-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 6px;
    }
    .day-desc {
      font-size: 13.5px;
      color: #384235;
      line-height: 1.6;
    }

    /* Accommodations Cards */
    .acc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    .acc-card {
      border: 1px solid var(--border);
      padding: 16px 20px;
      background: var(--sand);
    }
    .acc-name {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 600;
      color: var(--primary);
    }
    .acc-loc {
      font-size: 12px;
      color: var(--gold);
      font-weight: 600;
      margin-bottom: 6px;
    }
    .acc-desc {
      font-size: 12.5px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Inclusions List */
    .inclusions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px 24px;
    }
    .inclusion-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: var(--text-main);
    }
    .check-icon {
      color: #2F6F4E;
      font-weight: bold;
      font-size: 14px;
    }

    /* Concierge Footer */
    .footer {
      background: #111D07;
      color: var(--white);
      padding: 36px 40px;
      text-align: center;
    }
    .footer-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      color: var(--gold);
      margin-bottom: 8px;
    }
    .footer-p {
      font-size: 12.5px;
      color: rgba(255, 255, 255, 0.75);
      max-width: 500px;
      margin: 0 auto 16px auto;
    }
    .footer-contacts {
      display: flex;
      justify-content: center;
      gap: 24px;
      font-size: 12px;
      color: var(--white);
      flex-wrap: wrap;
    }
    .footer-contacts a {
      color: var(--gold);
      text-decoration: none;
    }

    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .toolbar {
        display: none !important;
      }
      .container {
        border: none;
        box-shadow: none;
        max-width: 100%;
      }
      .header, .footer {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .day-badge {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>

  <!-- Print Button Bar (hidden in print) -->
  <div class="toolbar">
    <span>Official MIRA Travel Itinerary Document</span>
    <button class="print-btn" onclick="window.print()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
        <path d="M6 14h12v8H6z"/>
      </svg>
      Print / Save as PDF
    </button>
  </div>

  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="brand-eyebrow">MIRA TRAVEL EXPEDITIONS &middot; PRIVATE ITINERARY</div>
      <h1 class="journey-title">${journey.title}</h1>
      ${journey.subtitle ? `<div class="journey-subtitle">${journey.subtitle}</div>` : ""}

      <div class="ref-badge-bar">
        <div>
          <span>Booking Reference: </span>
          <span class="ref-code">${bookingReference}</span>
        </div>
        <div>
          <span class="status-pill">${bookingStatus}</span>
        </div>
      </div>
    </div>

    <!-- Meta Highlights -->
    <div class="meta-section">
      <div class="meta-box">
        <div class="meta-label">Dates of Travel</div>
        <div class="meta-value">${arrivalStr} &ndash; ${departureStr}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Duration</div>
        <div class="meta-value">${nightsStr}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Pace & Style</div>
        <div class="meta-value">${journey.pace || "Balanced"} &middot; ${journey.comfortLevel || "Boutique Luxury"}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Party</div>
        <div class="meta-value">${partySize}</div>
      </div>
    </div>

    <!-- Lead Traveler Details -->
    <div class="section">
      <div class="section-eyebrow">RESERVATION HOLDER</div>
      <h2 class="section-heading">Traveler Details</h2>
      <div class="traveler-grid">
        <div class="traveler-item">
          <span>Primary Traveler</span>
          <span>${traveler.fullName || "Valued Guest"}</span>
        </div>
        <div class="traveler-item">
          <span>Contact Email</span>
          <span>${traveler.email || "N/A"}</span>
        </div>
        <div class="traveler-item">
          <span>Phone</span>
          <span>${traveler.phone || "On File"}</span>
        </div>
        <div class="traveler-item">
          <span>Traveler Type</span>
          <span>${traveler.type || "Private Traveler"}</span>
        </div>
      </div>
    </div>

    <!-- Day-by-Day Itinerary Narrative -->
    <div class="section">
      <div class="section-eyebrow">DAY BY DAY JOURNEY</div>
      <h2 class="section-heading">${itinerary.title}</h2>
      ${itinerary.description ? `<p class="section-intro">${itinerary.description}</p>` : ""}

      ${
        itinerary.chapters.length > 0
          ? itinerary.chapters
              .map(
                (ch) => `
          <div class="chapter">
            <div class="chapter-header">
              ${ch.chapterNumber ? `<div class="chapter-number">CHAPTER ${ch.chapterNumber}</div>` : ""}
              <h3 class="chapter-title">${ch.title}</h3>
              ${ch.subtitle ? `<p style="font-size:12px; color:var(--gold); font-weight:600; margin-top:2px;">${ch.subtitle}</p>` : ""}
              ${ch.description ? `<p class="chapter-desc">${ch.description}</p>` : ""}
            </div>

            <div class="days-list">
              ${ch.days
                .map(
                  (d) => `
                <div class="day-row">
                  <div class="day-badge">
                    <span>DAY</span>
                    <span>${d.dayNumber}</span>
                  </div>
                  <div class="day-body">
                    <div class="day-title">${d.title || `Day ${d.dayNumber}`}</div>
                    <div class="day-desc">${d.description || "Curated private exploration and bespoke moments crafted by your travel designer."}</div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
              )
              .join("")
          : `
          <p class="section-intro">Your travel designer is currently finalizing the day-by-day narrative for your private route.</p>
        `
      }
    </div>

    <!-- Accommodations -->
    ${
      accommodationsList.length > 0
        ? `
      <div class="section">
        <div class="section-eyebrow">RETREATS & STAYS</div>
        <h2 class="section-heading">Curated Accommodations</h2>
        <p class="section-intro">Hand-picked luxury boutique hotels, coastal villas, and heritage stays tailored for your journey.</p>
        <div class="acc-grid">
          ${accommodationsList
            .map(
              (acc) => `
            <div class="acc-card">
              <div class="acc-name">${val(acc.name, "Boutique Heritage Retreat")}</div>
              ${acc.location ? `<div class="acc-loc">${val(acc.location)}</div>` : ""}
              <div class="acc-desc">${val(acc.description, "Restored authentic suites featuring regional hospitality and refined amenities.")}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    <!-- Inclusions -->
    ${
      inclusionsList.length > 0
        ? `
      <div class="section">
        <div class="section-eyebrow">COMPREHENSIVE PROVISIONS</div>
        <h2 class="section-heading">What Is Included</h2>
        <div class="inclusions-grid" style="margin-top: 20px;">
          ${inclusionsList
            .map(
              (inc) => `
            <div class="inclusion-item">
              <span class="check-icon">&#10003;</span>
              <span>${inc}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
        : ""
    }

    <!-- Footer & Concierge -->
    <div class="footer">
      <div class="footer-title">24/7 Dedicated Concierge Support</div>
      <p class="footer-p">
        Throughout your journey, your personal travel specialist and regional logistics coordinators remain at your immediate service.
      </p>
      <div class="footer-contacts">
        <div><strong>Email:</strong> <a href="mailto:concierge@miratravel.nl">concierge@miratravel.nl</a></div>
        <div><strong>Phone:</strong> +44 123 456 7890</div>
        <div><strong>Emergency Dispatch:</strong> Available 24/7 in your active travel briefing</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Controller service to resolve and download a traveler's itinerary.
 */
export async function downloadItineraryService(req: any) {
  const { id } = req.params;
  const format = String(req.query?.format || "html").toLowerCase();

  if (!id || !id.trim()) {
    throw new ApiError("Booking or Journey reference is required", StatusCodes.BAD_REQUEST);
  }

  const cleanId = id.trim();

  // 1. Try to find booking by id or bookingNumber
  const booking = await prisma.booking.findFirst({
    where: {
      OR: [
        { id: cleanId },
        { bookingNumber: cleanId },
      ],
      deletedAt: null,
    },
    include: {
      journey: true,
      auth: {
        select: {
          id: true,
          email: true,
          userPersonalInfo: true,
        },
      },
    },
  });

  if (booking) {
    // Check authorization for booking
    const auth = req.auth;
    const isAdmin = isStaffOrAdmin(auth);

    if (auth && !isAdmin) {
      const isOwner =
        booking.createdBy === auth.id ||
        (booking.travelerEmail && auth.email && booking.travelerEmail.toLowerCase() === auth.email.toLowerCase());

      if (!isOwner) {
        throw new ApiError(
          "Access denied. You do not have permission to view or download this booking itinerary.",
          StatusCodes.FORBIDDEN
        );
      }
    }

    const journey = booking.journey;
    const parsedItinerary = parseJourneyItinerary(journey?.itinerary);
    const nights = calculateNights(booking.travelArrivalDate, booking.travelDepartureDate);

    const travelerName =
      [booking.travelerFirstName, booking.travelerLastName].filter(Boolean).join(" ") ||
      [booking.auth?.userPersonalInfo?.firstName, booking.auth?.userPersonalInfo?.lastName].filter(Boolean).join(" ") ||
      "Traveler";

    const dataPayload = {
      bookingReference: booking.bookingNumber,
      bookingStatus: booking.bookingStatus,
      traveler: {
        fullName: travelerName,
        email: booking.travelerEmail || booking.auth?.email || "",
        phone: booking.travelerPhone || booking.auth?.userPersonalInfo?.phone || null,
        adults: booking.adults,
        children: booking.children,
        type: booking.travelerType,
      },
      travelDates: {
        arrival: booking.travelArrivalDate,
        departure: booking.travelDepartureDate,
        nights,
      },
      journey: {
        title: journey?.title || "Bespoke Journey",
        subtitle: journey?.subtitle || null,
        pace: journey?.pace || null,
        comfortLevel: journey?.comfortLevel || null,
        price: booking.confirmedTotal || journey?.price,
        currency: booking.currency || journey?.currency || "EUR",
        heroImage: (journey?.hero as any)?.backgroundMultimedia?.image?.url || null,
      },
      itinerary: parsedItinerary,
      accommodations: journey?.accommodations,
      whatsIncluded: journey?.whatsIncluded,
    };

    if (format === "json" || req.headers?.accept?.includes("application/json")) {
      return {
        format: "json",
        filename: `MIRA-Itinerary-${booking.bookingNumber}.json`,
        data: dataPayload,
      };
    }

    const htmlContent = generateItineraryHtml(dataPayload);
    return {
      format: "html",
      filename: `MIRA-Itinerary-${booking.bookingNumber}.html`,
      htmlContent,
    };
  }

  // 2. If not a booking, try to find published journey by id or slug
  const journey = await prisma.journey.findFirst({
    where: {
      OR: [
        { id: cleanId },
        { slug: cleanId },
      ],
      deletedAt: null,
    },
  });

  if (!journey) {
    throw new ApiError(`No active booking or journey found matching reference: "${cleanId}"`, StatusCodes.NOT_FOUND);
  }

  const parsedItinerary = parseJourneyItinerary(journey.itinerary);
  const dataPayload = {
    bookingReference: `JOURNEY-${journey.slug.toUpperCase()}`,
    bookingStatus: "CURATED EXPEDITION",
    traveler: {
      fullName: "Prospective Explorer",
      email: (req.auth as any)?.email || "explorer@miratravel.nl",
      phone: null,
      adults: 2,
      children: 0,
      type: "PRIVATE",
    },
    travelDates: {
      arrival: null,
      departure: null,
      nights: journey.minDays ? journey.minDays - 1 : 7,
    },
    journey: {
      title: journey.title,
      subtitle: journey.subtitle,
      pace: journey.pace,
      comfortLevel: journey.comfortLevel,
      price: journey.price,
      currency: journey.currency,
      heroImage: (journey.hero as any)?.backgroundMultimedia?.image?.url || null,
    },
    itinerary: parsedItinerary,
    accommodations: journey.accommodations,
    whatsIncluded: journey.whatsIncluded,
  };

  if (format === "json" || req.headers?.accept?.includes("application/json")) {
    return {
      format: "json",
      filename: `MIRA-Itinerary-${journey.slug}.json`,
      data: dataPayload,
    };
  }

  const htmlContent = generateItineraryHtml(dataPayload);
  return {
    format: "html",
    filename: `MIRA-Itinerary-${journey.slug}.html`,
    htmlContent,
  };
}
