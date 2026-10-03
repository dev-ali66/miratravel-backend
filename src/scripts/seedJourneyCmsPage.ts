import dotenv from "dotenv";
dotenv.config();

import prisma from "../config/prisma.js";

const heroObj = {
  key: "hero",
  breadcrumb: {
    value: "EXPLORE JOURNEYS",
    textColor: "#E5E7EB",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  title: {
    value: "Tailored Balkan Journeys Crafted for Discerning Travelers",
    textColor: "#ffffff",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  subtitle: {
    value: "",
    textColor: "#E5E7EB",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  description: {
    value: "Discover handcrafted itineraries that combine cultural depth, boutique luxury, and unforgettable landscapes across the Balkans.",
    textColor: "#E5E7EB",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  isCenter: false,
  buttons: [],
  backgroundMultimedia: {
    show: "image",
    color: {
      color: "#182D09",
      opacity: 100,
      width: "100%",
      height: "100%",
      aspectRatio: "auto",
    },
    image: {
      url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1920&q=80",
      alt: "Tailored Balkan Journeys",
      opacity: 100,
      overlayColor: "#000000",
      overlayOpacity: 30,
    },
    video: {
      url: "",
      alt: "",
      autoplay: true,
      loop: true,
      muted: true,
    },
  },
};

const editorialHighlightObj = {
  key: "editorial_highlight",
  text: {
    value: "Every journey with MIRA is an invitation to experience the soul of the Balkans—where ancient heritage meets serene natural beauty.",
    textColor: "#AF6348",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  backgroundMultimedia: {
    show: "color",
    color: {
      color: "#FAF6F0",
      opacity: 100,
      width: "100%",
      height: "100%",
      aspectRatio: "auto",
    },
  },
};

const signatureJourneysObj = {
  key: "signature_journeys",
  eyebrow: {
    value: "CURATED EXPERIENCES",
    textColor: "#AF6348",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  title: {
    value: "Signature Journeys",
    textColor: "#111827",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  subtitle: {
    value: "Handcrafted multi-day itineraries designed to showcase the region's finest highlights.",
    textColor: "#4B5563",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  buttons: [],
  backgroundMultimedia: {
    show: "color",
    color: {
      color: "#FAF7F2",
      opacity: 100,
      width: "100%",
      height: "100%",
      aspectRatio: "auto",
    },
  },
};

const allJourneysObj = {
  key: "all_journeys",
  eyebrow: {
    value: "EXPLORE ALL",
    textColor: "#AF6348",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  title: {
    value: "All Journeys",
    textColor: "#111827",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  subtitle: {
    value: "Browse our complete portfolio of Balkan journeys filterable by interest and duration.",
    textColor: "#4B5563",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  searchPlaceholder: "Search journeys...",
  backgroundMultimedia: {
    show: "color",
    color: {
      color: "#FFFFFF",
      opacity: 100,
      width: "100%",
      height: "100%",
      aspectRatio: "auto",
    },
  },
};

const seoObj = {
  key: "seo",
  title: "Journeys | MIRA Travel",
  description: "Explore handcrafted Balkan journeys and luxury itineraries with MIRA.",
  keywords: ["balkan journeys", "mira travel", "custom travel", "luxury itineraries"],
  canonicalUrl: "https://miratravel.nl/journey",
  robots: {
    index: true,
    follow: true,
  },
};

const defaultJourneyPageData = {
  page: "journey",
  hero: heroObj,
  editorial_highlight: editorialHighlightObj,
  signature_journeys: signatureJourneysObj,
  all_journeys: allJourneysObj,
};

const defaultJourneyMetadata = {
  title: seoObj.title,
  description: seoObj.description,
  keywords: seoObj.keywords,
  canonicalUrl: seoObj.canonicalUrl,
  robots: seoObj.robots,
  seo: seoObj,
};

async function seedJourneyCmsPage() {
  try {
    console.log("Seeding Journey CMS Page...");

    const existingPage = await prisma.cmsPage.findFirst({
      where: {
        OR: [{ slug: "journey" }, { slug: "journeys" }, { name: "Journey" }, { name: "Journey CMS" }],
      },
    });

    if (existingPage) {
      console.log(`Found existing Journey CMS Page (id: ${existingPage.id}). Updating...`);
      const updated = await prisma.cmsPage.update({
        where: { id: existingPage.id },
        data: {
          name: "Journey CMS",
          slug: "journey",
          metadata: defaultJourneyMetadata as any,
          data: defaultJourneyPageData as any,
        },
      });
      console.log("Successfully updated Journey CMS Page:", updated.id);
    } else {
      console.log("Creating new Journey CMS Page...");
      const created = await prisma.cmsPage.create({
        data: {
          name: "Journey CMS",
          slug: "journey",
          metadata: defaultJourneyMetadata as any,
          data: defaultJourneyPageData as any,
        },
      });
      console.log("Successfully created Journey CMS Page:", created.id);
    }
  } catch (error) {
    console.error("Error seeding Journey CMS Page:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedJourneyCmsPage();
