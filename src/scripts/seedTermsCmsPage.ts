import dotenv from "dotenv";
dotenv.config();

import prisma from "../config/prisma.js";

const defaultTermsSections = [
  {
    id: "introduction",
    tabTitle: "Part 1",
    fullTitle: "1. Introduction & Scope of Agreement",
    content: `<p>Welcome to MIRA Travel (“MIRA”, “we”, “our”, or “us”). We operate bespoke expedition journeys, cultural immersions, and private travel itineraries across the Balkan Peninsula, Adriatic coastlines, and Mediterranean landscapes.</p><p>These Terms and Conditions (“Terms”) constitute a legally binding agreement between MIRA Travel Expeditions Ltd and each traveler, group leader, or client contracting our services (“Traveler”, “Client”, “you”, or “your”).</p><p>By paying a deposit, confirming a custom itinerary, or making a reservation through our website, travel designers, or authorized partners, you explicitly confirm that you have read, understood, and agreed to be bound by these Terms, together with our Privacy Policy.</p>`,
  },
  {
    id: "booking-payment",
    tabTitle: "Part 2",
    fullTitle: "2. Booking, Deposit & Payment Terms",
    content: `<p>Due to the exclusive nature of our boutique accommodations, chartered vessels, and private guides, all bookings are subject to the following schedule:</p><ul><li><strong>Initial Deposit:</strong> A non-refundable deposit of 30% of the total journey price is required at the time of itinerary confirmation to secure accommodations, regional permits, and dedicated guides.</li><li><strong>Final Balance:</strong> The remaining 70% balance must be cleared no later than 60 days prior to the journey start date. For reservations made within 60 days of departure, full payment is due immediately.</li><li><strong>Accepted Currencies & Methods:</strong> Payments are processed securely in EUR (€) or GBP (£) via encrypted PCI-compliant bank wire transfers or major credit cards.</li></ul><p><strong>Please Note:</strong> If the final balance is not received by the due date, MIRA reserves the right to treat the booking as cancelled by the client, with applicable cancellation fees applied.</p>`,
  },
  {
    id: "cancellations-refunds",
    tabTitle: "Part 3",
    fullTitle: "3. Cancellations, Changes & Refund Policy",
    content: `<p>Should you need to cancel your journey, notice must be provided in writing via email to your dedicated travel designer. Cancellation fees are calculated based on the date written notice is received:</p><table><thead><tr><th>Notice Received Prior to Departure</th><th>Cancellation Fee (% of Total Cost)</th></tr></thead><tbody><tr><td>61+ days prior</td><td>Deposit amount (30%)</td></tr><tr><td>31 – 60 days prior</td><td>50% of total journey price</td></tr><tr><td>15 – 30 days prior</td><td>75% of total journey price</td></tr><tr><td>0 – 14 days prior (or no-show)</td><td>100% of total journey price</td></tr></tbody></table><p><strong>Itinerary Adjustments by MIRA:</strong> Due to weather conditions, mountain passes, or maritime safety, MIRA reserves the right to alter route sequences or substitute equal or superior accommodations and activities when safety requires.</p>`,
  },
  {
    id: "traveler-responsibilities",
    tabTitle: "Part 4",
    fullTitle: "4. Traveler Responsibilities & Documentation",
    content: `<p>Travelers are responsible for ensuring readiness and compliance with all travel requirements:</p><ul><li><strong>Passports & Visas:</strong> Valid passport with at least 6 months validity beyond your planned departure date. Travelers are solely responsible for obtaining any required entry visas for destination countries.</li><li><strong>Mandatory Travel Insurance:</strong> Comprehensive travel insurance covering medical emergencies, emergency mountain evacuation, trip cancellation, and baggage loss is strictly mandatory for all MIRA expeditions.</li><li><strong>Health & Fitness Disclosures:</strong> Travelers must disclose any pre-existing medical conditions, mobility restrictions, or dietary needs prior to booking to ensure activities are suitable and safe.</li></ul>`,
  },
  {
    id: "liability-risk",
    tabTitle: "Part 5",
    fullTitle: "5. Assumption of Risk & Limitation of Liability",
    content: `<p>Expeditions across rugged alpine terrains, remote coastal archipelagos, and ancient trail systems involve inherent environmental dynamics. By participating, you acknowledge and accept these elements.</p><p>MIRA acts as a curator and coordinator partnering with vetted regional suppliers, transport providers, boutique hoteliers, and licensed wilderness guides. To the maximum extent permitted under applicable law, MIRA shall not be held liable for acts of nature, delays caused by third-party transport operators, or force majeure events beyond our direct operational control.</p><p>Our total aggregate liability in connection with any claim arising under your booking shall not exceed the total sums paid by the traveler to MIRA for the specific journey.</p>`,
  },
  {
    id: "intellectual-property",
    tabTitle: "Part 6",
    fullTitle: "6. Intellectual Property & Code of Conduct",
    content: `<p>All custom itineraries, routes, branding, photographs, and editorial narratives curated by MIRA Travel are the proprietary intellectual property of MIRA Travel Expeditions Ltd and protected under international copyright law.</p><p><strong>Cultural Respect & Environmental Ethics:</strong> Travelers are expected to maintain respectful conduct toward local communities, indigenous heritage sites, wildlife, and fellow journey companions in accordance with our leave-no-trace conservation standards.</p>`,
  },
  {
    id: "governing-law",
    tabTitle: "Part 7",
    fullTitle: "7. Governing Law & Dispute Resolution",
    content: `<p>These Terms, along with any disputes or claims arising out of or in connection with them, shall be governed by and construed in accordance with the laws of England and Wales.</p><p>In the unlikely event of a dispute, both parties commit to engaging in good-faith informal discussions and mediation before initiating formal legal proceedings. The courts of England and Wales shall have exclusive jurisdiction to resolve any formal dispute.</p>`,
  },
  {
    id: "contact-inquiries",
    tabTitle: "Part 8",
    fullTitle: "8. Contact Information & Legal Support",
    content: `<p>If you have any questions regarding these Terms, booking conditions, or customized group agreements, please reach out to our legal and concierge team:</p><p><strong>MIRA Travel Legal & Concierge Office</strong><br />Email: legal@mira.travel<br />Telephone: +44 123 456 7890<br />Headquarters: MIRA Travel Expeditions Ltd, London, United Kingdom</p><p>For urgent itinerary updates or active journey assistance, your 24/7 concierge contact details are provided directly in your pre-departure travel briefing.</p>`,
  },
];

const combinedContent = defaultTermsSections
  .map((s) => `<h2>${s.fullTitle}</h2>${s.content}`)
  .join("<hr />");

const termsDataPayload = {
  page: "terms-of-service",
  title: "MIRA TERMS & CONDITIONS",
  effectiveDate: "01.08.2025",
  lastUpdated: "01.08.2025",
  parts: defaultTermsSections,
  content: combinedContent,
};

export async function seedTermsCmsPage() {
  console.log("🌱 Starting Terms & Conditions CMS Pages seed...");

  const slugsToSeed = ["terms-of-service", "terms"];

  for (const slug of slugsToSeed) {
    const existing = await prisma.cmsPage.findFirst({
      where: { slug, deletedAt: null },
    });

    if (existing) {
      const updated = await prisma.cmsPage.update({
        where: { id: existing.id },
        data: {
          name: "Terms & Conditions",
          slug,
          metadata: {
            title: "Terms & Conditions | MIRA Travel",
            description:
              "Review the terms, conditions, booking policies, and traveler agreements governing all bespoke journeys with MIRA Travel.",
          },
          data: termsDataPayload,
        },
      });
      console.log(`✅ Successfully updated '${slug}' CMS Page in DB. ID: ${updated.id}`);
    } else {
      const created = await prisma.cmsPage.create({
        data: {
          name: "Terms & Conditions",
          slug,
          metadata: {
            title: "Terms & Conditions | MIRA Travel",
            description:
              "Review the terms, conditions, booking policies, and traveler agreements governing all bespoke journeys with MIRA Travel.",
          },
          data: termsDataPayload,
        },
      });
      console.log(`✅ Successfully created '${slug}' CMS Page in DB. ID: ${created.id}`);
    }
  }

  console.log("🎉 Seed completed for Terms & Conditions CMS Pages!");
}

seedTermsCmsPage()
  .catch((e) => {
    console.error("❌ Seed script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
