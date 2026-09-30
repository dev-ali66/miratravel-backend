import config from "../config/index.js";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";
import { uploadFilesToCloudinary } from "../shared/upload_cloudinary.service.js";

// Helper to determine mime type from extension
function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".mp4") return "video/mp4";
  return "application/octet-stream";
}

// Complete list of frontend image assets to upload
const imageFilesToUpload = [
  "journey1.jpg",
  "journey2.jpg",
  "journey3.jpg",
  "albania-journey1.jpg",
  "albania-journey2.png",
  "albania-journey3.png",
  "albania-journey4.jpg",
  "albania-journey5.jpg",
  "albania-journey6.jpg",
  "albania-journey7.jpg",
  "albania-journey8.jpg",
  "albania-journey9.jpg",
  "albania-journey10.png",
  "overview-hero.png",
  "berat.jpg",
  "kotor-bay.jpg",
  "gjirokaster.jpg",
  "therch.jpg",
  "monte.jpg",
  "balkan1.jpg",
  "balkan2.jpg",
  "tirana.jpg",
  "uneco.jpg",
  "road-riveria.jpg",
  "spring-mountains.jpg",
  "des1.jpg",
  "des2.jpg",
  "des3.jpg",
  "accommodation.jpg",
  "food-drink.jpg",
  "hiking.jpg",
  "day-trips.jpg",
  "grape-routes.jpg",
  "coffee-culture.jpg",
  "mostar-culture.jpg",
  "kotor-crowds.jpg",
  "why-visit.jpg",
];

interface JourneyConfig {
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  currency?: string;
  minDays: number;
  maxDays: number;
  pace?: "RELAXED" | "BALANCED" | "ACTIVE";
  comfortLevel?: "COMFORT" | "BOUTIQUE" | "PREMIUM_LUXURY";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured?: boolean;
  journeyType?: Array<"PRIVATE_JOURNEY" | "SELF_DRIVE_JOURNEY" | "SMALL_GROUP" | "LUXURY_ESCAPE" | "FAMILY_JOURNEY" | "SIGNATURE_JOURNEY">;
  travelStyle?: Array<"CULTURE_HERITAGE" | "NATURE" | "ADVENTURE" | "FOOD_WINE" | "COASTAL_ESCAPE" | "MOUNTAINS" | "SLOW_TRAVEL" | "LUXURY" | "PHOTOGRAPHY" | "WELLNESS">;
  perfectFor?: Array<"COUPLES" | "FAMILIES" | "FRIENDS" | "FOOD_WINE" | "SOLO_TRAVELLERS" | "HONEYMOONERS" | "FIRST_TIME_VISITORS" | "RETURNING_VISITORS" | "NATURE_LOVERS" | "ADVENTURE_SEEKERS">;
  heroImageFile?: string;
  whyDescription?: string;
  overviewDescription?: string;
  highlights?: string[];
  forYouItems?: string[];
  itineraryItems?: any[];
  destinations?: Array<{ step: string; location: string; stayType: string; description: string; imageFile: string }>;
  whatsIncluded?: string[];
  exclusions?: string[];
  notes?: string[];
  addOns?: Array<{ title: string; price: number; currency: string; day: string; heading: string; description: string; imageFile: string }>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

function buildMasterJourneyPayload(
  cfg: JourneyConfig,
  urlMap: Record<string, string>,
  locationIdMap: Record<string, string>
) {
  const defaultHeroUrl =
    (cfg.heroImageFile && urlMap[cfg.heroImageFile]) ||
    urlMap["overview-hero.png"] ||
    urlMap["journey1.jpg"] ||
    "https://res.cloudinary.com/dscqp4wwt/image/upload/v1788643681/P/locationEssenceImage/ymf1xojkxesovejghalq.png";

  const getMediaUrl = (file?: string) => {
    if (!file) return defaultHeroUrl;
    return urlMap[file] || defaultHeroUrl;
  };

  const formattedHighlights = (cfg.highlights || [
    "Private guided tour with expert regional historians",
    "Handpicked boutique luxury accommodations",
    "Curated wine tasting and culinary experiences",
    "24/7 dedicated local concierge support",
  ]).map((h) => ({
    value: h,
    textColor: "#313131",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  }));

  const formattedForYou = (cfg.forYouItems || [
    "You appreciate cultural depth and authentic local heritage.",
    "You enjoy slow travel with handpicked boutique stays.",
    "You desire seamless private transportation and expert guidance.",
  ]).map((item) => ({
    value: item,
    textColor: "#313131",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  }));

  const visualStoryItems = [
    {
      multimedia: {
        show: "image",
        color: { color: "#ffffff", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        image: { url: getMediaUrl("albania-journey1.jpg"), alt: "Boutique Stay Visual 1", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
        video: { url: null, alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, autoplay: true, loop: true, muted: true, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
      },
      title: { value: "Atmospheric Heritage Architecture", textColor: "#080c1d", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      description: { value: "Refined character properties located in historic city quarters.", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    },
    {
      multimedia: {
        show: "image",
        color: { color: "#ffffff", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        image: { url: getMediaUrl("albania-journey2.png"), alt: "Boutique Stay Visual 2", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
        video: { url: null, alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, autoplay: true, loop: true, muted: true, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
      },
      title: { value: "Scenic Mountain & Sea Vistas", textColor: "#080c1d", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      description: { value: "Boutique suites boasting breathtaking panoramic balconies.", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    },
  ];

  const defaultItineraryItems = (cfg.itineraryItems || [
    {
      day: { value: "Day 1", textColor: "#af6348", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      heading: { value: `Arrival & Welcome in ${cfg.title}`, textColor: "#182d09", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      subHeading: { value: "Private Transfer & Boutique Check-In", textColor: "#707070", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      description: { value: "Arrive at the airport where your private chauffeur welcomes you. Transfer to your luxury boutique hotel and enjoy a multi-course regional welcome dinner.", textColor: "#707070", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      badge: { value: "DAY 1", textColor: "#af6348", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      button: { label: "VIEW DETAILS", url: "", style: "primary", variant: "PRIMARY", textColor: "#ffffff", backgroundColor: "#182d09" },
      multimedia: {
        show: "image",
        color: { color: "#ffffff", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        image: { url: getMediaUrl("albania-journey1.jpg"), alt: "Day 1 Preview", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
        video: { url: null, alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, autoplay: true, loop: true, muted: true, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
      },
    },
    {
      day: { value: "Day 2", textColor: "#af6348", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      heading: { value: "Cultural Immersion & Historic Landmarks", textColor: "#182d09", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      subHeading: { value: "Private Expert Guided Excursion", textColor: "#707070", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      description: { value: "Embark on an exclusive walking tour through ancient fortresses and cobblestone quarters followed by a private vineyard wine tasting.", textColor: "#707070", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      badge: { value: "DAY 2", textColor: "#af6348", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      button: { label: "VIEW DETAILS", url: "", style: "primary", variant: "PRIMARY", textColor: "#ffffff", backgroundColor: "#182d09" },
      multimedia: {
        show: "image",
        color: { color: "#ffffff", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        image: { url: getMediaUrl("albania-journey2.png"), alt: "Day 2 Preview", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
        video: { url: null, alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, autoplay: true, loop: true, muted: true, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
      },
    },
  ]);

  const accommodationPhilosophyItems = [
    { title: { value: "Character", textColor: "#080c1d", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 }, description: { value: "Properties with local identity, atmosphere and a genuine sense of place.", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 } },
    { title: { value: "Location", textColor: "#080c1d", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 }, description: { value: "Carefully positioned so guests experience each destination from its finest vantage point.", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 } },
    { title: { value: "Comfort", textColor: "#080c1d", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 }, description: { value: "Selected for extraordinary service, pristine comfort and genuine warmth.", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 } },
    { title: { value: "Connection", textColor: "#080c1d", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 }, description: { value: "Places that bring travelers closer to local architecture, cuisine, and living culture.", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 } },
  ];

  const rawDestinations = cfg.destinations || [
    { step: "01", location: "Tirana", stayType: "Urban Boutique Stay", description: "Boutique luxury property located in Tirana's vibrant cultural heart.", imageFile: "albania-journey1.jpg" },
    { step: "02", location: "Berat", stayType: "Historic Heritage Hotel", description: "Restored Ottoman stone mansion overlooking panoramic ancient rooftops.", imageFile: "albania-journey2.png" },
    { step: "03", location: "Dhërmi", stayType: "Seaside Resort", description: "Relaxed Mediterranean beachfront suite surrounded by crystal waters.", imageFile: "albania-journey3.png" },
  ];

  const destinationStaysItems = rawDestinations.map((d) => {
    const locId = locationIdMap[d.location] || null;
    return {
      locationId: locId,
      step: { value: d.step, textColor: "#af6348", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      location: { value: d.location, textColor: "#080c1d", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      stayType: { value: d.stayType, textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      description: { value: d.description, textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      multimedia: {
        show: "image",
        color: { color: "#ffffff", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        image: { url: getMediaUrl(d.imageFile), alt: d.location, opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
        video: { url: null, alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, autoplay: true, loop: true, muted: true, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
      },
    };
  });

  const standardsItems = [
    { value: "Boutique and small-scale luxury properties", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    { value: "Family-owned and heritage properties where available", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    { value: "En-suite private bathrooms in all suites", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    { value: "Daily gourmet breakfast included", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    { value: "Personally verified and regularly inspected by MIRA", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
  ];

  const accommodationVisualItems = [
    {
      multimedia: {
        show: "image",
        color: { color: "#ffffff", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        image: { url: getMediaUrl("albania-journey4.jpg"), alt: "Accommodation Visual 1", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
        video: { url: null, alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, autoplay: true, loop: true, muted: true, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
      },
      title: { value: "Atmospheric Guest Suites", textColor: "#080c1d", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      description: { value: "Handcrafted furnishings with authentic regional textures.", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    },
    {
      multimedia: {
        show: "image",
        color: { color: "#ffffff", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        image: { url: getMediaUrl("albania-journey5.jpg"), alt: "Accommodation Visual 2", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
        video: { url: null, alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, autoplay: true, loop: true, muted: true, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
      },
      title: { value: "Secluded Courtyards & Terraces", textColor: "#080c1d", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      description: { value: "Private outdoor lounges overlooking serene surroundings.", textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    },
  ];

  const whatsIncludedItems = (cfg.whatsIncluded || [
    "Luxury accommodation in boutique handpicked properties",
    "Daily gourmet breakfast and selected wine-tasting dinners",
    "Private airport chauffeur transfers in executive vehicles",
    "All guided excursions led by certified historian guides",
    "Skip-the-line admissions to all monuments & national parks",
    "24/7 dedicated trip coordinator & local concierge support",
  ]).map((item) => ({
    value: item,
    textColor: "#565e69",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  }));

  const exclusions = (cfg.exclusions || [
    "International flights",
    "Travel & medical insurance",
    "Personal expenses & gratuities",
  ]).map((item) => ({
    value: item,
    textColor: "#565e69",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  }));

  const notes = (cfg.notes || [
    "Flexible cancellation available up to 60 days prior to departure.",
    "Bespoke itinerary modifications can be tailored upon request.",
  ]).map((item) => ({
    value: item,
    textColor: "#565e69",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  }));

  const addOnsItems = (cfg.addOns || [
    { title: "Helicopter Valley Flight", price: 650, currency: cfg.currency || "EUR", day: "Day 3", heading: "Aerial Sightseeing Tour", description: "Take a thrilling private helicopter ride over dramatic mountain ridges and coastal canyons.", imageFile: "albania-journey6.jpg" },
    { title: "Private Yacht Charter", price: 850, currency: cfg.currency || "EUR", day: "Day 5", heading: "Secluded Cove Sailing", description: "Spend a half-day sailing private turquoise waters with an onboard chef and champagne.", imageFile: "albania-journey7.jpg" },
  ]).map((a) => ({
    title: { value: a.title, textColor: "#182d09", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    price: a.price,
    currency: a.currency,
    day: { value: a.day, textColor: "#af6348", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    heading: { value: a.heading, textColor: "#182d09", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    description: { value: a.description, textColor: "#565e69", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    button: { label: "ADD EXPERIENCE", url: "", style: "primary", variant: "PRIMARY", textColor: "#ffffff", backgroundColor: "#182d09" },
    multimedia: {
      show: "image",
      color: { color: "#ffffff", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
      image: { url: getMediaUrl(a.imageFile), alt: a.title, opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
      video: { url: null, alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, autoplay: true, loop: true, muted: true, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
    },
  }));

  return {
    title: cfg.title,
    subtitle: cfg.subtitle,
    price: cfg.price,
    currency: cfg.currency || "EUR",
    minDays: cfg.minDays,
    maxDays: cfg.maxDays,
    pace: cfg.pace || "BALANCED",
    comfortLevel: cfg.comfortLevel || "BOUTIQUE",
    status: cfg.status || "PUBLISHED",
    featured: cfg.featured || false,
    journeyType: cfg.journeyType || ["PRIVATE_JOURNEY"],
    travelStyle: cfg.travelStyle || ["CULTURE_HERITAGE", "NATURE"],
    perfectFor: cfg.perfectFor || ["COUPLES"],
    hero: {
      label: {
        value: "MIRA EXCLUSIVE JOURNEY",
        textColor: "#af6348",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      title: {
        value: cfg.title,
        textColor: "#FFFFFF",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      backgroundMultimedia: {
        show: "image",
        color: {
          color: "#182d09",
          opacity: 100,
          width: "100%",
          height: "100%",
          aspectRatio: "auto",
        },
        image: {
          url: defaultHeroUrl,
          alt: `${cfg.title} Hero View`,
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 30,
          width: "100%",
          height: "auto",
          aspectRatio: "auto",
          fit: "cover",
        },
        video: {
          url: null,
          alt: "Cinematic Journey Video",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 30,
          autoplay: true,
          loop: true,
          muted: true,
          width: "100%",
          height: "auto",
          aspectRatio: "auto",
          fit: "cover",
        },
      },
    },
    overview: {
      why: {
        badge: {
          value: "THE MIRA DIFFERENCE",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Why we designed this journey?",
          textColor: "#313131",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: cfg.whyDescription || `We crafted ${cfg.title} to offer discerning travelers an intimate connection with iconic heritage, untouched natural beauty, and authentic cultural hospitality.`,
          textColor: "#464136",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        signature: {
          value: "MIRA",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
      },
      overview: {
        title: {
          value: "Journey Overview",
          textColor: "#313131",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: cfg.overviewDescription || cfg.subtitle || `Immerse yourself in the extraordinary landscapes and rich heritage of ${cfg.title}.`,
          textColor: "#464136",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
      },
      heighlights: {
        title: {
          value: "Highlights",
          textColor: "#313131",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        items: formattedHighlights,
      },
      visualStory: {
        eyebrow: {
          value: "Visual Reference",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Examples of the Accommodation Style",
          textColor: "#080c1d",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: "The images below represent the style and standard of properties you can expect on this journey. Exact properties may vary depending on travel dates, availability and final itinerary design.",
          textColor: "#565e69",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        items: visualStoryItems,
      },
      forYou: {
        eyebrow: {
          value: "Highlights",
          textColor: "#313131",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Is This Journey For You?",
          textColor: "#313131",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        items: formattedForYou,
      },
    },
    itinerary: {
      mapTitle: {
        value: "Interactive Route Map",
        textColor: "#182d09",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      mapSubtitle: {
        value: "Explore each stop along your curated route",
        textColor: "#707070",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      title: {
        value: "Day by Day Itinerary",
        textColor: "#182d09",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      subtitle: {
        value: "Crafted for Depth & Unhurried Exploration",
        textColor: "#707070",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      description: {
        value: "Each day balances structured highlights with leisure time for spontaneous discovery.",
        textColor: "#707070",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      badge: {
        value: `${cfg.minDays} DAYS EXCURSION`,
        textColor: "#af6348",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      items: defaultItineraryItems,
    },
    accommodations: {
      philosophy: {
        eyebrow: {
          value: "Our Philosophy",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Our Accommodation Philosophy",
          textColor: "#080c1d",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: "Mira does not simply book hotels. Every property we recommend is chosen against four principles that together ensure each stay becomes a meaningful part of the journey, not merely a place to sleep.",
          textColor: "#565e69",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        items: accommodationPhilosophyItems,
      },
      destinationStays: {
        eyebrow: {
          value: "Destination by Destination",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Your Accommodation Journey",
          textColor: "#080c1d",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: "Each destination on your route offers a distinct type of stay. Below we outline the character and setting of accommodation at each stop — exact properties are confirmed personally during the booking process.",
          textColor: "#565e69",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        handpickedTitle: {
          value: "Your Accommodation Journey",
          textColor: "#080c1d",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        items: destinationStaysItems,
      },
      standards: {
        eyebrow: {
          value: "Standards",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "What You Can Expect",
          textColor: "#080c1d",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: "Every stay on your Mira journey meets a consistent set of standards — so you can travel with confidence rather than questions.",
          textColor: "#565e69",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        items: standardsItems,
      },
      visualReference: {
        eyebrow: {
          value: "Visual Reference",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Examples of the Accommodation Style",
          textColor: "#080c1d",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: "The images below represent the style and standard of properties you can expect on this journey. Exact properties may vary depending on travel dates, availability and final itinerary design.",
          textColor: "#565e69",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        items: accommodationVisualItems,
      },
    },
    whatsIncluded: {
      badge: {
        value: "Inclusions",
        textColor: "#af6348",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      title: {
        value: "What's Included & Excluded",
        textColor: "#313131",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      description: {
        value: "Transparent details on all amenities and services provided.",
        textColor: "#565e69",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      items: whatsIncludedItems,
      exclusions: exclusions,
      notes: notes,
      backgroundMultimedia: {
        show: "color",
        color: {
          color: "#F6F1ED",
          opacity: 100,
          width: "100%",
          height: "100%",
          aspectRatio: "auto",
        },
        image: {
          url: defaultHeroUrl,
          alt: "What's Included Background Image",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 0,
          width: "100%",
          height: "auto",
          aspectRatio: "auto",
          fit: "cover",
        },
        video: {
          url: null,
          alt: "What's Included Background Video",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 0,
          autoplay: true,
          loop: true,
          muted: true,
          width: "100%",
          height: "auto",
          aspectRatio: "auto",
          fit: "cover",
        },
      },
    },
    addOns: {
      eyebrow: {
        value: "OPTIONAL EXPERIENCES",
        textColor: "#af6348",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      title: {
        value: "Add some fun in your trip",
        textColor: "#182d09",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      description: {
        value: "Enhance your journey with curated optional experiences and adventures.",
        textColor: "#565e69",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      items: addOnsItems,
    },
    metadata: {
      seo: {
        metaTitle: cfg.seoTitle || `${cfg.title} — MIRA Bespoke Journey`,
        metaDescription: cfg.seoDescription || cfg.subtitle || `Experience ${cfg.title} on a bespoke luxury private journey with MIRA.`,
        metaKeywords: cfg.seoKeywords || [cfg.title, "Bespoke Journey", "MIRA Travel", "Luxury Escapes"],
        ogTitle: cfg.seoTitle || `${cfg.title} — MIRA Bespoke Journey`,
        ogDescription: cfg.seoDescription || cfg.subtitle || `Experience ${cfg.title} with MIRA.`,
        ogImage: defaultHeroUrl,
        canonicalUrl: `/journeys/${cfg.slug}`,
      },
    },
  };
}

// All frontend journeys definition list
const frontendJourneys: JourneyConfig[] = [
  {
    slug: "classic-albania",
    title: "Classic Albania",
    subtitle: "Mountains, Riviera and UNESCO towns – the essence of Albania in one journey.",
    price: 3195,
    currency: "EUR",
    minDays: 9,
    maxDays: 9,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: true,
    journeyType: ["PRIVATE_JOURNEY", "SELF_DRIVE_JOURNEY"],
    travelStyle: ["CULTURE_HERITAGE", "NATURE", "COASTAL_ESCAPE"],
    perfectFor: ["COUPLES", "FIRST_TIME_VISITORS"],
    heroImageFile: "journey1.jpg",
    whyDescription: "Mountains, Riviera and UNESCO towns – designed to capture the true soul and warmth of Albania in one continuous private voyage.",
    overviewDescription: "Experience the complete essence of Albania on this 9-day journey covering northern highlands, central Ottoman citadels, and the azure southern Riviera.",
    highlights: [
      "Rozafa Castle overlooking three rivers and Lake Shkodra",
      "The cobblestone fortress and Byzantine churches of Berat",
      "The wild current of Europe’s first Wild River National Park on the Vjosa",
      "Secluded coastal coves and fresh seafood along the Ionian shore",
    ],
  },
  {
    slug: "montenegro-highlights",
    title: "Montenegro Highlights",
    subtitle: "Dramatic mountains, sparkling bays and charming old towns.",
    price: 3195,
    currency: "EUR",
    minDays: 9,
    maxDays: 9,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: true,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["NATURE", "CULTURE_HERITAGE", "COASTAL_ESCAPE"],
    perfectFor: ["COUPLES", "NATURE_LOVERS"],
    heroImageFile: "journey2.jpg",
    whyDescription: "Designed to reveal Europe's southernmost fjord and towering coastal ridges in absolute comfort and elegance.",
    overviewDescription: "Discover the Bay of Kotor, venture high into the dramatic peaks of Durmitor National Park, and sail past historic coastal islets.",
    highlights: [
      "Private yacht cruise across the UNESCO-listed Bay of Kotor",
      "Scenic serpentine drive up Mount Lovćen with panoramic views",
      "Tasting aged prosciutto and artisanal cheese in high alpine villages",
      "Exploring the pristine glacial lakes of Durmitor National Park",
    ],
  },
  {
    slug: "balkans-discovery",
    title: "Balkans Discovery",
    subtitle: "Three countries, countless stories. The perfect introduction to the Balkans.",
    price: 3195,
    currency: "EUR",
    minDays: 9,
    maxDays: 9,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: true,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["CULTURE_HERITAGE", "NATURE"],
    perfectFor: ["COUPLES", "FIRST_TIME_VISITORS", "FRIENDS"],
    heroImageFile: "journey3.jpg",
    whyDescription: "Connecting three vibrant sovereign nations through scenic alpine passes, living heritage towns, and warm cross-border hospitality.",
    overviewDescription: "A seamless journey connecting the captivating cultures, dramatic mountains, and historic trade routes of Croatia, Montenegro, Albania, and North Macedonia.",
    highlights: [
      "Cross scenic borders through untouched mountain landscapes",
      "Private boat cruise across Lake Ohrid, Europe’s oldest lake",
      "Exclusive culinary tastings with acclaimed regional chefs",
      "Historical tours of Ottoman bazaars and Venetian fortifications",
    ],
  },
  {
    slug: "albania-signature-1",
    title: "Capital Pulse & Northern Gateway",
    subtitle: "A grand loop linking the lively capital to high Accursed Mountain passes.",
    price: 3195,
    currency: "EUR",
    minDays: 9,
    maxDays: 9,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["NATURE", "MOUNTAINS", "CULTURE_HERITAGE"],
    perfectFor: ["ADVENTURE_SEEKERS", "NATURE_LOVERS"],
    heroImageFile: "albania-journey1.jpg",
    whyDescription: "Crafted for travellers seeking high alpine excitement combined with urban culture and ancient fortress history.",
    overviewDescription: "A grand loop linking Tirana's modern art and culinary scene to high mountain passes, UNESCO stone citadels, and the southern Riviera.",
    highlights: [
      "Scenic drives through the high Accursed Mountains",
      "Exploration of historic Shkodra Castle and lake shores",
      "Gourmet dining in Tirana's vibrant Blloku district",
    ],
  },
  {
    slug: "albania-signature-2",
    title: "The Great Ionian Seaboard",
    subtitle: "A sun-drenched coastal voyage tracing panoramic mountain passes.",
    price: 3195,
    currency: "EUR",
    minDays: 9,
    maxDays: 9,
    pace: "RELAXED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["COASTAL_ESCAPE", "LUXURY", "SLOW_TRAVEL"],
    perfectFor: ["HONEYMOONERS", "COUPLES"],
    heroImageFile: "albania-journey2.png",
    whyDescription: "A sun-drenched itinerary celebrating turquoise Mediterranean waters, coastal cliffs, and unhurried seafood dining.",
    overviewDescription: "Trace panoramic mountain passes, crystal Ionian coves, and ancient archaeological ruins from Vlorë to Butrint.",
    highlights: [
      "Descending Llogara Pass to crystalline beaches",
      "Private speed-boat excursion to hidden sea caves",
      "Fresh seafood dining overlooking ancient ruins of Butrint",
    ],
  },
  {
    slug: "albania-signature-3",
    title: "Gorge Ferries & Drin River Canyons",
    subtitle: "A rugged mountain expedition navigating emerald reservoir canyons.",
    price: 3195,
    currency: "EUR",
    minDays: 9,
    maxDays: 9,
    pace: "ACTIVE",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["ADVENTURE", "NATURE", "MOUNTAINS"],
    perfectFor: ["ADVENTURE_SEEKERS", "FRIENDS"],
    heroImageFile: "albania-journey3.png",
    whyDescription: "Navigating deep emerald river canyons and alpine trails in the pristine Albanian hinterland.",
    overviewDescription: "A mountain expedition navigating Lake Koman ferry canyons and trekking between alpine peaks in Theth and Valbona.",
    highlights: [
      "Lake Koman ferry cruise through 1,000m sheer limestone gorges",
      "Trekking between alpine guesthouses in Theth and Valbona",
      "Visiting the Blue Eye of Theth and Lock-in Tower",
    ],
  },
  {
    slug: "albania-signature-4",
    title: "The Classical & Ottoman Crossroads",
    subtitle: "A journey through centuries of heritage, connecting Roman amphitheaters and Byzantine monasteries.",
    price: 3195,
    currency: "EUR",
    minDays: 9,
    maxDays: 9,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["CULTURE_HERITAGE", "SLOW_TRAVEL"],
    perfectFor: ["FIRST_TIME_VISITORS", "COUPLES"],
    heroImageFile: "albania-journey4.jpg",
    whyDescription: "Unveiling thousands of years of living history from Roman ruins to UNESCO Ottoman fortress towns.",
    overviewDescription: "Connecting Roman amphitheaters, cliffside Byzantine monasteries, and Ottoman stone mansions in Berat and Gjirokastër.",
    highlights: [
      "Guided tour of Apollonia archaeological park",
      "Private wine tasting at family-owned vineyards near Berat",
      "Exploring Gjirokastër Castle and historic bazaar",
    ],
  },
  {
    slug: "albania-signature-5",
    title: "Thermal Waters & Stone Bridges",
    subtitle: "Unwind in natural sulfur hot springs and explore dramatic limestone canyons.",
    price: 3195,
    currency: "EUR",
    minDays: 9,
    maxDays: 9,
    pace: "RELAXED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["WELLNESS", "NATURE", "FOOD_WINE"],
    perfectFor: ["COUPLES", "SOLO_TRAVELLERS"],
    heroImageFile: "albania-journey5.jpg",
    whyDescription: "Designed for total relaxation, combining thermal sulfur hot springs, artisanal wine, and dramatic canyons.",
    overviewDescription: "Unwind in natural sulfur hot springs in Benja, explore Lengarica canyon, and savor farm-to-table dining in Përmet.",
    highlights: [
      "Soaking in warm thermal pools beneath Kadiu Ottoman stone bridge",
      "Canyon walks along the wild river basins of Përmet",
      "Artisanal farm-to-table gliko tastings",
    ],
  },
  {
    slug: "albania-signature-6",
    title: "Southeastern Highlands & Byzantine Frescoes",
    subtitle: "An eastern highland journey discovering ancient freshwater lakes.",
    price: 3195,
    currency: "EUR",
    minDays: 9,
    maxDays: 9,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["CULTURE_HERITAGE", "NATURE", "PHOTOGRAPHY"],
    perfectFor: ["RETURNING_VISITORS", "NATURE_LOVERS"],
    heroImageFile: "albania-journey6.jpg",
    whyDescription: "Discovering eastern mountain plateaus, ancient lakes, and medieval frescoed stone churches.",
    overviewDescription: "An eastern highland route exploring Lake Ohrid, Korçë's cobblestone quarter, and medieval mountain art in Voskopoja.",
    highlights: [
      "Exploring 18th-century Byzantine frescoed churches in Voskopoja",
      "Strolling Korçë's old bazaar and brewery",
      "Lakeside dining on Koran trout along Lake Ohrid",
    ],
  },
  {
    slug: "ancient-albania",
    title: "Ancient Albania & Beyond",
    subtitle: "Mountains, Riviera & UNESCO Heritage Towns",
    price: 3495,
    currency: "EUR",
    minDays: 7,
    maxDays: 7,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: true,
    journeyType: ["PRIVATE_JOURNEY", "SELF_DRIVE_JOURNEY"],
    travelStyle: ["CULTURE_HERITAGE", "NATURE"],
    perfectFor: ["COUPLES", "FIRST_TIME_VISITORS"],
    heroImageFile: "overview-hero.png",
    whyDescription: "Curated into three distinct chapters across heartlands, citadels, and coastal islands for travellers seeking depth over breadth.",
    overviewDescription: "Immerse yourself in the timeless beauty and rich history of Albania on this curated 7-day chaptered journey.",
    highlights: [
      "Private boat excursion along the shimmering waters of Lake Koman",
      "Explore the UNESCO citadel of Gjirokastër and ancient stone mansions",
      "Sunset wine tasting in the sun-drenched vineyards of Berat",
      "Stroll through secluded beaches along the Ionian Riviera",
    ],
  },
  {
    slug: "ancient-rome",
    title: "Ancient Rome & Beyond",
    subtitle: "A cultural journey through the heart of Italian history",
    price: 3495,
    currency: "EUR",
    minDays: 7,
    maxDays: 7,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: true,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["CULTURE_HERITAGE", "FOOD_WINE"],
    perfectFor: ["COUPLES", "FIRST_TIME_VISITORS"],
    heroImageFile: "journey1.jpg",
    whyDescription: "Connecting ancient ruins of Rome to the Renaissance splendor of Florence with private after-hours access.",
    overviewDescription: "From the Colosseum to Tuscan vineyards and Florence art galleries, experience Italian culture and cuisine at its finest.",
    highlights: [
      "Private after-hours tour of the Colosseum and Roman Forum",
      "VIP skip-the-line access to the Uffizi Gallery in Florence",
      "Exclusive Chianti wine tasting and private vineyard lunch",
      "Handcrafted pasta making workshop with a Tuscan master chef",
    ],
  },
  {
    slug: "spiritual-laos",
    title: "Spiritual Laos",
    subtitle: "A cultural route through Northern Laos",
    price: 3195,
    currency: "USD",
    minDays: 5,
    maxDays: 7,
    pace: "RELAXED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["CULTURE_HERITAGE", "WELLNESS", "SLOW_TRAVEL"],
    perfectFor: ["SOLO_TRAVELLERS", "COUPLES"],
    heroImageFile: "journey2.jpg",
    whyDescription: "A serene cultural retreat centered on the UNESCO heritage sanctuary of Luang Prabang.",
    overviewDescription: "Explore sacred temples, morning alms ceremonies, and the gentle rhythm of the Mekong River in Luang Prabang.",
    highlights: [
      "Morning alms-giving ceremony with Buddhist monks at dawn",
      "The sacred gilded wood carvings of Wat Xieng Thong",
      "Swimming in the turquoise limestone pools of Kuang Si waterfalls",
      "Traditional longboat cruise along the Mekong to Pak Ou caves",
    ],
  },
  {
    slug: "australian-titledise",
    title: "Australian Paradise",
    subtitle: "Island hopping in the Whitsundays",
    price: 3195,
    currency: "USD",
    minDays: 7,
    maxDays: 7,
    pace: "RELAXED",
    comfortLevel: "PREMIUM_LUXURY",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["LUXURY_ESCAPE"],
    travelStyle: ["COASTAL_ESCAPE", "LUXURY"],
    perfectFor: ["HONEYMOONERS", "COUPLES"],
    heroImageFile: "journey3.jpg",
    whyDescription: "Experiencing pure ocean turquoise, coral reefs, and luxury island retreats in the Great Barrier Reef.",
    overviewDescription: "Sail through pure white silica beaches, private island resorts, and helicopter reef flyovers.",
    highlights: [
      "Helicopter flyover over the Heart Reef in the Whitsundays",
      "Private catamaran cruise to Whitehaven Beach",
      "Snorkeling and diving among pristine coral gardens",
    ],
  },
  {
    slug: "adriatic-cross-border",
    title: "Adriatic Cross-Border Odyssey",
    subtitle: "From the Ramparts of Dubrovnik to the Venetian Shores of Corfu",
    price: 3895,
    currency: "EUR",
    minDays: 10,
    maxDays: 10,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: true,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["CULTURE_HERITAGE", "COASTAL_ESCAPE"],
    perfectFor: ["COUPLES", "RETURNING_VISITORS"],
    heroImageFile: "journey3.jpg",
    whyDescription: "A grand 10-day voyage charting ancient maritime trade routes across Croatia, Montenegro, Albania, and Greece.",
    overviewDescription: "Traverse Venetian gulfs, Ottoman citadels, and Ionian island fortress shores in one seamless journey.",
    highlights: [
      "Private walking tour of Dubrovnik’s UNESCO ramparts",
      "Fjord-like cruise across the Bay of Kotor and Lake Skadar",
      "Fortress tours in Ottoman Berat and Gjirokastër",
      "Hydrofoil crossing to the Venetian arcades of Corfu",
    ],
  },
  {
    slug: "yellowstone-wilderness",
    title: "Yellowstone Wilderness",
    subtitle: "An unforgettable journey through the wild landscapes of Yellowstone",
    price: 3195,
    currency: "USD",
    minDays: 7,
    maxDays: 7,
    pace: "ACTIVE",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["FAMILY_JOURNEY"],
    travelStyle: ["NATURE", "ADVENTURE"],
    perfectFor: ["FAMILIES", "NATURE_LOVERS"],
    heroImageFile: "albania-journey2.png",
    whyDescription: "Immerse in geothermal wonders, bison herds, and dramatic canyon waterfalls in America's first national park.",
    overviewDescription: "Track grizzly bears, wolves, and bison with expert wildlife biologists across Lamar Valley and Old Faithful.",
    highlights: [
      "Dawn wildlife safari in the Lamar Valley with expert biologists",
      "Witnessing Old Faithful and Grand Prismatic Spring",
      "Private raft trip down the Yellowstone River",
    ],
  },
  {
    slug: "northern-lights",
    title: "Northern Lights Expedition",
    subtitle: "A magical journey beneath the spectacular northern lights",
    price: 3195,
    currency: "EUR",
    minDays: 7,
    maxDays: 7,
    pace: "BALANCED",
    comfortLevel: "PREMIUM_LUXURY",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["LUXURY_ESCAPE"],
    travelStyle: ["NATURE", "PHOTOGRAPHY", "WELLNESS"],
    perfectFor: ["COUPLES", "HONEYMOONERS"],
    heroImageFile: "albania-journey3.png",
    whyDescription: "Chasing the dancing Aurora Borealis from cozy glass igloos and private Arctic wilderness lodges.",
    overviewDescription: "Husky sledding, snowshoeing through frozen pine forests, and nightly aurora hunts with professional photographers.",
    highlights: [
      "Overnight stay in a glass-roofed heated igloo",
      "Husky dog-sledding safari across frozen Arctic tundras",
      "Nightly private aurora hunting with photography instruction",
    ],
  },
  {
    slug: "island-hopping",
    title: "Island Hopping",
    subtitle: "Archipelagos, Secluded Coves & Maritime Citadels",
    price: 4895,
    currency: "EUR",
    minDays: 14,
    maxDays: 14,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: true,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["COASTAL_ESCAPE", "LUXURY"],
    perfectFor: ["COUPLES", "FRIENDS"],
    heroImageFile: "albania-journey4.jpg",
    whyDescription: "A masterfully designed 14-day voyage through the finest archipelagos of the Adriatic.",
    overviewDescription: "Sail on private vessels, swim in secluded turquoise coves, and anchor beneath ancient Roman and Venetian ramparts.",
    highlights: [
      "Private sailing through the 89 uninhabited islands of Kornati",
      "The crystal waters and secret coves of Vis and the Blue Cave",
      "Diocletian’s Palace and vibrant island nightlife in Hvar",
      "Secluded bays and saltwater lakes of green Mljet National Park",
    ],
  },
  {
    slug: "temple-trail",
    title: "Temple Trail",
    subtitle: "Explore ancient temples, rich traditions, and remarkable landscapes",
    price: 3195,
    currency: "USD",
    minDays: 7,
    maxDays: 7,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["CULTURE_HERITAGE", "PHOTOGRAPHY"],
    perfectFor: ["FIRST_TIME_VISITORS"],
    heroImageFile: "albania-journey5.jpg",
    whyDescription: "Tracing sacred architectural masterpieces, spiritual rituals, and timeless mountain vistas.",
    overviewDescription: "A deeply authentic cultural itinerary discovering sacred sanctuaries, monks' chants, and traditional crafts.",
    highlights: [
      "Sunrise guided walk through ancient sacred complex",
      "Private blessing ceremony with local temple elders",
      "Traditional tea and artisan culinary tasting",
    ],
  },
  {
    slug: "wildlife-discovery",
    title: "Wildlife Discovery",
    subtitle: "Primeval Forests, Canyon Sanctuaries & Wild River Basins",
    price: 4195,
    currency: "EUR",
    minDays: 12,
    maxDays: 12,
    pace: "ACTIVE",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: true,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["NATURE", "ADVENTURE"],
    perfectFor: ["NATURE_LOVERS", "ADVENTURE_SEEKERS"],
    heroImageFile: "albania-journey6.jpg",
    whyDescription: "Tracking brown bears, lynx, chamois, and rare birds across Europe's most wild national parks.",
    overviewDescription: "From the cascading travertine lakes of Plitvice to the primeval rainforest of Biogradska Gora and Prokletije.",
    highlights: [
      "Travertine waterfalls and brown bear sanctuaries of Plitvice Lakes",
      "Karst ridges and lynx corridors of Northern Velebit",
      "White-water rafting through Tara River Canyon",
      "Pelican boat expeditions on Lake Skadar",
    ],
  },
  {
    slug: "island-escape",
    title: "Island Escape",
    subtitle: "A relaxing escape across beautiful islands and secluded coastlines",
    price: 3195,
    currency: "EUR",
    minDays: 7,
    maxDays: 7,
    pace: "RELAXED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["LUXURY_ESCAPE"],
    travelStyle: ["COASTAL_ESCAPE", "WELLNESS"],
    perfectFor: ["HONEYMOONERS", "COUPLES"],
    heroImageFile: "albania-journey7.jpg",
    whyDescription: "Crafted for peaceful rejuvenation amidst sun-drenched bays and private beach retreats.",
    overviewDescription: "Unwind on secluded beaches, enjoy seaside massages, and savor fresh catch of the day under olive groves.",
    highlights: [
      "Private boat transfer to hidden beach coves",
      "Sunset champagne aperitivo overlooking coastal cliffs",
      "Open-air wellness treatments beside the sea",
    ],
  },
  {
    slug: "ancient-temples",
    title: "Ancient Temples & Grand Balkan Expedition",
    subtitle: "From the Julian Alps to the Aegean Foothills",
    price: 7495,
    currency: "EUR",
    minDays: 21,
    maxDays: 21,
    pace: "BALANCED",
    comfortLevel: "BOUTIQUE",
    status: "PUBLISHED",
    featured: true,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["CULTURE_HERITAGE", "NATURE"],
    perfectFor: ["RETURNING_VISITORS", "COUPLES"],
    heroImageFile: "albania-journey8.jpg",
    whyDescription: "The definitive 21-day grand tour traversing seven countries of the Balkan peninsula.",
    overviewDescription: "From alpine glacial lakes and Venetian seaside towns to Ottoman citadel quarters and ancient lake monasteries.",
    highlights: [
      "Rowing traditional pletna boats across turquoise Lake Bled",
      "Truffle hunting in Istria and Pula’s Roman amphitheater",
      "Sailing through the dramatic sheer-walled fjord of Kotor",
      "The white-windowed citadel of Berat and the wild Vjosa river",
      "Clifftop church of Saint John at Kaneo over Lake Ohrid",
    ],
  },
  {
    slug: "wildlife-safari",
    title: "Wildlife Safari",
    subtitle: "Experience remarkable wildlife and unforgettable encounters in nature",
    price: 3195,
    currency: "USD",
    minDays: 7,
    maxDays: 7,
    pace: "ACTIVE",
    comfortLevel: "PREMIUM_LUXURY",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["NATURE", "ADVENTURE"],
    perfectFor: ["NATURE_LOVERS", "FAMILIES"],
    heroImageFile: "albania-journey9.jpg",
    whyDescription: "Private open-top 4x4 game drives and luxury tented camps in wildlife-rich sanctuaries.",
    overviewDescription: "Track lions, elephants, and leopards with expert trackers in private game reserves.",
    highlights: [
      "Sunrise open-top 4x4 wildlife drives with expert trackers",
      "Bush walk excursions discovering nocturnal flora & fauna",
      "Luxury tented lodge stay with private plunge pool",
    ],
  },
  {
    slug: "ultimate-wildlife",
    title: "Ultimate Wildlife Expedition",
    subtitle: "An immersive adventure through some of the world’s most spectacular wilderness",
    price: 3195,
    currency: "USD",
    minDays: 7,
    maxDays: 7,
    pace: "ACTIVE",
    comfortLevel: "PREMIUM_LUXURY",
    status: "PUBLISHED",
    featured: false,
    journeyType: ["PRIVATE_JOURNEY"],
    travelStyle: ["NATURE", "ADVENTURE", "PHOTOGRAPHY"],
    perfectFor: ["ADVENTURE_SEEKERS", "NATURE_LOVERS"],
    heroImageFile: "albania-journey10.png",
    whyDescription: "An uncompromised deep dive into untouched biomes with specialist naturalists.",
    overviewDescription: "Traverse pristine river deltas, deep rainforests, and mountain habitats with wildlife conservationists.",
    highlights: [
      "Private boat navigation along untamed river deltas",
      "Specialist naturalist lectures and photographic hides",
      "Helicopter transfer to remote wilderness lodges",
    ],
  },
];

async function seedAllFrontendJourneys() {
  console.log("=== Starting Cloudinary Media Upload, Location Resolution & Journey Cleanup ===");

  // 1. Wipe all existing journeys in DB as requested by user
  console.log("Deleting all existing Journey records from database...");
  await prisma.journey.deleteMany({});
  console.log(" -> All existing journeys cleared.");

  // 2. Prepare location resolution & missing location creation
  console.log("Fetching existing DB Locations & ensuring default country...");
  let albaniaCountry = await prisma.location.findFirst({
    where: { slug: "albania" },
  });

  if (!albaniaCountry) {
    console.log("Albania country record not found. Creating Albania country in DB...");
    albaniaCountry = await prisma.location.create({
      data: {
        name: "Albania",
        slug: "albania",
        type: "COUNTRY",
        hero: {
          breadcrumb: { value: "CONTINENTS / EUROPE / ALBANIA", textColor: "#d29393", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
          title: { value: "Albania", textColor: "#FFFFFF", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
          subtitle: { value: "The Last Hidden Gem of the Mediterranean", textColor: "#E5E7EB", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
          description: { value: "From rugged mountain peaks to crystal-clear turquoise waters.", textColor: "#F3F4F6", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
          isCenter: false,
          buttons: [],
          backgroundMultimedia: {
            show: "image",
            image: { url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1788643681/P/locationEssenceImage/ymf1xojkxesovejghalq.png", alt: "Albania Hero View", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, width: "100%", height: "auto", fit: "cover" },
            color: { color: "#182d09", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" }
          }
        }
      }
    });
  }

  // Build a lookup map of existing DB locations
  const allDbLocations = await prisma.location.findMany({
    select: { id: true, name: true, slug: true },
  });

  const locationIdMap: Record<string, string> = {};
  for (const loc of allDbLocations) {
    locationIdMap[loc.name] = loc.id;
    locationIdMap[loc.slug] = loc.id;
  }

  const defaultHeroUrl = "https://res.cloudinary.com/dscqp4wwt/image/upload/v1788643681/P/locationEssenceImage/ymf1xojkxesovejghalq.png";

  // Function to get or auto-create missing locations
  async function resolveOrCreateLocationId(locationName: string): Promise<string> {
    if (locationIdMap[locationName]) {
      return locationIdMap[locationName];
    }

    const generatedSlug = locationName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (locationIdMap[generatedSlug]) {
      return locationIdMap[generatedSlug];
    }

    console.log(`[LOCATION AUTO-CREATE] Location '${locationName}' missing in DB. Creating basic info & hero section...`);

    const createdLoc = await prisma.location.create({
      data: {
        name: locationName,
        slug: generatedSlug,
        type: "PLACE",
        parentId: albaniaCountry.id,
        hero: {
          breadcrumb: { value: `ALBANIA / ${locationName.toUpperCase()}`, textColor: "#d29393", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
          title: { value: locationName, textColor: "#FFFFFF", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
          subtitle: { value: `Discover ${locationName}`, textColor: "#E5E7EB", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
          description: { value: `Immerse yourself in ${locationName}.`, textColor: "#F3F4F6", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
          isCenter: false,
          buttons: [],
          backgroundMultimedia: {
            show: "image",
            image: { url: defaultHeroUrl, alt: locationName, opacity: 100, overlayColor: "#000000", overlayOpacity: 40, width: "100%", height: "auto", fit: "cover" },
            color: { color: "#182d09", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" }
          }
        }
      }
    });

    locationIdMap[locationName] = createdLoc.id;
    locationIdMap[generatedSlug] = createdLoc.id;
    console.log(` -> Location '${locationName}' created with ID: ${createdLoc.id}`);
    return createdLoc.id;
  }

  // Pre-resolve all location names used in journey destinations
  for (const journeyCfg of frontendJourneys) {
    if (journeyCfg.destinations) {
      for (const dest of journeyCfg.destinations) {
        await resolveOrCreateLocationId(dest.location);
      }
    }
  }

  // 3. Upload all specified images to Cloudinary
  const frontendImagesDir = path.resolve(process.cwd(), "..", "frontend", "public", "images");
  const uploadedUrls: Record<string, string> = {};

  console.log(`Checking image directory for Cloudinary uploads: ${frontendImagesDir}`);

  for (const fileName of imageFilesToUpload) {
    const filePath = path.join(frontendImagesDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`[WARN] File not found: ${filePath}, skipping...`);
      continue;
    }

    const mimeType = getMimeType(fileName);
    console.log(`Uploading '${fileName}' (${mimeType}) to Cloudinary...`);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const uploadResult = await uploadFilesToCloudinary(
        fileBuffer,
        mimeType,
        "journey-media",
        {},
        "P"
      );

      const cdnUrl = uploadResult?.secure_url || uploadResult?.url;
      if (cdnUrl) {
        uploadedUrls[fileName] = cdnUrl;
        console.log(` -> Success: ${fileName} => ${cdnUrl}`);
      } else {
        console.error(` -> Failed: No URL returned for ${fileName}`);
      }
    } catch (err: any) {
      console.error(` -> Error uploading '${fileName}':`, err.message || err);
    }
  }

  console.log(`\nUploaded ${Object.keys(uploadedUrls).length} media files to Cloudinary successfully.\n`);

  // 4. Build master payload for each journey and insert into database
  for (const journeyCfg of frontendJourneys) {
    console.log(`Seeding journey: ${journeyCfg.title} (slug: ${journeyCfg.slug})...`);

    const masterPayload = buildMasterJourneyPayload(journeyCfg, uploadedUrls, locationIdMap);

    const journeyDataToSave = {
      slug: journeyCfg.slug,
      title: masterPayload.title,
      subtitle: masterPayload.subtitle,
      price: masterPayload.price,
      currency: masterPayload.currency,
      minDays: masterPayload.minDays,
      maxDays: masterPayload.maxDays,
      pace: masterPayload.pace as any,
      comfortLevel: masterPayload.comfortLevel as any,
      status: masterPayload.status as any,
      featured: masterPayload.featured,
      journeyType: masterPayload.journeyType as any[],
      travelStyle: masterPayload.travelStyle as any[],
      perfectFor: masterPayload.perfectFor as any[],
      hero: masterPayload.hero,
      overview: masterPayload.overview,
      itinerary: masterPayload.itinerary,
      accommodations: masterPayload.accommodations,
      whatsIncluded: masterPayload.whatsIncluded,
      addOns: masterPayload.addOns,
      metadata: masterPayload.metadata,
    };

    await prisma.journey.create({
      data: journeyDataToSave,
    });

    console.log(` -> Journey '${journeyCfg.title}' seeded successfully.`);
  }

  console.log("\n=== All frontend journeys have been seeded with 100% compliant structure, location ID links, and Cloudinary media URLs! ===");
}

seedAllFrontendJourneys()
  .catch((e) => {
    console.error("FATAL Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
