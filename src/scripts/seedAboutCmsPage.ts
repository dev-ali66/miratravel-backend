import dotenv from "dotenv";
dotenv.config();

import prisma from "../config/prisma.js";

const defaultAboutPageData = {
  page: "about-us",
  hero: {
    breadcrumb: {
      value: "About Mira",
      textColor: "#E5E7EB",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    title: {
      value: "Thoughtfully curated journeys through the Balkans.",
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
      value: "MIRA creates refined travel experiences for those who value depth, beauty, and meaningful connection to place. Our journeys are designed with care, shaped by regional expertise, and guided by a belief that travel should feel personal, effortless, and memorable.",
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
        url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1789789105/P/heroImage/xl2cnevoerl8tym8evka.png",
        alt: "Thoughtfully curated journeys through the Balkans",
        opacity: 100,
        overlayColor: "#000000",
        overlayOpacity: 45,
        width: "100%",
        height: "auto",
        aspectRatio: "auto",
        fit: "cover",
      },
      video: {
        url: "",
        alt: null,
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
  philosophy: {
    eyebrow: {
      value: "OUR PHILOSOPHY",
      textColor: "#B86B3A",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    title: {
      value: "We believe the way you travel matters.",
      textColor: "#182D09",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    description: {
      value: "We believe true luxury lies in unhurried moments and intimate local insight. Every journey is designed specifically around your pace, preferences, and desires.\n\nOur team works closely with each traveler to craft narrative itineraries that balance discovery with rest.",
      textColor: "#4B5563",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    quote: {
      value: "“Because the most memorable travel experiences are rarely the loudest ones.”",
      textColor: "#B86B3A",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    multimedias: [
      {
        show: "image",
        color: { color: "#FFFFFF", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        image: {
          url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1789789105/P/philosophyImage1/mwlarjdjn6k8sg7uiecq.png",
          alt: "Balkan authentic travel",
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
          alt: null,
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
      {
        show: "image",
        color: { color: "#FFFFFF", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        image: {
          url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1789789106/P/philosophyImage2/oxbjerskvgzibnudp0iw.jpg",
          alt: "Balkan destination",
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
          alt: null,
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
      {
        show: "image",
        color: { color: "#FFFFFF", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        image: {
          url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1789789107/P/philosophyImage3/prkazquiqzr3uv4oln9i.jpg",
          alt: "Balkan scenery",
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
          alt: null,
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
    ],
    backgroundMultimedia: {
      show: "color",
      color: { color: "#FAF7F2", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
      image: {
        url: null,
        alt: null,
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
        alt: null,
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
  approach: {
    eyebrow: {
      value: "OUR APPROACH",
      textColor: "#B86B3A",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    title: {
      value: "How we curate experiences.",
      textColor: "#182D09",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    description: {
      value: "Every destination within the MIRA collection is personally reviewed and continuously refined by our team. We spend time on the ground revisiting regions, evaluating properties, meeting local partners, and understanding how each journey feels from beginning to end.",
      textColor: "#4B5563",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    quote: {
      value: "“Our role is not simply to organize travel. It is to curate experiences that feel considered in every detail.”",
      textColor: "#B86B3A",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    leftSideMultimedia: {
      show: "image",
      color: { color: "#E5E7EB", opacity: 100 },
      image: { url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1789789108/P/approachLeftImage/abhzltoegbyzen3yyqhu.jpg", alt: "How we curate experiences", opacity: 100, fit: "cover" },
    },
    rightSideMultimedia: {
      show: "video",
      color: { color: "#E5E7EB", opacity: 100 },
      video: { url: "https://res.cloudinary.com/dscqp4wwt/video/upload/v1789789115/P/approachRightVideo/dgsjvek00mcfqnim2158.mp4", alt: "Curated experiences video", autoplay: true, loop: true, muted: true, opacity: 100, fit: "cover" },
    },
    backgroundMultimedia: {
      show: "color",
      color: { color: "#FFFFFF", opacity: 100 },
    },
  },
  regional_knowledge: {
    eyebrow: {
      value: "REGIONAL KNOWLEDGE",
      textColor: "#B86B3A",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    title: {
      value: "Deeply rooted in the Balkans.",
      textColor: "#182D09",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    description: {
      value: "Lorem ipsum dolor sit amet consectetur. Fusce egestas risus placerat ornare vitae ut. Est fermentum amet duis imperdiet fames. Vestibulum amet quis nisl risus mattis. Est amet sed facilisis molestie. Augue eget elementum habitant nulla fermentum. Tortor interdum rhoncus et justo cras. Elit pellentesque nisi nulla habitasse dui ipsum adipiscing.\n\nLorem ipsum dolor sit amet consectetur. Nisi ligula consectetur odio urna. Cras vitae amet aenean feugiat. Mattis lorem mauris hendrerit adipiscing tempor posuere amet lacus. Integer potenti diam ullamcorper integer massa urna elementum.",
      textColor: "#4B5563",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    secondaryDescription: {
      value: "From remote mountain villages and coastal hideaways to historic cities and lesser-known cultural regions, we focus on places that retain a strong sense of identity and authenticity.\n\nOver the years, we have built long-standing relationships with local guides, boutique properties, drivers, artisans, and hospitality partners throughout the region. These connections allow us to create journeys that feel both refined and deeply personal.",
      textColor: "#4B5563",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    multimedia1: {
      show: "image",
      color: { color: "#E5E7EB", opacity: 100 },
      image: { url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1789789118/P/regionalImage1/qzphvffcyjqpbm9w1h0s.jpg", alt: "Deeply rooted in the Balkans", opacity: 100, fit: "cover" },
    },
    multimedia2: {
      show: "image",
      color: { color: "#E5E7EB", opacity: 100 },
      image: { url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1789789119/P/regionalImage2/p83hx947vfrsw2fokxp4.jpg", alt: "Balkan cultural heritage", opacity: 100, fit: "cover" },
    },
    backgroundMultimedia: {
      show: "color",
      color: { color: "#FAF7F2", opacity: 100 },
    },
  },
  people: {
    eyebrow: {
      value: "OUR TEAM",
      textColor: "#B86B3A",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    title: {
      value: "Thoughtful planners. Local insiders.",
      textColor: "#182D09",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    description: {
      value: "Meet the specialists and local curators behind your bespoke Balkan experience.",
      textColor: "#4B5563",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    items: [
      {
        name: { value: "Mira Specialist", textColor: "#182D09", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
        role: { value: "Lead Journey Curator", textColor: "#6B7280", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
        multimedia: {
          show: "image",
          color: { color: "#E5E7EB", opacity: 100 },
          image: { url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1789789105/P/philosophyImage1/mwlarjdjn6k8sg7uiecq.png", alt: "Lead Journey Curator", opacity: 100, fit: "cover" },
        },
      },
    ],
    backgroundMultimedia: {
      show: "color",
      color: { color: "#FFFFFF", opacity: 100 },
    },
  },
  standard: {
    eyebrow: {
      value: "THE MIRA STANDARD",
      textColor: "#B86B3A",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    title: {
      value: "What defines every journey we create.",
      textColor: "#182D09",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    multimedia: {
      show: "image",
      color: { color: "#E5E7EB", opacity: 100 },
      image: {
        url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1789789105/P/philosophyImage1/mwlarjdjn6k8sg7uiecq.png",
        alt: "What defines every journey we create",
        opacity: 100,
        fit: "cover",
      },
    },
    backgroundMultimedia: {
      show: "color",
      color: { color: "#FAF7F2", opacity: 100 },
    },
    items: [
      {
        title: {
          value: "Thoughtful Pace",
          textColor: "#B86B3A",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: "Lorem ipsum dolor sit amet consectetur. Non pretium id eu justo massa condimentum proin. Aliquam vitae tellus quis nulla et bibendum. Vulputate quis enim arcu congue.",
          textColor: "#4B5563",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
      },
      {
        title: {
          value: "Distinctive Places",
          textColor: "#B86B3A",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: "Lorem ipsum dolor sit amet consectetur. Non pretium id eu justo massa condimentum proin. Aliquam vitae tellus quis nulla et bibendum. Vulputate quis enim arcu congue.",
          textColor: "#4B5563",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
      },
      {
        title: {
          value: "Regional Depth",
          textColor: "#B86B3A",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: "Lorem ipsum dolor sit amet consectetur. Non pretium id eu justo massa condimentum proin. Aliquam vitae tellus quis nulla et bibendum. Vulputate quis enim arcu congue.",
          textColor: "#4B5563",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
      },
      {
        title: {
          value: "Seamless Execution",
          textColor: "#B86B3A",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value: "Lorem ipsum dolor sit amet consectetur. Non pretium id eu justo massa condimentum proin. Aliquam vitae tellus quis nulla et bibendum. Vulputate quis enim arcu congue.",
          textColor: "#4B5563",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
      },
    ],
  },
  stay: {
    title: {
      value: "The journeys that stay with us are never only about where we went.",
      textColor: "#F3F4F6",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    items: [
      { value: "They are about how a place made us feel.", textColor: "#F3F4F6", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      { value: "The atmosphere of a quiet coastal village.", textColor: "#F3F4F6", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      { value: "A conversation shared over dinner.", textColor: "#F3F4F6", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      { value: "A road through the mountains at sunset.", textColor: "#F3F4F6", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
      { value: "The sense of discovering something genuine and deeply connected to its surroundings.", textColor: "#F3F4F6", textOpacity: 1, backgroundColor: null, backgroundOpacity: 1 },
    ],
    closingText: {
      value: "At MIRA, we create journeys designed to leave exactly that feeling behind.",
      textColor: "#B86B3A",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    backgroundMultimedia: {
      show: "color",
      color: { color: "#182D09", opacity: 100 },
    },
  },
  cta: {
    title: {
      value: "Let us design your journey",
      textColor: "#182D09",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    description: {
      value: "Tell us how you like to travel. We will create a personal journey shaped around your pace, interests, and preferred level of comfort.",
      textColor: "#4B5563",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    backgroundMultimedia: {
      show: "color",
      color: { color: "#FBF9F5", opacity: 100 },
    },
    rightSideMultimedia: {
      show: "image",
      color: { color: "#FBF9F5", opacity: 100 },
      image: { url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1789789108/P/approachLeftImage/abhzltoegbyzen3yyqhu.jpg", alt: "Let us design your journey", opacity: 100, fit: "cover" },
    },
    buttons: [
      {
        label: "Plan your escape",
        url: "/contact-us",
        variant: "PRIMARY",
        style: "primary",
        rounded: "full",
        backgroundColor: "#182D09",
        backgroundOpacity: 100,
        textColor: "#ffffff",
        textOpacity: 100,
        target: "_self",
        showIcon: true,
      },
    ],
  },
  seo: {
    title: "About Us | MIRA Travel",
    description: "Learn about MIRA Travel's philosophy, approach, and regional Balkan experts.",
    keywords: ["About Mira", "Luxury Balkan Travel", "Bespoke Journeys", "Balkan Specialists"],
    canonicalUrl: "https://miratravel.nl/about",
    robots: {
      index: true,
      follow: true,
    },
  },
};

async function seedAboutCmsPage() {
  console.log("Seeding / updating 'about-us' CMS Page in Neon PostgreSQL DB...");

  const existing = await prisma.cmsPage.findFirst({
    where: { slug: "about-us" },
  });

  if (existing) {
    const updated = await prisma.cmsPage.update({
      where: { id: existing.id },
      data: {
        name: "About Us",
        slug: "about-us",
        metadata: {
          title: "About Us | MIRA Travel",
          description: "Learn about MIRA Travel's philosophy, approach, and regional Balkan experts.",
        },
        data: defaultAboutPageData,
      },
    });
    console.log("Successfully updated 'about-us' CMS Page in DB. ID:", updated.id);
  } else {
    const created = await prisma.cmsPage.create({
      data: {
        name: "About Us",
        slug: "about-us",
        metadata: {
          title: "About Us | MIRA Travel",
          description: "Learn about MIRA Travel's philosophy, approach, and regional Balkan experts.",
        },
        data: defaultAboutPageData,
      },
    });
    console.log("Successfully created 'about-us' CMS Page in DB. ID:", created.id);
  }
}

seedAboutCmsPage()
  .catch((e) => {
    console.error("Seed script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
