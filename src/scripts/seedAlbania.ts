import prisma from "../config/prisma.js";

async function main() {
  console.log("Checking existing locations in DB...");
  const locations = await prisma.location.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      parentId: true,
    },
  });
  console.log("Found locations:", JSON.stringify(locations, null, 2));

  let europe = await prisma.location.findFirst({
    where: {
      slug: "europe",
    },
  });

  if (!europe) {
    console.log("Europe not found, creating Europe continent first...");
    europe = await prisma.location.create({
      data: {
        name: "Europe",
        slug: "europe",
        type: "CONTINENT",
        hero: {
          breadcrumb: {
            value: "CONTINENTS / EUROPE",
            textColor: "#d29393",
            textOpacity: 1,
            backgroundColor: null,
            backgroundOpacity: 1,
          },
          title: {
            value: "Unveil the Soul of Europe",
            textColor: "#FFFFFF",
            textOpacity: 1,
            backgroundColor: null,
            backgroundOpacity: 1,
          },
          subtitle: {
            value: "From Ancient Empires to Wild Alpine Horizons",
            textColor: "#E5E7EB",
            textOpacity: 1,
            backgroundColor: null,
            backgroundOpacity: 1,
          },
          description: {
            value:
              "Immerse yourself in timeless cultural heritage, majestic mountain passes, sun-drenched Mediterranean shores, and secluded storybook villages crafted for discerning explorers.",
            textColor: "#F3F4F6",
            textOpacity: 1,
            backgroundColor: null,
            backgroundOpacity: 1,
          },
          isCenter: false,
          buttons: [
            {
              label: "Explore European Journeys",
              url: "/journeys?continent=europe",
              style: "primary",
              variant: "PRIMARY",
              textColor: "#000000",
              backgroundColor: "#ffffff",
            },
          ],
          backgroundMultimedia: {
            show: "video",
            image: {
              url: "/videos/des-thumb.png",
              alt: "Panoramic European Alpine Landscape",
              opacity: 100,
              overlayColor: "#000000",
              overlayOpacity: 45,
              width: "100%",
              height: "auto",
              aspectRatio: "auto",
              fit: "cover",
            },
            video: {
              url: "/videos/des-hero.mp4",
              alt: "Cinematic Aerial View of Europe",
              autoplay: true,
              loop: true,
              muted: true,
              opacity: 100,
              overlayColor: "#000000",
              overlayOpacity: 45,
              width: "100%",
              height: "auto",
              aspectRatio: "auto",
              fit: "cover",
            },
            color: {
              color: "#171717",
              opacity: 100,
              width: "100%",
              height: "100%",
              aspectRatio: "auto",
            },
          },
        },
        essence: {
          label: {
            value: "THE ESSENCE OF EUROPE",
            textColor: "#af6348",
            textOpacity: 1,
            backgroundColor: null,
            backgroundOpacity: 1,
          },
          title: {
            value:
              "A tapestry of living history, untamed wilderness, and timeless elegance",
            textColor: "#182d09",
            textOpacity: 1,
            backgroundColor: null,
            backgroundOpacity: 1,
          },
          paragraphs: {
            value:
              "Europe is an extraordinary mosaic where centuries of civilization meet pristine natural wonder. From the snow-capped summits of the Alps and the sun-drenched coves of the Mediterranean to fairy-tale medieval towns and ancient pine forests, every corner holds a distinct chapter waiting to be discovered.\n\nHere, travel transcends the ordinary. Wander through cobblestone alleyways that have witnessed millennia of history, savour world-renowned culinary heritage crafted by generational artisans, and lose yourself in landscapes that have inspired poets, artists, and explorers across generations.\n\nWhether navigating remote coastal paths or uncovering secluded mountain refuges far from the beaten track, Europe rewards curious minds with profound intimacy and indelible memories.",
            textColor: "#565e69",
            textOpacity: 1,
            backgroundColor: null,
            backgroundOpacity: 1,
          },
          quote: {
            value:
              "To travel through Europe is to witness the living poetry of the ancient world reimagined for the modern spirit.",
            textColor: "#1A1209",
            textOpacity: 1,
            backgroundColor: null,
            backgroundOpacity: 1,
          },
          statValue: {
            value: "50+",
            textColor: "#ffffff",
            textOpacity: 1,
            backgroundColor: null,
            backgroundOpacity: 1,
          },
          statLabel: {
            value: "Countries & Sovereign Territories",
            textColor: "#ffffff",
            textOpacity: 0.75,
            backgroundColor: null,
            backgroundOpacity: 1,
          },
          statBadgeBg: "#B86B3A",
          imageMultimedia: {
            show: "image",
            image: {
              url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1788643681/P/locationEssenceImage/ymf1xojkxesovejghalq.png",
              alt: "The Essence of Europe — Landscapes & Heritage",
              opacity: 100,
              overlayColor: "#000000",
              overlayOpacity: 0,
              width: "100%",
              height: "100%",
              aspectRatio: "auto",
              fit: "cover",
            },
            video: {
              url: "",
              alt: "The Essence of Europe video",
              autoplay: true,
              loop: true,
              muted: true,
              opacity: 100,
              overlayColor: "#000000",
              overlayOpacity: 0,
              width: "100%",
              height: "100%",
              aspectRatio: "auto",
              fit: "cover",
            },
            color: {
              color: "#EDE7D8",
              opacity: 100,
              width: "100%",
              height: "100%",
              aspectRatio: "auto",
            },
          },
          backgroundMultimedia: {
            show: "color",
            image: {
              url: "",
              alt: "Europe essence background pattern",
              opacity: 100,
              overlayColor: "#000000",
              overlayOpacity: 0,
              width: "100%",
              height: "auto",
              aspectRatio: "auto",
              fit: "cover",
            },
            video: {
              url: "",
              alt: "Europe essence background video",
              autoplay: true,
              loop: true,
              muted: true,
              opacity: 100,
              overlayColor: "#000000",
              overlayOpacity: 0,
              width: "100%",
              height: "auto",
              aspectRatio: "auto",
              fit: "cover",
            },
            color: {
              color: "#FFF8F2",
              opacity: 100,
              width: "100%",
              height: "100%",
              aspectRatio: "auto",
            },
          },
        },
      },
    });
    console.log("Europe created with ID:", europe.id);
  } else {
    console.log("Europe found with ID:", europe.id);
  }

  // Now create or update Albania under Europe
  const albaniaData = {
    name: "Albania",
    slug: "albania",
    type: "COUNTRY" as const,
    geoData: {
      area: {
        unit: "km²",
        value: 28748,
      },
      mapZoom: 7,
      latitude: 41.1533,
      longitude: 20.1683,
      timezone: "Europe/Tirane",
    },
    metadata: {
      seo: {
        title: "Albania Travel & Bespoke Journeys — Mira",
        description:
          "Discover the untouched beauty of Albania: pristine Adriatic and Ionian coastlines, dramatic Albanian Alps, UNESCO Ottoman towns, and ancient Illyrian history.",
        keywords: [
          "Albania",
          "Balkan travel",
          "Albanian Riviera",
          "Accursed Mountains",
          "UNESCO Berat",
          "Gjirokaster",
        ],
        canonicalUrl: "/destinations/europe/albania",
        robots: {
          index: true,
          follow: true,
        },
      },
    },
    hero: {
      breadcrumb: {
        value: "EUROPE / COUNTRIES / ALBANIA",
        textColor: "#d29393",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      title: {
        value: "The Hidden Crown of the Mediterranean",
        textColor: "#FFFFFF",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      subtitle: {
        value: "Where Rugged Peaks Meet Crystal Ionian Shores",
        textColor: "#E5E7EB",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      description: {
        value:
          "Unearth Europe's most enigmatic destination. From turquoise coastal havens along the Albanian Riviera to ancient stone citadels and the untamed trails of the Accursed Mountains.",
        textColor: "#F3F4F6",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      isCenter: false,
      buttons: [
        {
          label: "Explore Albania Journeys",
          url: "/journeys?country=albania",
          style: "primary",
          variant: "PRIMARY",
          textColor: "#000000",
          backgroundColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "video",
        image: {
          url: "/videos/des-thumb.png",
          alt: "Dramatic Coastline of Albanian Riviera",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 45,
          width: "100%",
          height: "auto",
          aspectRatio: "auto",
          fit: "cover",
        },
        video: {
          url: "/videos/des-hero.mp4",
          alt: "Albanian Mountains and Riviera Aerial View",
          autoplay: true,
          loop: true,
          muted: true,
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 45,
          width: "100%",
          height: "auto",
          aspectRatio: "auto",
          fit: "cover",
        },
        color: {
          color: "#171717",
          opacity: 100,
          width: "100%",
          height: "100%",
          aspectRatio: "auto",
        },
      },
    },
    essence: {
      label: {
        value: "THE ESSENCE OF ALBANIA",
        textColor: "#af6348",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      title: {
        value: "Ancient hospitality, untamed mountains, and azure waters",
        textColor: "#182d09",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      paragraphs: {
        value:
          "Albania is Europe's best-kept secret—a country where warm Mediterranean traditions seamlessly intertwine with dramatic, untouched natural landscapes. Nestled along the sparkling Adriatic and Ionian seas, Albania reveals turquoise coves reminiscent of classical antiquity, framed by limestone cliffs.\n\nInland, the dramatic Albanian Alps (Accursed Mountains) guard secluded alpine valleys, emerald glacial rivers, and ancient mountain villages where the traditional code of Besa—unconditional guest hospitality—still thrives.\n\nFrom the UNESCO-listed stone towns of Berat and Gjirokastër to the vibrant culinary scene of Tirana, Albania invites curious travelers to experience authentic European heritage before the rest of the world catches on.",
        textColor: "#565e69",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      quote: {
        value:
          "In Albania, the house belongs first to God and the guest, then to the master of the house.",
        textColor: "#1A1209",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      statValue: {
        value: "450+",
        textColor: "#ffffff",
        textOpacity: 1,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      statLabel: {
        value: "Kilometers of Pristine Coastline",
        textColor: "#ffffff",
        textOpacity: 0.75,
        backgroundColor: null,
        backgroundOpacity: 1,
      },
      statBadgeBg: "#B86B3A",
      imageMultimedia: {
        show: "image",
        image: {
          url: "https://res.cloudinary.com/dscqp4wwt/image/upload/v1788643681/P/locationEssenceImage/ymf1xojkxesovejghalq.png",
          alt: "The Essence of Albania — Riviera & Alps",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 0,
          width: "100%",
          height: "100%",
          aspectRatio: "auto",
          fit: "cover",
        },
        video: {
          url: "",
          alt: "Albania essence video",
          autoplay: true,
          loop: true,
          muted: true,
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 0,
          width: "100%",
          height: "100%",
          aspectRatio: "auto",
          fit: "cover",
        },
        color: {
          color: "#EDE7D8",
          opacity: 100,
          width: "100%",
          height: "100%",
          aspectRatio: "auto",
        },
      },
      backgroundMultimedia: {
        show: "color",
        image: {
          url: "",
          alt: "Albania essence background pattern",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 0,
          width: "100%",
          height: "auto",
          aspectRatio: "auto",
          fit: "cover",
        },
        video: {
          url: "",
          alt: "Albania essence background video",
          autoplay: true,
          loop: true,
          muted: true,
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 0,
          width: "100%",
          height: "auto",
          aspectRatio: "auto",
          fit: "cover",
        },
        color: {
          color: "#FFF8F2",
          opacity: 100,
          width: "100%",
          height: "100%",
          aspectRatio: "auto",
        },
      },
    },
    why: {
      title: "Why Experience Albania",
      subtitle: "The Balkans' Most Authentic Coastal Frontier",
      tags: ["Riviera Beaches", "UNESCO Heritage", "Alpine Hiking", "Warm Hospitality"],
      image: "",
      description_paragraphs: [
        "Uncrowded Mediterranean beaches along Ksamil, Dhermi, and Himara with crystal-clear waters.",
        "Living Ottoman-era architecture and ancient Illyrian castles in Berat, Gjirokastër, and Butrint.",
        "World-class hiking through Valbona Valley and Theth National Park in the Accursed Mountains.",
      ],
    },
    card: {
      title: "Albania",
      subtitle: "Mediterranean Coast & Alpine Splendor",
      background_image: "",
      button: {
        label: "EXPLORE ALBANIA",
        url: "/destinations/europe/albania",
      },
    },
    travelInfo: {
      currency: {
        majorCurrency: "Albanian Lek (ALL)",
        description:
          "The official currency is the Albanian Lek. Euros (EUR) are widely accepted in tourist hubs, hotels, and coastal resorts.",
      },
      visa: {
        description:
          "Citizens of the EU, US, UK, Canada, Australia, and many others can enter Albania visa-free for up to 90 days within a 180-day period.",
      },
      bestTimeToVisit: {
        general:
          "May to October is ideal for beach exploration and alpine hiking.",
        summer:
          "June through August offers perfect beach weather and vibrant coastal nightlife.",
        winter:
          "December to March is crisp and quiet, ideal for exploring UNESCO towns and enjoying mountain snowscapes.",
      },
      popularTransportation: [
        "Private chauffeur transfers",
        "Coastal ferries & private yachts",
        "Rental cars & 4x4 mountain jeeps",
      ],
      beforeTravel: {
        label: "Essential Travel Tips",
        title: "Good to Know Before You Visit Albania",
        image: "",
        imageAlt: "Albania Travel Notes",
        items: [
          {
            id: "tip-1",
            title: "Hospitality & Besa",
            content:
              "Albanians are renowned for warm hospitality. The ancient tradition of 'Besa' means guests are treated with the highest respect and care.",
          },
          {
            id: "tip-2",
            title: "Payment & Cash",
            content:
              "Cards are accepted in major hotels and restaurants in Tirana and coastal cities, but carrying some local cash (Lek) is recommended for rural markets and cafes.",
          },
          {
            id: "tip-3",
            title: "Languages",
            content:
              "Albanian (Shqip) is the official language. Italian and English are widely spoken among hospitality staff and younger generations.",
          },
        ],
      },
    },
    statistics: {
      area: {
        unit: "km²",
        value: 28748,
      },
      elevation: {
        unit: "m",
        value: 2764,
      },
      population: {
        year: 2026,
        value: 2750000,
      },
      facts: [
        {
          label: "Capital City",
          value: "Tirana",
          description: "Vibrant cultural hub filled with colorful architecture, cafes, and museums.",
        },
        {
          label: "UNESCO Sites",
          value: "4 Sites",
          description: "Including Berat, Gjirokastër, Butrint, and the Primeval Beech Forests.",
        },
        {
          label: "Highest Peak",
          value: "Mount Korab (2,764m)",
          description: "Towering alpine summit on the border between Albania and North Macedonia.",
        },
      ],
    },
  };

  const existingAlbania = await prisma.location.findFirst({
    where: {
      slug: "albania",
    },
  });

  if (existingAlbania) {
    console.log("Updating existing Albania location...");
    const updated = await prisma.location.update({
      where: { id: existingAlbania.id },
      data: {
        ...albaniaData,
        parent: {
          connect: { id: europe.id },
        },
      },
    });
    console.log("Albania updated successfully:", updated.id);
  } else {
    console.log("Creating new Albania country under Europe...");
    const created = await prisma.location.create({
      data: {
        ...albaniaData,
        parent: {
          connect: { id: europe.id },
        },
      },
    });
    console.log("Albania created successfully:", created.id);
  }

  const finalCheck = await prisma.location.findMany({
    where: {
      OR: [{ slug: "europe" }, { slug: "albania" }],
    },
    include: {
      parent: {
        select: { id: true, name: true, slug: true, type: true },
      },
      children: {
        select: { id: true, name: true, slug: true, type: true },
      },
    },
  });

  console.log("Final Locations in DB:", JSON.stringify(finalCheck, null, 2));
}

main()
  .catch((e) => {
    console.error("Error running script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
