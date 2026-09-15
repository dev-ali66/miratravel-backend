import prisma from "../config/prisma.js";

async function main() {
  console.log("Finding Albania country in DB...");
  const albania = await prisma.location.findFirst({
    where: {
      slug: "albania",
    },
  });

  if (!albania) {
    throw new Error("Albania country not found in DB! Please seed Albania first.");
  }

  console.log("Albania found with ID:", albania.id);

  const regions = [
    {
      name: "Albanian Riviera",
      slug: "albanian-riviera",
      type: "REGION" as const,
      geoData: {
        area: { unit: "km²", value: 1200 },
        mapZoom: 9,
        latitude: 40.1472,
        longitude: 19.6744,
        timezone: "Europe/Tirane",
      },
      metadata: {
        seo: {
          title: "Albanian Riviera Travel & Coastal Escapes — Mira",
          description:
            "Explore the pristine turquoise waters, dramatic limestone cliffs, and bohemian beach towns of Ksamil, Dhermi, and Himara along the Albanian Riviera.",
          keywords: ["Albanian Riviera", "Ksamil", "Dhermi", "Himara", "Ionian Coast"],
          canonicalUrl: "/destinations/europe/albania/albanian-riviera",
          robots: { index: true, follow: true },
        },
      },
      hero: {
        breadcrumb: {
          value: "ALBANIA / REGIONS / ALBANIAN RIVIERA",
          textColor: "#d29393",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Where Azure Waters Meet Sun-Kissed Cliffs",
          textColor: "#FFFFFF",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        subtitle: {
          value: "Europe's Last Untamed Mediterranean Paradise",
          textColor: "#E5E7EB",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value:
            "Stretching from Vlorë to Ksamil along the Ionian Sea, the Albanian Riviera offers crystal-clear turquoise waters, secluded coves, ancient olive groves, and cliffside storybook villages.",
          textColor: "#F3F4F6",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        isCenter: false,
        buttons: [
          {
            label: "Explore Riviera Journeys",
            url: "/journeys?region=albanian-riviera",
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
            alt: "Albanian Riviera Coastline",
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
            alt: "Cinematic Riviera Aerial",
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
          value: "THE ESSENCE OF THE RIVIERA",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Dramatic mountain backdrops plunging into pristine turquoise seas",
          textColor: "#182d09",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        paragraphs: {
          value:
            "The Albanian Riviera is an enchanting ribbon of coastline where the Ceraunian Mountains cascade directly into the transparent waters of the Ionian Sea. Far from overcrowded resorts, here you discover tranquil pebble coves, hidden sea caves reachable only by boat, and sun-drenched terraced hillsides.\n\nFrom the bohemian beach energy of Dhërmi and the idyllic Ksamil islands to the ancient castle of Porto Palermo, each stretch of coast reveals a poetic blend of Greco-Roman history, fresh seafood tavernas, and sublime coastal tranquility.",
          textColor: "#565e69",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        quote: {
          value: "To sail the Ionian coast of Albania is to discover the Mediterranean as it was meant to be—wild, unhurried, and genuinely welcoming.",
          textColor: "#1A1209",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        statValue: {
          value: "130+",
          textColor: "#ffffff",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        statLabel: {
          value: "Secluded Beaches & Coastal Coves",
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
            alt: "Albanian Riviera Coastal Beauty",
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
            alt: "Riviera video",
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
          color: { color: "#EDE7D8", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
        backgroundMultimedia: {
          show: "color",
          image: { url: "", alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
          video: { url: "", alt: "", autoplay: true, loop: true, muted: true, opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
          color: { color: "#FFF8F2", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
      },
      card: {
        title: "Albanian Riviera",
        subtitle: "Ionian Seas & Cliffside Havens",
        background_image: "",
        button: { label: "EXPLORE RIVIERA", url: "/destinations/europe/albania/albanian-riviera" },
      },
    },

    {
      name: "Eastern Albania",
      slug: "eastern-albania",
      type: "REGION" as const,
      geoData: {
        area: { unit: "km²", value: 6500 },
        mapZoom: 8,
        latitude: 40.9015,
        longitude: 20.6558,
        timezone: "Europe/Tirane",
      },
      metadata: {
        seo: {
          title: "Eastern Albania & Lake Ohrid Journeys — Mira",
          description:
            "Discover Eastern Albania: the serene waters of UNESCO Lake Ohrid, the historic cultural capital of Korçë, and ancient Byzantine mountain churches.",
          keywords: ["Eastern Albania", "Lake Ohrid", "Korce", "Pogradec", "Voskopoje"],
          canonicalUrl: "/destinations/europe/albania/eastern-albania",
          robots: { index: true, follow: true },
        },
      },
      hero: {
        breadcrumb: {
          value: "ALBANIA / REGIONS / EASTERN ALBANIA",
          textColor: "#d29393",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Sacred Waters and Highland Heritage",
          textColor: "#FFFFFF",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        subtitle: {
          value: "From Ancient Lake Ohrid to the Aristocratic Allure of Korçë",
          textColor: "#E5E7EB",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value:
            "Journey through a tranquil realm of million-year-old glacial lakes, cobblestone boulevards lined with Parisian-style serenades, and secluded mountain sanctuaries steeped in Byzantine art.",
          textColor: "#F3F4F6",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        isCenter: false,
        buttons: [
          {
            label: "Explore Eastern Albania",
            url: "/journeys?region=eastern-albania",
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
            alt: "Eastern Albania Lake Ohrid",
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
            alt: "Lake Ohrid Aerial",
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
          color: { color: "#171717", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
      },
      essence: {
        label: {
          value: "THE ESSENCE OF EASTERN ALBANIA",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "A timeless crossroads of intellectual heritage and ethereal alpine lakes",
          textColor: "#182d09",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        paragraphs: {
          value:
            "Eastern Albania is anchored by the breathtaking mirror of Lake Ohrid—one of Europe's oldest and deepest biological lakes, shared with North Macedonia and recognized as a UNESCO World Heritage site.\n\nFurther south lies Korçë, famed as the 'Little Paris' of Albania, renowned for its cultural festivals, stone-paved Old Bazaar, and poetic serenades. Nearby, the pine-clad heights of Voskopojë whisper tales of an 18th-century cultural metropolis adorned with exquisite Orthodox frescoes.",
          textColor: "#565e69",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        quote: {
          value: "Lake Ohrid reflects not only the surrounding peaks, but the quiet wisdom of civilizations that have thrived along its shores for millennia.",
          textColor: "#1A1209",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        statValue: {
          value: "1.36M",
          textColor: "#ffffff",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        statLabel: {
          value: "Years of Lake Ohrid's Continuous Geologic Age",
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
            alt: "Eastern Albania Landscapes",
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
            alt: "Eastern Albania video",
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
          color: { color: "#EDE7D8", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
        backgroundMultimedia: {
          show: "color",
          image: { url: "", alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
          video: { url: "", alt: "", autoplay: true, loop: true, muted: true, opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
          color: { color: "#FFF8F2", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
      },
      card: {
        title: "Eastern Albania",
        subtitle: "Lake Ohrid & Mountain Heritage",
        background_image: "",
        button: { label: "EXPLORE EASTERN ALBANIA", url: "/destinations/europe/albania/eastern-albania" },
      },
    },

    {
      name: "Southern Albania",
      slug: "southern-albania",
      type: "REGION" as const,
      geoData: {
        area: { unit: "km²", value: 8200 },
        mapZoom: 8,
        latitude: 40.0758,
        longitude: 20.1389,
        timezone: "Europe/Tirane",
      },
      metadata: {
        seo: {
          title: "Southern Albania & UNESCO Stone Towns — Mira",
          description:
            "Experience Southern Albania: UNESCO World Heritage stone citadels of Gjirokastër and Berat, thermal springs of Benjë, and wild Vjosa National River Park.",
          keywords: ["Southern Albania", "Gjirokaster", "Berat", "Vjosa River", "Permet"],
          canonicalUrl: "/destinations/europe/albania/southern-albania",
          robots: { index: true, follow: true },
        },
      },
      hero: {
        breadcrumb: {
          value: "ALBANIA / REGIONS / SOUTHERN ALBANIA",
          textColor: "#d29393",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Living Stone Citadels and Wild Rivers",
          textColor: "#FFFFFF",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        subtitle: {
          value: "The UNESCO Heart of Ottoman Grandeur and Healing Thermal Springs",
          textColor: "#E5E7EB",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value:
            "Wander through UNESCO-listed stone towns with thousand-window vistas, raft down the pristine wild Vjosa River, and rejuvenate in natural sulfur thermal pools framed by Ottoman stone bridges.",
          textColor: "#F3F4F6",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        isCenter: false,
        buttons: [
          {
            label: "Explore Southern Albania",
            url: "/journeys?region=southern-albania",
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
            alt: "Southern Albania Stone Citadels",
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
            alt: "Southern Albania Aerial View",
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
          color: { color: "#171717", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
      },
      essence: {
        label: {
          value: "THE ESSENCE OF SOUTHERN ALBANIA",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Ancient stone castles rising above untouched turquoise river valleys",
          textColor: "#182d09",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        paragraphs: {
          value:
            "Southern Albania is a living open-air museum of Balkan history. The UNESCO jewel of Gjirokastër—the 'City of Stone'—stands defiantly against Mount Gjere, its fortress and slate-roofed Ottoman mansions creating a mesmerizing skyline.\n\nThrough the dramatic valleys flows the Vjosa, Europe's first Wild River National Park, offering untamed waters and untouched biodiversity. In Përmet, natural thermal hot springs under the 18th-century Kadiu Bridge offer an unforgettable restorative escape.",
          textColor: "#565e69",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        quote: {
          value: "Southern Albania is where history isn't preserved behind glass—it is lived on cobblestone streets, in grand fortress halls, and along wild crystal currents.",
          textColor: "#1A1209",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        statValue: {
          value: "270+",
          textColor: "#ffffff",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        statLabel: {
          value: "Kilometers of Protected Wild River Valley (Vjosa)",
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
            alt: "Southern Albania Landscape",
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
            alt: "Southern Albania video",
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
          color: { color: "#EDE7D8", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
        backgroundMultimedia: {
          show: "color",
          image: { url: "", alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
          video: { url: "", alt: "", autoplay: true, loop: true, muted: true, opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
          color: { color: "#FFF8F2", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
      },
      card: {
        title: "Southern Albania",
        subtitle: "UNESCO Stone Towns & Wild Vjosa",
        background_image: "",
        button: { label: "EXPLORE SOUTHERN ALBANIA", url: "/destinations/europe/albania/southern-albania" },
      },
    },

    {
      name: "Central Albania",
      slug: "central-albania",
      type: "REGION" as const,
      geoData: {
        area: { unit: "km²", value: 7800 },
        mapZoom: 8,
        latitude: 41.3275,
        longitude: 19.8187,
        timezone: "Europe/Tirane",
      },
      metadata: {
        seo: {
          title: "Central Albania, Tirana & Historic Krujë — Mira",
          description:
            "Discover Central Albania: the vibrant avant-garde energy of capital Tirana, the historic mountain fortress of Krujë, and ancient Roman port of Durrës.",
          keywords: ["Central Albania", "Tirana", "Kruje", "Durres", "Skanderbeg"],
          canonicalUrl: "/destinations/europe/albania/central-albania",
          robots: { index: true, follow: true },
        },
      },
      hero: {
        breadcrumb: {
          value: "ALBANIA / REGIONS / CENTRAL ALBANIA",
          textColor: "#d29393",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "The Vibrant Pulse of Culture and Heroic Legends",
          textColor: "#FFFFFF",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        subtitle: {
          value: "Avant-Garde Tirana and the Mountain Stronghold of Krujë",
          textColor: "#E5E7EB",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        description: {
          value:
            "Immerse yourself in dynamic urban art galleries, culinary renaissance bistros, historic castles that held off mighty empires, and sunlit Adriatic coastal promenades.",
          textColor: "#F3F4F6",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        isCenter: false,
        buttons: [
          {
            label: "Explore Central Albania",
            url: "/journeys?region=central-albania",
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
            alt: "Central Albania and Tirana Skyline",
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
            alt: "Central Albania Aerial View",
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
          color: { color: "#171717", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
      },
      essence: {
        label: {
          value: "THE ESSENCE OF CENTRAL ALBANIA",
          textColor: "#af6348",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        title: {
          value: "Where medieval fortitude meets modern European artistic reinvention",
          textColor: "#182d09",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        paragraphs: {
          value:
            "Central Albania represents the heart and soul of the nation's contemporary dynamism. In the capital, Tirana, colorful pastel facades, thriving espresso terraces, and world-class culinary reinvention coexist alongside Cold War bunker museums.\n\nPerched dramatically on the slopes above lies Krujë, the legendary mountain citadel of national hero Skanderbeg, housing centuries-old artisan workshops and antique bazaars. Just a short journey west, ancient Roman amphitheaters and breezy seaside promenades define the historical port of Durrës.",
          textColor: "#565e69",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        quote: {
          value: "Central Albania pulses with fearless creative optimism while standing firmly rooted in its legendary heroic past.",
          textColor: "#1A1209",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        statValue: {
          value: "2,000+",
          textColor: "#ffffff",
          textOpacity: 1,
          backgroundColor: null,
          backgroundOpacity: 1,
        },
        statLabel: {
          value: "Years of Layered Illyrian, Roman & Ottoman History",
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
            alt: "Central Albania Landscape",
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
            alt: "Central Albania video",
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
          color: { color: "#EDE7D8", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
        backgroundMultimedia: {
          show: "color",
          image: { url: "", alt: "", opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
          video: { url: "", alt: "", autoplay: true, loop: true, muted: true, opacity: 100, overlayColor: "#000000", overlayOpacity: 0, width: "100%", height: "auto", aspectRatio: "auto", fit: "cover" },
          color: { color: "#FFF8F2", opacity: 100, width: "100%", height: "100%", aspectRatio: "auto" },
        },
      },
      card: {
        title: "Central Albania",
        subtitle: "Capital Energy & Skanderbeg Heritage",
        background_image: "",
        button: { label: "EXPLORE CENTRAL ALBANIA", url: "/destinations/europe/albania/central-albania" },
      },
    },
  ];

  for (const region of regions) {
    const existing = await prisma.location.findFirst({
      where: { slug: region.slug },
    });

    if (existing) {
      console.log(`Updating existing region: ${region.name}...`);
      await prisma.location.update({
        where: { id: existing.id },
        data: {
          ...region,
          parent: {
            connect: { id: albania.id },
          },
        },
      });
      console.log(`Region updated: ${region.name} (${existing.id})`);
    } else {
      console.log(`Creating new region: ${region.name}...`);
      const created = await prisma.location.create({
        data: {
          ...region,
          parent: {
            connect: { id: albania.id },
          },
        },
      });
      console.log(`Region created: ${region.name} (${created.id})`);
    }
  }

  const albaniaWithChildren = await prisma.location.findUnique({
    where: { id: albania.id },
    include: {
      parent: { select: { id: true, name: true, slug: true, type: true } },
      children: { select: { id: true, name: true, slug: true, type: true } },
    },
  });

  console.log("Albania Hierarchy Result:", JSON.stringify(albaniaWithChildren, null, 2));
}

main()
  .catch((e) => {
    console.error("Error running script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
