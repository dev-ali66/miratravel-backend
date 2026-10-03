import dotenv from "dotenv";
dotenv.config();

import prisma from "../config/prisma.js";

const heroObj = {
  key: "hero",
  breadcrumb: {
    value: "MIRA STORIES",
    textColor: "#E5E7EB",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  title: {
    value: "Perspectives, History & Cultural Narratives",
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
    value: "A curated collection of stories, essays, and editorial pieces offering deep insight into the soul of the Balkans.",
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
      url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1790018470/P/mira_stories.leftSideMultimedia.image.url/bv0ei4gpbq82lbnrrxzg.jpg",
      alt: "MIRA Stories Editorial",
      fit: "cover",
      width: "100%",
      height: "auto",
      opacity: 100,
      aspectRatio: "auto",
      overlayColor: "#000000",
      overlayOpacity: 35,
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

const miraStoriesObj = {
  key: "mira_stories",
  eyebrow: {
    value: "THE EDITORIAL",
    textColor: "#C5A880",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  title: {
    value: "Mira Stories",
    textColor: "#182D09",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  description: {
    value: "A collection of personal, cultural and inspiring stories. Each piece offers a deeper view of the Balkans and its people beyond the expected.",
    textColor: "#4B5563",
    textOpacity: 1,
    backgroundColor: null,
    backgroundOpacity: 1,
  },
  items: [
    {
      title: {
        value: "Decoding the Stećci",
        textColor: "#182D09",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      subtitle: {
        value: "Mythology of the medieval tombstones",
        textColor: "#4B5563",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      button: {
        url: "/stories/decoding-the-stecci",
        label: "Read Story",
        style: "primary",
        target: "_self",
        rounded: "full",
        variant: "PRIMARY",
        showIcon: true,
        textColor: "#ffffff",
        textOpacity: 100,
        hoverTextColor: "#000000",
        backgroundColor: "#182D09",
        backgroundOpacity: 100,
        hoverBackgroundColor: "#f3f4f6",
      },
      url: "/stories/decoding-the-stecci",
    },
    {
      title: {
        value: "The Salt Merchants of Ston",
        textColor: "#182D09",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      subtitle: {
        value: "Tracking the white gold of the Adriatic",
        textColor: "#4B5563",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      button: {
        url: "/stories/salt-merchants-of-ston",
        label: "Read Story",
        style: "primary",
        target: "_self",
        rounded: "full",
        variant: "PRIMARY",
        showIcon: true,
        textColor: "#ffffff",
        textOpacity: 100,
        hoverTextColor: "#000000",
        backgroundColor: "#182D09",
        backgroundOpacity: 100,
        hoverBackgroundColor: "#f3f4f6",
      },
      url: "/stories/salt-merchants-of-ston",
    },
  ],
  buttons: [
    {
      url: "/stories",
      label: "View All Stories",
      style: "primary",
      target: "_self",
      rounded: "full",
      variant: "PRIMARY",
      showIcon: true,
      textColor: "#ffffff",
      textOpacity: 100,
      hoverTextColor: "#000000",
      backgroundColor: "#182D09",
      backgroundOpacity: 100,
      hoverBackgroundColor: "#f3f4f6",
    },
  ],
  backgroundMultimedia: {
    show: "color",
    color: {
      color: "#FCFBF9",
      width: "100%",
      height: "100%",
      opacity: 100,
      aspectRatio: "auto",
    },
    image: {
      url: null,
      alt: null,
      fit: "cover",
      width: "100%",
      height: "auto",
      opacity: 100,
      aspectRatio: "auto",
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
    video: {
      url: null,
      alt: null,
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
  leftSideMultimedia: {
    show: "image",
    color: {
      color: "#FCFBF9",
      width: "100%",
      height: "100%",
      opacity: 100,
      aspectRatio: "auto",
      isFullWidth: true,
      isFullHeight: true,
    },
    image: {
      alt: "Mira Stories editorial image",
      fit: "cover",
      url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1790018470/P/mira_stories.leftSideMultimedia.image.url/bv0ei4gpbq82lbnrrxzg.jpg",
      width: "100%",
      height: "auto",
      opacity: 100,
      aspectRatio: "auto",
      isFullWidth: true,
      isFullHeight: false,
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
    video: {
      alt: null,
      fit: "cover",
      url: "",
      loop: true,
      muted: true,
      width: "100%",
      height: "auto",
      opacity: 100,
      autoplay: true,
      aspectRatio: "auto",
      isFullWidth: true,
      isFullHeight: false,
      overlayColor: "#000000",
      overlayOpacity: 0,
    },
  },
};

const seoObj = {
  key: "seo",
  title: "Stories | MIRA Travel",
  description: "Explore inspirational stories and cultural insights across Europe and the Balkans with MIRA Travel.",
  keywords: ["travel stories", "balkans", "slow travel", "mira travel", "culture stories"],
  canonicalUrl: "https://politravel.com/stories",
  robots: {
    index: true,
    follow: true,
  },
};

const defaultStoriesPageData = {
  page: "stories",
  hero: heroObj,
  mira_stories: miraStoriesObj,
};

const defaultStoriesMetadata = {
  title: seoObj.title,
  description: seoObj.description,
  keywords: seoObj.keywords,
  canonicalUrl: seoObj.canonicalUrl,
  robots: seoObj.robots,
  seo: seoObj,
};

async function seedStoriesCmsPage() {
  try {
    console.log("Seeding Stories CMS Page...");

    const existingPage = await prisma.cmsPage.findFirst({
      where: {
        OR: [{ slug: "stories" }, { name: "Stories" }, { name: "Stories CMS" }],
      },
    });

    if (existingPage) {
      console.log(`Found existing Stories CMS Page (id: ${existingPage.id}). Updating...`);
      const updated = await prisma.cmsPage.update({
        where: { id: existingPage.id },
        data: {
          name: "Stories CMS",
          slug: "stories",
          metadata: defaultStoriesMetadata as any,
          data: defaultStoriesPageData as any,
        },
      });
      console.log("Successfully updated Stories CMS Page:", updated.id);
    } else {
      console.log("Creating new Stories CMS Page...");
      const created = await prisma.cmsPage.create({
        data: {
          name: "Stories CMS",
          slug: "stories",
          metadata: defaultStoriesMetadata as any,
          data: defaultStoriesPageData as any,
        },
      });
      console.log("Successfully created Stories CMS Page:", created.id);
    }
  } catch (error) {
    console.error("Error seeding Stories CMS Page:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStoriesCmsPage();
