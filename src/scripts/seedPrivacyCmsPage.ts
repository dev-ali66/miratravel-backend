import dotenv from "dotenv";
dotenv.config();

import prisma from "../config/prisma.js";

const defaultPrivacySections = [
  {
    id: "introduction",
    tabTitle: "Introduction",
    fullTitle: "Introduction & Scope",
    content: `<p>Welcome to MIRA Travel. We specialize in curating bespoke, culturally immersive, and transformative journeys across the wild frontiers of the Balkan and Mediterranean landscapes. In crafting exceptional travel experiences, we hold your personal privacy, trust, and confidentiality to the highest standard.</p><p>This Privacy Policy sets forth how MIRA Travel (“MIRA”, “we”, “our”, or “us”) collects, processes, protects, and discloses information gathered when you visit our website, communicate with our travel designers, or contract our personalized travel services.</p><p>By exploring our website or engaging with our travel concierge services, you acknowledge the data practices described herein. We adhere to applicable global privacy regulations, including the General Data Protection Regulation (GDPR) and UK GDPR frameworks.</p>`,
  },
  {
    id: "data-collection",
    tabTitle: "Data Collection",
    fullTitle: "Information We Collect",
    content: `<p>To design journeys tailored precisely to your preferences, we collect information you provide directly to us, as well as necessary technical data generated during your platform interactions:</p><h3>A. Personal Information You Provide:</h3><ul><li><strong>Identity & Contact:</strong> Full legal name, email address, telephone number, residential address, and emergency contact details.</li><li><strong>Travel Documentation:</strong> Passport number, nationality, date of birth, expiration dates, and visa details necessary for border clearance and regional accommodation registration.</li><li><strong>Health & Preferences:</strong> Dietary restrictions, mobility requirements, physical conditioning levels for treks, and specific cultural or botanical interests shared voluntarily.</li><li><strong>Payment Data:</strong> Billing address and tokenized transaction details processed through encrypted, PCI-compliant payment gateways. MIRA does not store raw credit card numbers.</li></ul><h3>B. Technical Data Collected Automatically:</h3><ul><li>IP address, approximate geographic location, browser type and version, device identifier, operating system, and language preferences.</li><li>Platform interactions, pages viewed, time spent on journey overviews, referring website addresses, and wishlist interactions.</li></ul>`,
  },
  {
    id: "use-of-data",
    tabTitle: "Use of Data",
    fullTitle: "How We Use Your Information",
    content: `<p>We process your personal information strictly for legitimate operational purposes and to deliver unforgettable journey experiences:</p><ul><li><strong>Bespoke Curation:</strong> Planning custom routes, arranging private mountain/heritage guides, and reserving accommodations tailored to your pace.</li><li><strong>Booking Execution:</strong> Confirming reservations with boutique lodges, regional transport operators, ferry charters, and culinary artisans.</li><li><strong>Traveler Support & Safety:</strong> Providing 24/7 concierge assistance during your journey, emergency coordination, and real-time itinerary updates.</li><li><strong>Communication & Dispatches:</strong> Sending pre-trip briefings, invoices, and, where you have subscribed, our seasonal newsletter dispatches.</li><li><strong>Legal & Regulatory Compliance:</strong> Complying with tax, aviation, maritime, and hospitality reporting requirements across European jurisdictions.</li></ul>`,
  },
  {
    id: "cookies",
    tabTitle: "Cookies",
    fullTitle: "Cookies & Tracking Technologies",
    content: `<p>MIRA utilizes cookies and similar web technologies to enhance performance, preserve your saved journeys, and analyze website traffic.</p><ul><li><strong>Essential Cookies:</strong> Critical for navigation, secure account authentication, and form processing. These cannot be disabled.</li><li><strong>Preference Cookies:</strong> Remember your selected currency, regional destinations, and saved itinerary collections.</li><li><strong>Analytics Cookies:</strong> Help us understand how visitors discover and navigate MIRA stories and routes, enabling us to continuously refine our content.</li></ul><p>You can modify your cookie settings through your browser preferences at any time. Disabling certain cookies may impact specific interactive features, such as map filtering or saved journey persistence.</p>`,
  },
  {
    id: "third-party-services",
    tabTitle: "Third-party Services",
    fullTitle: "Third-Party Partners & Data Sharing",
    content: `<p>We do not sell, rent, or trade your personal information. We disclose data solely to trusted partners essential to the execution of your travel:</p><ul><li><strong>Local Operating Partners:</strong> Licensed local expedition leaders, certified wilderness guides, family-run wine estates, and boutique hotel partners who fulfill your itinerary.</li><li><strong>Technology & Payment Providers:</strong> Cloud hosting, secure payment gateways, and client relationship systems that adhere to strict data security agreements.</li><li><strong>Regulatory Authorities:</strong> When legally mandated by law, subpoena, or international travel border security authorities.</li></ul><p>Where data transfers occur outside the European Economic Area (EEA), we ensure adequate safeguards such as Standard Contractual Clauses (SCCs) are established.</p>`,
  },
  {
    id: "your-rights",
    tabTitle: "Your Rights",
    fullTitle: "Your Rights & Privacy Choices",
    content: `<p>Under applicable data protection laws, you possess fundamental rights regarding your personal data:</p><ul><li><strong>Access & Rectification:</strong> You may request a copy of personal information we hold and request corrections to any inaccuracies.</li><li><strong>Erasure (“Right to Be Forgotten”):</strong> You may request deletion of your records, subject to regulatory travel recordkeeping and financial auditing requirements.</li><li><strong>Opt-Out of Communications:</strong> You may unsubscribe from our newsletter dispatches at any time via the unsubscribe link.</li><li><strong>Data Portability:</strong> Request the transfer of your profile and itinerary data in a structured, machine-readable format.</li></ul>`,
  },
  {
    id: "contact-us",
    tabTitle: "Contact Us",
    fullTitle: "Contacting Our Privacy Office",
    content: `<p>If you have inquiries, requests regarding your rights, or questions concerning this Privacy Policy, our dedicated Data Privacy Team is available:</p><p><strong>MIRA Travel Concierge & Privacy Office</strong><br />Email: privacy@mira.travel<br />Telephone: +44 123 456 7890<br />Headquarters: MIRA Travel Expeditions Ltd, London, United Kingdom</p><p>We will acknowledge all verified privacy requests within 48 hours and provide a full resolution within 30 calendar days.</p>`,
  },
];

const combinedContent = defaultPrivacySections
  .map((s) => `<h2>${s.fullTitle}</h2>${s.content}`)
  .join("<hr />");

const privacyDataPayload = {
  page: "privacy-policy",
  title: "MIRA PRIVACY POLICY",
  effectiveDate: "01.08.2025",
  lastUpdated: "01.08.2025",
  parts: defaultPrivacySections,
  content: combinedContent,
};

export async function seedPrivacyCmsPage() {
  console.log("🌱 Starting Privacy Policy CMS Pages seed...");

  const slugsToSeed = ["privacy-policy", "privacy"];

  for (const slug of slugsToSeed) {
    const existing = await prisma.cmsPage.findFirst({
      where: { slug, deletedAt: null },
    });

    if (existing) {
      const updated = await prisma.cmsPage.update({
        where: { id: existing.id },
        data: {
          name: "Privacy Policy",
          slug,
          metadata: {
            title: "Privacy Policy | MIRA Travel",
            description:
              "Learn how MIRA Travel collects, uses, and protects your personal data when curating bespoke luxury travel journeys across the Balkan and Mediterranean regions.",
          },
          data: privacyDataPayload,
        },
      });
      console.log(`✅ Successfully updated '${slug}' CMS Page in DB. ID: ${updated.id}`);
    } else {
      const created = await prisma.cmsPage.create({
        data: {
          name: "Privacy Policy",
          slug,
          metadata: {
            title: "Privacy Policy | MIRA Travel",
            description:
              "Learn how MIRA Travel collects, uses, and protects your personal data when curating bespoke luxury travel journeys across the Balkan and Mediterranean regions.",
          },
          data: privacyDataPayload,
        },
      });
      console.log(`✅ Successfully created '${slug}' CMS Page in DB. ID: ${created.id}`);
    }
  }

  console.log("🎉 Seed completed for Privacy Policy CMS Pages!");
}

seedPrivacyCmsPage()
  .catch((e) => {
    console.error("❌ Seed script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
