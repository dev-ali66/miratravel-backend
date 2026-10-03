import dotenv from "dotenv";
dotenv.config();

import prisma from "../config/prisma.js";

const subscribeObj = {
  title: {
    value: "A Curated Travel Perspective",
    textColor: "#182D09",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  subtitle: {
    value: "Thoughtful dispatches featuring curated Balkan travel inspiration, MIRA Stories, regional travel insights, and selected journeys.",
    textColor: "#565E69",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  leftSideMultimedia: {
    show: "image",
    color: {
      color: "#FFFFFF",
      opacity: 100,
      width: "100%",
      height: "100%",
      aspectRatio: "auto",
    },
    image: {
      url: "",
      alt: "Travelers gathered at a scenic coastal viewpoint",
      fit: "cover",
      width: "100%",
      height: "auto",
      opacity: 100,
      aspectRatio: "auto",
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
    video: {
      url: "",
      alt: "",
      fit: "cover",
      width: "100%",
      height: "auto",
      opacity: 100,
      autoplay: true,
      loop: true,
      muted: true,
      aspectRatio: "auto",
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
  },
  backgroundMultimedia: {
    show: "color",
    color: {
      color: "#FFFFFF",
      opacity: 100,
      width: "100%",
      height: "100%",
      aspectRatio: "auto",
    },
    image: {
      url: "",
      alt: "Travelers gathered at a scenic coastal viewpoint",
      fit: "cover",
      width: "100%",
      height: "auto",
      opacity: 100,
      aspectRatio: "auto",
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
    video: {
      url: "",
      alt: "",
      fit: "cover",
      width: "100%",
      height: "auto",
      opacity: 100,
      autoplay: true,
      loop: true,
      muted: true,
      aspectRatio: "auto",
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
  },
};

const unsubscribeObj = {
  title: {
    value: "We're Sorry to See You Go",
    textColor: "#182D09",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  unsubscribedTitle: {
    value: "You're Unsubscribed",
    textColor: "#182D09",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  subtitle: {
    value: "If our travel dispatches no longer inspire your adventures, confirm your email below to unsubscribe. You can return at any time.",
    textColor: "#565E69",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  unsubscribedSubtitle: {
    value: "You have been removed from our dispatch list. Our curated stories and journey itineraries remain open whenever you wish to return.",
    textColor: "#565E69",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  reasonsTitle: {
    value: "Help us understand why (optional):",
    textColor: "#182D09",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  reasonsList: [
    "Emails are too frequent",
    "Content is no longer relevant",
    "Taking a break from travel planning",
    "I never signed up for this",
    "Other reasons",
  ],
  leftSideMultimedia: {
    show: "image",
    color: {
      color: "#FFFFFF",
      opacity: 100,
      width: "100%",
      height: "100%",
      aspectRatio: "auto",
    },
    image: {
      url: "",
      alt: "Traveler reflecting on a journey",
      fit: "cover",
      width: "100%",
      height: "auto",
      opacity: 100,
      aspectRatio: "auto",
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
    video: {
      url: "",
      alt: "",
      fit: "cover",
      width: "100%",
      height: "auto",
      opacity: 100,
      autoplay: true,
      loop: true,
      muted: true,
      aspectRatio: "auto",
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
  },
  backgroundMultimedia: {
    show: "color",
    color: {
      color: "#FFFFFF",
      opacity: 100,
      width: "100%",
      height: "100%",
      aspectRatio: "auto",
    },
    image: {
      url: "",
      alt: "Background",
      fit: "cover",
      width: "100%",
      height: "auto",
      opacity: 100,
      aspectRatio: "auto",
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
    video: {
      url: "",
      alt: "",
      fit: "cover",
      width: "100%",
      height: "auto",
      opacity: 100,
      autoplay: true,
      loop: true,
      muted: true,
      aspectRatio: "auto",
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
  },
};

const seoObj = {
  key: "seo",
  title: "Newsletter | Curated Balkan Travel Inspiration | MIRA",
  description: "Join MIRA for curated Balkan travel inspiration, evocative stories, regional travel insights, and selected journeys across the Balkan and Mediterranean frontiers.",
  keywords: ["newsletter", "balkan travel", "travel dispatches", "mira travel", "luxury itineraries"],
  canonicalUrl: "https://politravel.com/newsletter",
  robots: {
    index: true,
    follow: true,
  },
};

const defaultNewsletterPageData = {
  page: "newsletter",
  subscribe: subscribeObj,
  unsubscribe: unsubscribeObj,
};

const defaultNewsletterMetadata = {
  title: seoObj.title,
  description: seoObj.description,
  keywords: seoObj.keywords,
  canonicalUrl: seoObj.canonicalUrl,
  robots: seoObj.robots,
  seo: seoObj,
};

async function seedNewsletterCmsPage() {
  try {
    console.log("Seeding Newsletter CMS Page...");

    const existingPage = await prisma.cmsPage.findFirst({
      where: {
        OR: [{ slug: "newsletter" }, { name: "Newsletter" }, { name: "Newsletter CMS" }],
      },
    });

    if (existingPage) {
      console.log(`Found existing Newsletter CMS Page (id: ${existingPage.id}). Updating...`);
      const updated = await prisma.cmsPage.update({
        where: { id: existingPage.id },
        data: {
          name: "Newsletter CMS",
          slug: "newsletter",
          metadata: defaultNewsletterMetadata as any,
          data: defaultNewsletterPageData as any,
        },
      });
      console.log("Successfully updated Newsletter CMS Page:", updated.id);
    } else {
      console.log("Creating new Newsletter CMS Page...");
      const created = await prisma.cmsPage.create({
        data: {
          name: "Newsletter CMS",
          slug: "newsletter",
          metadata: defaultNewsletterMetadata as any,
          data: defaultNewsletterPageData as any,
        },
      });
      console.log("Successfully created Newsletter CMS Page:", created.id);
    }
  } catch (error) {
    console.error("Error seeding Newsletter CMS Page:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNewsletterCmsPage();
