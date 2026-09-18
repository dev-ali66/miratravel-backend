import prisma from "../../config/prisma.js"

export const countrySeedData = [
  {
    name: "Bulgaria",
    slug: "bulgaria",
    type: "COUNTRY" as const,
    parentId: null,
    hero: {
      label: { value: "THE BALKANS / BULGARIA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Discover Bulgaria", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Thracian Gold, Valley of Roses & Sacred Rila", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value:
          "Centuries-old monastic sanctuaries tucked inside forested mountains, European Capital of Culture heritage in Plovdiv, and scenic Black Sea coasts.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          rounded: "full",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: {
          url: "/images/bulgaria.jpg",
          alt: "Discover Bulgaria",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 40,
          fit: "cover",
        },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF BULGARIA", textColor: "#af6348" },
      title: { value: "A country that kept its secrets for fifty years", textColor: "#182d09" },
      paragraphs: {
        value:
          "Bulgaria is a land of fascinating cultural crossroads. Discover Plovdiv, one of the oldest continuously inhabited cities in Europe with its Roman amphitheater and vibrant arts district.\n\nJourney into the Rila Mountains to explore the majestic Rila Monastery, hike the Seven Rila Lakes, and savor native Thracian grape varietals like Mavrud.",
        textColor: "#565e69",
      },
      quote: {
        value: "“You arrive with no preconceptions and leave with stories that nobody else has told.”",
        textColor: "#182d09",
      },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "SEASONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Regions of Bulgaria", textColor: "#182d09" },
      description: {
        value: "A selection of destinations currently resonating with our most discerning travelers.",
        textColor: "#565e69",
      },
      items: ["Rila Monastery", "Ancient Plovdiv", "Seven Rila Lakes", "Rose Valley"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Bulgaria", textColor: "#182d09" },
      description: {
        value: "Private monastery tours, Thracian tomb viewings, and scenic alpine lake hikes.",
        textColor: "#565e69",
      },
      items: [
        {
          id: "bulgaria-1",
          title: { value: "UNESCO Rila Monastery Sanctuary", textColor: "#182d09" },
          description: {
            value: "Marvel at colorful striped arcades and ancient Byzantine frescoes with private historians.",
            textColor: "#565e69",
          },
          buttons: [{ label: "Explore Experience", url: "/destinations/bulgaria", variant: "link", textColor: "#af6348" }],
        },
        {
          id: "bulgaria-2",
          title: { value: "Seven Rila Lakes Glacial Trek", textColor: "#182d09" },
          description: {
            value: "A private guided trek across Bulgaria’s most celebrated glacial mountain lakes.",
            textColor: "#565e69",
          },
          buttons: [{ label: "Explore Experience", url: "/destinations/bulgaria", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Travel Insights for Bulgaria", textColor: "#182d09" },
      description: { value: "Essential information before planning your private Balkan journey.", textColor: "#565e69" },
      items: [
        {
          question: "What is the best time of year to visit Bulgaria?",
          answer: "May to October is wonderful for cultural sightseeing; mountain lake hiking is finest July through September.",
        },
        {
          question: "Do I need a visa to visit Bulgaria?",
          answer: "Bulgaria is part of the Schengen area. EU, US, and UK passport holders do not require a visa for stays up to 90 days.",
        },
      ],
    },
    cta: {
      label: { value: "START YOUR JOURNEY", textColor: "#af6348" },
      title: { value: "Ready to Experience Bulgaria?", textColor: "#182d09" },
      description: { value: "Let our private travel curators design your bespoke itinerary.", textColor: "#565e69" },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
    },
    metadata: {
      seo: {
        title: "Explore Bulgaria — Rila Monastery, Plovdiv & Mountains | MIRA",
        description:
          "Experience bespoke private travel in Bulgaria. Discover UNESCO Rila Monastery, ancient Plovdiv, and the Seven Rila Lakes with MIRA.",
        keywords: ["Bulgaria luxury travel", "Rila Monastery tour", "visit Plovdiv", "Seven Rila Lakes hiking"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/bulgaria",
      },
    },
  },
  {
    name: "Greece",
    slug: "greece",
    type: "COUNTRY" as const,
    parentId: null,
    hero: {
      label: { value: "THE BALKANS / GREECE", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Discover Greece", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Ancient Mythology & Suspended Monasteries", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value:
          "Monolithic stone pillars crowned with Byzantine monasteries, crystalline Ionian waters, and millennia of philosophy and art.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          rounded: "full",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: {
          url: "/images/greece.jpg",
          alt: "Discover Greece",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 40,
          fit: "cover",
        },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF GREECE", textColor: "#af6348" },
      title: { value: "Mythical landscapes and clifftop sanctuaries", textColor: "#182d09" },
      paragraphs: {
        value:
          "While Greece needs little introduction, its northern and Balkan frontiers reveal an authentic, uncrowded majesty. Witness the otherworldly rock pillars of Meteora, home to 14th-century monasteries floating in the mist.\n\nExplore traditional stone villages in Zagori, hike through the Vikos Gorge (one of the deepest in the world), and savor authentic Greek gastronomy.",
        textColor: "#565e69",
      },
      quote: {
        value: "“Stand upon Meteora’s suspended cliffs and touch the threshold of ancient heavens.”",
        textColor: "#182d09",
      },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "SEASONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Regions of Greece", textColor: "#182d09" },
      description: { value: "Highlights across northern and coastal Greece.", textColor: "#565e69" },
      items: ["Meteora Monasteries", "Zagori Villages", "Vikos Gorge", "Ionian Seas"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Greece", textColor: "#182d09" },
      description: { value: "Private sunset monastery tours, canyon hikes, and boutique olive tastings.", textColor: "#565e69" },
      items: [
        {
          id: "greece-1",
          title: { value: "Meteora Sunset Clifftop Tour", textColor: "#182d09" },
          description: { value: "Witness the golden hour over sacred suspended stone monoliths.", textColor: "#565e69" },
          buttons: [{ label: "Explore Experience", url: "/destinations/greece", variant: "link", textColor: "#af6348" }],
        },
        {
          id: "greece-2",
          title: { value: "Vikos Gorge & Zagori Stone Bridges", textColor: "#182d09" },
          description: { value: "Hike historic arched Ottoman bridges through the deepest canyon gorge in the world.", textColor: "#565e69" },
          buttons: [{ label: "Explore Experience", url: "/destinations/greece", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Travel Insights for Greece", textColor: "#182d09" },
      description: { value: "Essential information before planning your custom Greek trip.", textColor: "#565e69" },
      items: [
        {
          question: "When is the best time to visit Northern Greece & Meteora?",
          answer: "April to June and September to November offer clear skies, pleasant weather, and stunning natural colors.",
        },
      ],
    },
    cta: {
      label: { value: "START YOUR JOURNEY", textColor: "#af6348" },
      title: { value: "Ready to Experience Greece?", textColor: "#182d09" },
      description: { value: "Let our private travel curators design your bespoke itinerary.", textColor: "#565e69" },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
    },
    metadata: {
      seo: {
        title: "Explore Greece — Meteora, Zagori & Sacred Landscapes | MIRA",
        description:
          "Discover private custom tours in Northern Greece and Meteora. Experience UNESCO monasteries, Vikos Gorge, and authentic Greek heritage.",
        keywords: ["Greece bespoke travel", "Meteora private tour", "Zagori villages tour", "visit Northern Greece"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/greece",
      },
    },
  },
  {
    name: "Slovenia",
    slug: "slovenia",
    type: "COUNTRY" as const,
    parentId: null,
    hero: {
      label: { value: "THE BALKANS / SLOVENIA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Discover Slovenia", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Emerald Alpine Glades & Green Capital Charm", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value:
          "Fairy-tale glacial lakes, emerald rivers in the Julian Alps, underground karst wonders, and boutique organic vineyards.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          rounded: "full",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: {
          url: "/images/balkan1.jpg",
          alt: "Discover Slovenia",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 40,
          fit: "cover",
        },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF SLOVENIA", textColor: "#af6348" },
      title: { value: "Pristine nature and refined sustainability", textColor: "#182d09" },
      paragraphs: {
        value:
          "Slovenia is an eco-paradise of dramatic contrasts. Gaze upon the iconic island church of Lake Bled, raft the turquoise rapids of the Soča River, and explore subterranean marvels in Postojna.\n\nLjubljana captivates with Jože Plečnik’s riverside architecture, green parks, and vibrant culinary innovation.",
        textColor: "#565e69",
      },
      quote: {
        value: "“Where alpine majesty meets Mediterranean warmth.”",
        textColor: "#182d09",
      },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "SEASONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Regions of Slovenia", textColor: "#182d09" },
      description: { value: "Top highlights across Slovenia.", textColor: "#565e69" },
      items: ["Lake Bled", "Soča Valley", "Julian Alps", "Ljubljana Old Town"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Slovenia", textColor: "#182d09" },
      description: { value: "Pletna boat rides, alpine cheese trails, and private castle dinners.", textColor: "#565e69" },
      items: [
        {
          id: "slovenia-1",
          title: { value: "Pletna Boat Ride to Bled Island", textColor: "#182d09" },
          description: { value: "Private wooden boat row to Slovenia’s sole island followed by potica cake tasting.", textColor: "#565e69" },
          buttons: [{ label: "Explore Experience", url: "/destinations/slovenia", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Travel Insights for Slovenia", textColor: "#182d09" },
      description: { value: "Essential info before traveling to Slovenia.", textColor: "#565e69" },
      items: [
        {
          question: "When is the best time to visit Lake Bled and the Alps?",
          answer: "May to October for lake activities and hiking; December to March for snowy alpine escapes.",
        },
      ],
    },
    cta: {
      label: { value: "START YOUR JOURNEY", textColor: "#af6348" },
      title: { value: "Ready to Experience Slovenia?", textColor: "#182d09" },
      description: { value: "Let our private travel curators design your bespoke itinerary.", textColor: "#565e69" },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
    },
    metadata: {
      seo: {
        title: "Explore Slovenia — Lake Bled, Alps & Sustainable Luxury | MIRA",
        description:
          "Discover bespoke private travel in Slovenia. Visit Lake Bled, Julian Alps, and Ljubljana with MIRA’s luxury travel designers.",
        keywords: ["Slovenia luxury travel", "Lake Bled private tour", "visit Slovenia", "Soča river tour"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/slovenia",
      },
    },
  },
  {
    name: "North Macedonia",
    slug: "north-macedonia",
    type: "COUNTRY" as const,
    parentId: null,
    hero: {
      label: { value: "THE BALKANS / NORTH MACEDONIA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Discover North Macedonia", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Ancient Lakes & Byzantine Marvels", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value:
          "One of the oldest and deepest lakes in the world, surrounded by clifftop monasteries, lush wine valleys, and historic bazaars.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          rounded: "full",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: {
          url: "/images/north.jpg",
          alt: "Discover North Macedonia",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 40,
          fit: "cover",
        },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF NORTH MACEDONIA", textColor: "#af6348" },
      title: { value: "Serene ancient waters and rich culinary traditions", textColor: "#182d09" },
      paragraphs: {
        value:
          "Lake Ohrid, a dual UNESCO World Heritage site, is the soul of North Macedonia. Admire the iconic clifftop Church of Saint John at Kaneo, explore the Old Bazaar of Skopje, and sample rich Vranec red wines in Tikveš.\n\nFrom high peaks in Mavrovo National Park to tranquil Ottoman architecture, this land offers gentle pacing and timeless beauty.",
        textColor: "#565e69",
      },
      quote: {
        value: "“Gaze over Lake Ohrid where centuries of Byzantine light meet quiet Balkan waters.”",
        textColor: "#182d09",
      },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "SEASONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Highlights of North Macedonia", textColor: "#182d09" },
      description: { value: "Curated regional destinations.", textColor: "#565e69" },
      items: ["Lake Ohrid", "Saint John at Kaneo", "Tikveš Wine Region", "Mavrovo Park"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in North Macedonia", textColor: "#182d09" },
      description: { value: "Private wooden boat sails, wine tastings, and Byzantine art pilgrimages.", textColor: "#565e69" },
      items: [
        {
          id: "north-1",
          title: { value: "Tikveš Valley Private Vineyard Tour", textColor: "#182d09" },
          description: { value: "Taste deep Vranec reserves paired with local gastronomic specialties.", textColor: "#565e69" },
          buttons: [{ label: "Explore Experience", url: "/destinations/north-macedonia", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Travel Insights for North Macedonia", textColor: "#182d09" },
      description: { value: "Essential info before your trip.", textColor: "#565e69" },
      items: [
        {
          question: "What is the best season for Lake Ohrid?",
          answer: "Late spring, summer, and early autumn are idyllic for swimming, sailing, and wine harvest tours.",
        },
      ],
    },
    cta: {
      label: { value: "START YOUR JOURNEY", textColor: "#af6348" },
      title: { value: "Ready to Experience North Macedonia?", textColor: "#182d09" },
      description: { value: "Let our private travel curators design your bespoke itinerary.", textColor: "#565e69" },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
    },
    metadata: {
      seo: {
        title: "Explore North Macedonia — Lake Ohrid & Wine Valleys | MIRA",
        description:
          "Discover bespoke travel itineraries in North Macedonia. Explore UNESCO Lake Ohrid, Tikves wine valleys, and historic Skopje with MIRA.",
        keywords: ["North Macedonia travel", "Lake Ohrid private tour", "visit Macedonia", "Tikves wine tours"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/north-macedonia",
      },
    },
  },
  {
    name: "Albania",
    slug: "albania",
    type: "COUNTRY" as const,
    parentId: null,
    hero: {
      label: { value: "THE BALKANS / ALBANIA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Discover Albania", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Europe’s Last Great Discovery", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value:
          "Ancient Ottoman towns, dramatic Accursed Mountains, and untamed turquoise waters along the Ionian coast — raw, welcoming, and endlessly captivating.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          rounded: "full",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: {
          url: "/images/albania.png",
          alt: "Discover Albania",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 40,
          fit: "cover",
        },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF ALBANIA", textColor: "#af6348" },
      title: { value: "Where dramatic peaks meet pristine Mediterranean waters", textColor: "#182d09" },
      paragraphs: {
        value:
          "Albania is a rare European jewel where ancient history and raw natural beauty exist in untouched harmony. From stone alleys of Gjirokastër and Berat to serene, sun-drenched coves of the southern Riviera, every turn reveals untold stories.\n\nSavor organic farm-to-table cuisine, hike through glacial valleys in Valbona and Theth, and experience warm, heartfelt Balkan hospitality.",
        textColor: "#565e69",
      },
      quote: {
        value: "“You arrive with no preconceptions and leave with stories that nobody else has told.”",
        textColor: "#182d09",
      },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "SEASONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Regions of Albania", textColor: "#182d09" },
      description: { value: "A selection of destinations currently resonating with discerning travelers.", textColor: "#565e69" },
      items: ["Ionian Riviera", "Accursed Mountains", "UNESCO Heritage", "Ottoman Architecture"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Albania", textColor: "#182d09" },
      description: { value: "Hand-picked private excursions from sea caves to mountain olive groves.", textColor: "#565e69" },
      items: [
        {
          id: "albania-1",
          title: { value: "Gjipe Canyon & Sea Kayaking", textColor: "#182d09" },
          description: { value: "Navigate hidden limestone sea caves and secluded coves at your own pace.", textColor: "#565e69" },
          buttons: [{ label: "Explore Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Travel Insights for Albania", textColor: "#182d09" },
      description: { value: "Essential info before your trip.", textColor: "#565e69" },
      items: [
        {
          question: "When is the best season for the Albanian Riviera?",
          answer: "May to October offers crystal-clear warm waters and sun-filled Mediterranean coastal days.",
        },
      ],
    },
    cta: {
      label: { value: "START YOUR JOURNEY", textColor: "#af6348" },
      title: { value: "Ready to Experience Albania?", textColor: "#182d09" },
      description: { value: "Let our private travel curators design your bespoke itinerary.", textColor: "#565e69" },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
    },
    metadata: {
      seo: {
        title: "Explore Albania — Coastal Wonder & Alpine Majesty | MIRA",
        description:
          "Discover bespoke private journeys across Albania. From the turquoise waters of the Riviera to UNESCO Ottoman towns and dramatic Accursed Mountains.",
        keywords: ["Albania luxury travel", "Albanian Riviera", "visit Albania", "Theth Valbona hike"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/albania",
      },
    },
  },
  {
    name: "Kosovo",
    slug: "kosovo",
    type: "COUNTRY" as const,
    parentId: null,
    hero: {
      label: { value: "THE BALKANS / KOSOVO", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Discover Kosovo", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Dynamic Spirit, Historic Treasures & Rugova Peaks", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value:
          "Enchanting Ottoman bridges, medieval monasteries with breathtaking frescoes, and Europe’s most vibrant coffee culture.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          rounded: "full",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: {
          url: "/images/kosvo.jpg",
          alt: "Discover Kosovo",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 40,
          fit: "cover",
        },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF KOSOVO", textColor: "#af6348" },
      title: { value: "A young, warm nation steeped in living heritage", textColor: "#182d09" },
      paragraphs: {
        value:
          "Kosovo is Europe’s youngest country, radiating infectious energy, warm welcomes, and rich historic treasures. Stroll through the cobblestone alleys of Prizren beneath its imposing hilltop fortress.\n\nExplore dramatic Rugova Gorge, ancient monasteries of Decani and Gracanica, and Pristina’s modern arts scene.",
        textColor: "#565e69",
      },
      quote: {
        value: "“Feel the energy of Europe’s youngest heart.”",
        textColor: "#182d09",
      },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "SEASONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Regions of Kosovo", textColor: "#182d09" },
      description: { value: "Curated regional destinations in Kosovo.", textColor: "#565e69" },
      items: ["Historic Prizren", "Rugova Gorge", "UNESCO Monasteries", "Sharr Mountains"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Kosovo", textColor: "#182d09" },
      description: { value: "Explore ancient fortress vistas and sacred frescoes.", textColor: "#565e69" },
      items: [
        {
          id: "kosovo-1",
          title: { value: "Rugova Canyon Via Ferrata Trek", textColor: "#182d09" },
          description: { value: "Experience breathtaking views along premier alpine via ferrata trails.", textColor: "#565e69" },
          buttons: [{ label: "Explore Experience", url: "/destinations/kosovo", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Travel Insights for Kosovo", textColor: "#182d09" },
      description: { value: "Essential info before your trip.", textColor: "#565e69" },
      items: [
        {
          question: "When is the best time to visit Kosovo?",
          answer: "Spring through autumn offers comfortable weather for both mountain hikes and historic city walks.",
        },
      ],
    },
    cta: {
      label: { value: "START YOUR JOURNEY", textColor: "#af6348" },
      title: { value: "Ready to Experience Kosovo?", textColor: "#182d09" },
      description: { value: "Let our private travel curators design your bespoke itinerary.", textColor: "#565e69" },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
    },
    metadata: {
      seo: {
        title: "Explore Kosovo — Prizren, Rugova Canyon & Monasteries | MIRA",
        description:
          "Discover authentic private tours in Kosovo. Experience Prizren fortress, Rugova gorge, and world-renowned cultural heritage with MIRA.",
        keywords: ["Kosovo travel", "visit Prizren", "Rugova Canyon", "Bespoke Kosovo tours"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/kosovo",
      },
    },
  },
  {
    name: "Montenegro",
    slug: "montenegro",
    type: "COUNTRY" as const,
    parentId: null,
    hero: {
      label: { value: "THE BALKANS / MONTENEGRO", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Discover Montenegro", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Dramatic Fjords & Venetian Palaces", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value:
          "Towering limestone peaks plunging into the cobalt waters of the Adriatic, ancient walled towns, and tranquil UNESCO fjords.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          rounded: "full",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: {
          url: "/images/monte.jpg",
          alt: "Discover Montenegro",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 40,
          fit: "cover",
        },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF MONTENEGRO", textColor: "#af6348" },
      title: { value: "Majestic fjords, alpine peaks, and coastal elegance", textColor: "#182d09" },
      paragraphs: {
        value:
          "Montenegro packs immense geographic beauty into an intimate territory. Cruise the serene Bay of Kotor, marvel at Our Lady of the Rocks, and wander through Venetian fortifications in Perast.\n\nHead inland to the wild peaks of Durmitor National Park and deep Tara River Canyon.",
        textColor: "#565e69",
      },
      quote: {
        value: "“Where mountains touch the sea in silent majesty.”",
        textColor: "#182d09",
      },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "SEASONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Regions of Montenegro", textColor: "#182d09" },
      description: { value: "Top regional highlights across Montenegro.", textColor: "#565e69" },
      items: ["Bay of Kotor", "Durmitor National Park", "Perast & Kotor", "Tara Canyon"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Montenegro", textColor: "#182d09" },
      description: { value: "Private yacht sails, mountain transfers, and Venetian history tours.", textColor: "#565e69" },
      items: [
        {
          id: "monte-1",
          title: { value: "Perast & Islet Monasteries by Speedboat", textColor: "#182d09" },
          description: { value: "Private sailing through Kotor Bay with exclusive entry to island chapel museums.", textColor: "#565e69" },
          buttons: [{ label: "Explore Experience", url: "/destinations/montenegro", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Travel Insights for Montenegro", textColor: "#182d09" },
      description: { value: "Essential info before your trip.", textColor: "#565e69" },
      items: [
        {
          question: "When is the best season for Kotor Bay?",
          answer: "May to October offers perfect warm coastal weather for yacht charters and town exploration.",
        },
      ],
    },
    cta: {
      label: { value: "START YOUR JOURNEY", textColor: "#af6348" },
      title: { value: "Ready to Experience Montenegro?", textColor: "#182d09" },
      description: { value: "Let our private travel curators design your bespoke itinerary.", textColor: "#565e69" },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
    },
    metadata: {
      seo: {
        title: "Explore Montenegro — Bay of Kotor & Durmitor Mountains | MIRA",
        description:
          "Discover private luxury itineraries in Montenegro. Sail the Bay of Kotor, explore Venetian fortress towns, and hike dramatic alpine peaks.",
        keywords: ["Montenegro luxury travel", "Bay of Kotor yacht charter", "visit Montenegro", "Durmitor hiking"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/montenegro",
      },
    },
  },
  {
    name: "Bosnia & Herzegovina",
    slug: "bosnia-and-herzegovina",
    type: "COUNTRY" as const,
    parentId: null,
    hero: {
      label: { value: "THE BALKANS / BOSNIA & HERZEGOVINA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Discover Bosnia & Herzegovina", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Where East Meets West in Timeless Harmony", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value:
          "Cobblestone bazaars, emerald rivers, and monumental Ottoman bridges intertwined with Austro-Hungarian grandeur and poetic hospitality.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          rounded: "full",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: {
          url: "/images/bosnia.jpg",
          alt: "Discover Bosnia & Herzegovina",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 40,
          fit: "cover",
        },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF BOSNIA & HERZEGOVINA", textColor: "#af6348" },
      title: { value: "A cultural tapestry woven across green valleys and rushing rivers", textColor: "#182d09" },
      paragraphs: {
        value:
          "Bosnia and Herzegovina stands as one of the most culturally profound corners of Europe. Sarajevo’s vibrant Baščaršija echoes with centuries of coexistence, while emerald waters of Neretva flow beneath the iconic Old Bridge of Mostar.\n\nImmerse yourself in rich coffee traditions and explore Počitelj and Kravica Waterfalls.",
        textColor: "#565e69",
      },
      quote: {
        value: "“Where rivers flow under stone bridges built by ancient Ottoman masters.”",
        textColor: "#182d09",
      },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "SEASONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Regions of Bosnia & Herzegovina", textColor: "#182d09" },
      description: { value: "Top cultural and natural highlights.", textColor: "#565e69" },
      items: ["Old Bridge of Mostar", "Sarajevo Old Town", "Kravica Waterfalls", "Coffee Culture"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Bosnia & Herzegovina", textColor: "#182d09" },
      description: { value: "Slow travel encounters celebrating authentic craftsmanship and serene rivers.", textColor: "#565e69" },
      items: [
        {
          id: "bosnia-1",
          title: { value: "Sarajevo Artisan Copper & Coffee Ritual", textColor: "#182d09" },
          description: { value: "Forge your own džezva with coppersmiths in Sarajevo’s historic Kazandžiluk.", textColor: "#565e69" },
          buttons: [{ label: "Explore Experience", url: "/destinations/bosnia-and-herzegovina", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Travel Insights for Bosnia & Herzegovina", textColor: "#182d09" },
      description: { value: "Essential info before your journey.", textColor: "#565e69" },
      items: [
        {
          question: "What is the best time to visit Mostar and Sarajevo?",
          answer: "April through October is ideal for city strolls, river dining, and lush nature excursions.",
        },
      ],
    },
    cta: {
      label: { value: "START YOUR JOURNEY", textColor: "#af6348" },
      title: { value: "Ready to Experience Bosnia & Herzegovina?", textColor: "#182d09" },
      description: { value: "Let our private travel curators design your bespoke itinerary.", textColor: "#565e69" },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
    },
    metadata: {
      seo: {
        title: "Explore Bosnia & Herzegovina — Culture, Rivers & History | MIRA",
        description:
          "Experience tailor-made private tours in Bosnia and Herzegovina. Visit Mostar, Sarajevo, and Kravica Waterfalls with MIRA’s bespoke travel curators.",
        keywords: ["Bosnia travel", "visit Mostar", "Sarajevo private tour", "Herzegovina wine tour"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/bosnia-and-herzegovina",
      },
    },
  },
  {
    name: "Croatia",
    slug: "croatia",
    type: "COUNTRY" as const,
    parentId: null,
    hero: {
      label: { value: "THE BALKANS / CROATIA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Discover Croatia", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Adriatic Pearls, Island Hopping & Venetian Heritage", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Ancient walled cities, cascading turquoise waterfalls in Plitvice, and crystal-clear Adriatic archipelagos.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        {
          label: "Plan Your Journey",
          url: "/plan-your-journey",
          variant: "primary",
          style: "primary",
          rounded: "full",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: {
          url: "/images/croatia.jpg",
          alt: "Discover Croatia",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 40,
          fit: "cover",
        },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF CROATIA", textColor: "#af6348" },
      title: { value: "Where the Mediterranean meets medieval history", textColor: "#182d09" },
      paragraphs: {
        value: "Croatia captivates travelers with its dramatic Dalmatian coastline, ancient Roman ruins in Split, and romantic stone alleys of Dubrovnik.",
        textColor: "#565e69",
      },
      quote: { value: "“Those who search for paradise on earth should come to Dubrovnik.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Regions of Croatia", textColor: "#182d09" },
      description: { value: "Iconic Adriatic destinations and island archipelagos.", textColor: "#565e69" },
      items: ["Dubrovnik Old Town", "Split Diocletian Palace", "Hvar Island", "Plitvice Lakes"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Croatia", textColor: "#182d09" },
      description: { value: "Private yacht charters, ancient palace tours, and coastal wine tastings.", textColor: "#565e69" },
      items: [
        {
          id: "croatia-1",
          title: { value: "Private Yacht Island Hopping", textColor: "#182d09" },
          description: { value: "Sail across Hvar, Vis, and Korčula with your private captain.", textColor: "#565e69" },
          buttons: [{ label: "Explore Experience", url: "/destinations/croatia", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Travel Insights for Croatia", textColor: "#182d09" },
      description: { value: "Essential advice for your private Adriatic getaway.", textColor: "#565e69" },
      items: [{ question: "Best months to visit Croatia?", answer: "May to June and September offer ideal weather and fewer crowds." }],
    },
    cta: {
      title: "Plan Your Croatian Escape",
      subtitle: "Tailor-made itineraries across Dubrovnik and the Dalmatian Coast.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Explore Croatia — Dubrovnik, Split & Dalmatian Coast | MIRA",
        description: "Bespoke luxury travel in Croatia. Private yacht charters, historic city guides, and luxury island retreats.",
        keywords: ["Croatia luxury travel", "Dubrovnik private tour", "Split yacht charter"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/croatia",
      },
    },
  },
]

export const regionSeedData = [
  // Albania Regions
  {
    name: "Northern Albania",
    slug: "north-albania",
    countrySlug: "albania",
    type: "REGION" as const,
    hero: {
      label: { value: "ALBANIA / NORTHERN ALBANIA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Northern Albania & The Accursed Mountains", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Untamed Peaks, Alpine Valleys & Glacial Lakes", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Discover Theth Valley, Valbona National Park, and the spectacular fjord-like waters of Lake Koman.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/therch.jpg", alt: "Northern Albania", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF NORTHERN ALBANIA", textColor: "#af6348" },
      title: { value: "The Majestic Accursed Mountains", textColor: "#182d09" },
      paragraphs: {
        value: "Tucked away in the Dinaric Alps, Northern Albania offers dramatic pinnacles, historic stone lock-in towers (Kulla), and serene mountain hamlets like Theth and Valbona.",
        textColor: "#565e69",
      },
      quote: { value: "“An alpine wilderness untouched by time.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Northern Albania", textColor: "#182d09" },
      description: { value: "Must-visit places in the northern mountain heartland.", textColor: "#565e69" },
      items: ["Theth Valley", "Valbona Pass", "Shkodër Lake", "Lake Koman Ferry"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Private Journeys in Northern Albania", textColor: "#182d09" },
      description: { value: "Guided hikes, private Kulla cultural encounters, and Lake Koman boat rides.", textColor: "#565e69" },
      items: [
        {
          id: "north-alb-1",
          title: { value: "Theth to Valbona Mountain Pass Trek", textColor: "#182d09" },
          description: { value: "Hike through high mountain meadow trails with local alpine guides.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Northern Albania Travel Insights", textColor: "#182d09" },
      description: { value: "Essential guidance for mountain travel.", textColor: "#565e69" },
      items: [{ question: "When is the best time to hike?", answer: "May through October for snow-free alpine trails." }],
    },
    cta: {
      title: "Plan Your Northern Albania Escape",
      subtitle: "Tailor-made mountain adventures with MIRA.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Northern Albania & Theth Valley | MIRA Travel",
        description: "Private guided tours in Northern Albania, Theth, and Lake Koman.",
        keywords: ["Northern Albania", "Theth", "Valbona"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/albania/north-albania",
      },
    },
  },
  {
    name: "Central Albania",
    slug: "central-albania",
    countrySlug: "albania",
    type: "REGION" as const,
    hero: {
      label: { value: "ALBANIA / CENTRAL ALBANIA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Central Albania & Ottoman Heritage", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Vibrant Capital, Castle Strongholds & Historic Towns", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Explore Tirana’s bustling modern culture, the thousand-windowed city of Berat, and Skanderbeg’s castle in Krujë.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/tirana.jpg", alt: "Central Albania", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF CENTRAL ALBANIA", textColor: "#af6348" },
      title: { value: "A Tapestry of Modernity & Ottoman Elegance", textColor: "#182d09" },
      paragraphs: {
        value: "From the colourful cafes of Blloku in Tirana to the UNESCO-listed Mangalem quarter of Berat, Central Albania offers a fascinating blend of history and contemporary energy.",
        textColor: "#565e69",
      },
      quote: { value: "“Where history whispers through cobblestone alleys.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Central Albania", textColor: "#182d09" },
      description: { value: "Iconic historic landmarks and urban highlights.", textColor: "#565e69" },
      items: ["Berat Castle", "Tirana Skanderbeg Square", "Krujë Bazaar", "Durrës Amphitheatre"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Private Experiences in Central Albania", textColor: "#182d09" },
      description: { value: "Private wine tasting in Berat and VIP Tirana architectural tours.", textColor: "#565e69" },
      items: [
        {
          id: "central-alb-1",
          title: { value: "UNESCO Berat Private Heritage Tour", textColor: "#182d09" },
          description: { value: "Explore Onufri Iconographic Museum and historic quarters.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Central Albania Insights", textColor: "#182d09" },
      description: { value: "Practical tips for exploring Tirana & Berat.", textColor: "#565e69" },
      items: [{ question: "Is Berat worth visiting?", answer: "Absolutely, it is one of Europe's best preserved Ottoman towns." }],
    },
    cta: {
      title: "Discover Central Albania",
      subtitle: "Tailor-made cultural itineraries crafted by MIRA.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Central Albania, Tirana & UNESCO Berat | MIRA Travel",
        description: "Bespoke tours in Central Albania, Tirana, Berat, and Krujë.",
        keywords: ["Central Albania", "Berat", "Tirana"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/albania/central-albania",
      },
    },
  },
  {
    name: "Southern Albania",
    slug: "south-albania",
    countrySlug: "albania",
    type: "REGION" as const,
    hero: {
      label: { value: "ALBANIA / SOUTHERN ALBANIA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Southern Albania & Stone Heritage", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Ottoman Stone Mansions, Thermal Baths & Canyon Trails", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Walk the stone slate roofs of Gjirokastër, soak in Benja hot springs, and explore the wild Vjosa River.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/southern-albania.png", alt: "Southern Albania", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF SOUTHERN ALBANIA", textColor: "#af6348" },
      title: { value: "City of Stone & Untamed River Valleys", textColor: "#182d09" },
      paragraphs: {
        value: "Southern Albania is home to the UNESCO fortress city of Gjirokastër, traditional polyphonic singing, and the Vjosa National Park — Europe's first wild river national park.",
        textColor: "#565e69",
      },
      quote: { value: "“A stone fortress floating in history.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Southern Albania", textColor: "#182d09" },
      description: { value: "Unforgettable heritage and natural thermal springs.", textColor: "#565e69" },
      items: ["Gjirokastër Citadel", "Benja Thermal Springs", "Lengarica Canyon", "Përmet Eco-Farms"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Southern Albania", textColor: "#182d09" },
      description: { value: "Private mansion tours, traditional culinary masterclasses, and river rafting.", textColor: "#565e69" },
      items: [
        {
          id: "south-alb-1",
          title: { value: "Gjirokastër Zekate House Private Tour", textColor: "#182d09" },
          description: { value: "Step inside grand 18th-century Ottoman tower houses.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Southern Albania Insights", textColor: "#182d09" },
      description: { value: "Practical guidance for Gjirokastër & Përmet.", textColor: "#565e69" },
      items: [{ question: "How to reach Benja Thermal Springs?", answer: "A short 20-minute drive from Përmet town center." }],
    },
    cta: {
      title: "Explore Southern Albania",
      subtitle: "Bespoke stone city and wild river journeys.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Southern Albania & Gjirokastër | MIRA Travel",
        description: "Private tours of Gjirokastër, Përmet, and Vjosa Wild River National Park.",
        keywords: ["Southern Albania", "Gjirokaster", "Permet"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/albania/south-albania",
      },
    },
  },
  {
    name: "Albanian Riviera",
    slug: "albanian-riviera",
    countrySlug: "albania",
    type: "REGION" as const,
    hero: {
      label: { value: "ALBANIA / ALBANIAN RIVIERA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "The Ionian Coast & Albanian Riviera", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Turquoise Coves, Clifftop Villages & Private Beaches", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Sun-drenched Mediterranean coastline stretching from Llogara Pass down to the ruins of Butrint.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/alabian-riveria.png", alt: "Albanian Riviera", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF THE RIVIERA", textColor: "#af6348" },
      title: { value: "Untamed Turquoise Waters & Hidden Bays", textColor: "#182d09" },
      paragraphs: {
        value: "The Albanian Riviera boasts crystal clear waters rivaling Greece and Italy, complemented by intimate seafood tavernas and private speed boat access to secret sea caves.",
        textColor: "#565e69",
      },
      quote: { value: "“Europe’s most captivating secret coast.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places on the Riviera", textColor: "#182d09" },
      description: { value: "Pristine beaches and archaeological treasures.", textColor: "#565e69" },
      items: ["Dhërmi Old Village", "Himarë Castle", "Ksamil Islands", "UNESCO Butrint"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Riviera", textColor: "#182d09" },
      description: { value: "Private speed boat charters to Grama Bay and clifftop olive grove dining.", textColor: "#565e69" },
      items: [
        {
          id: "riviera-1",
          title: { value: "Grama Bay Private Speedboat Cruise", textColor: "#182d09" },
          description: { value: "Discover ancient sailors' stone inscriptions in secluded coastal caves.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Albanian Riviera Insights", textColor: "#182d09" },
      description: { value: "Practical guidance for coastal escapes.", textColor: "#565e69" },
      items: [{ question: "Best months for beach weather?", answer: "June to September for warm sea temperatures and sunny skies." }],
    },
    cta: {
      title: "Plan Your Riviera Getaway",
      subtitle: "Custom coastal luxury itineraries with MIRA.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Albanian Riviera & Dhërmi Luxury Travel | MIRA",
        description: "Bespoke Riviera vacations, private boat charters, and luxury stays in Dhërmi and Ksamil.",
        keywords: ["Albanian Riviera", "Dhermi", "Ksamil", "Butrint"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/albania/albanian-riviera",
      },
    },
  },
  {
    name: "Eastern Albania",
    slug: "eastern-albania",
    countrySlug: "albania",
    type: "REGION" as const,
    hero: {
      label: { value: "ALBANIA / EASTERN ALBANIA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Eastern Albania & Lake Ohrid", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Cultural Capitals, Mountain Pass Hamlets & Lakeshore Serenades", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Discover Korçë’s traditional serenade songs, Voskopojë’s 18th-century frescoed churches, and Pogradec on Lake Ohrid.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/eastern-albania.png", alt: "Eastern Albania", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF EASTERN ALBANIA", textColor: "#af6348" },
      title: { value: "Culture, Cuisine & Lakeshore Peace", textColor: "#182d09" },
      paragraphs: {
        value: "Known as the Paris of Albania, Korçë charms visitors with its old bazaar, beer brewing heritage, and proximity to mountain hamlets.",
        textColor: "#565e69",
      },
      quote: { value: "“Where music and tradition echo across high plateaus.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Eastern Albania", textColor: "#182d09" },
      description: { value: "Cultural treasures and lakeshore retreats.", textColor: "#565e69" },
      items: ["Korçë Old Bazaar", "Voskopojë Churches", "Pogradec Waterfront", "Drenovë National Park"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Experiences in Eastern Albania", textColor: "#182d09" },
      description: { value: "Private iconographic art tours and lakeside Ohrid trout culinary experiences.", textColor: "#565e69" },
      items: [
        {
          id: "east-alb-1",
          title: { value: "Voskopojë Byzantine Fresco Tour", textColor: "#182d09" },
          description: { value: "Explore hidden 18th-century masterworks with local art historians.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Eastern Albania Insights", textColor: "#182d09" },
      description: { value: "Travel recommendations for Korçë.", textColor: "#565e69" },
      items: [{ question: "What is Korçë famous for?", answer: "Its autumn beer festival, serenade music, and historic bazaar." }],
    },
    cta: {
      title: "Explore Eastern Albania",
      subtitle: "Bespoke cultural & mountain journeys.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Eastern Albania, Korçë & Voskopojë | MIRA Travel",
        description: "Explore Korçë, Voskopojë, and Pogradec with MIRA Travel.",
        keywords: ["Eastern Albania", "Korce", "Voskopoje"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/albania/eastern-albania",
      },
    },
  },

  // Bosnia Regions
  {
    name: "Herzegovina",
    slug: "herzegovina",
    countrySlug: "bosnia-and-herzegovina",
    type: "REGION" as const,
    hero: {
      label: { value: "BOSNIA & HERZEGOVINA / HERZEGOVINA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Herzegovina & Mostar Valley", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Iconic Bridges, Dervish Monasteries & Sunlit Vineyards", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Walk the cobblestones of Stari Most in Mostar, marvel at Blagaj Tekke, and cool down at Kravica Waterfalls.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/mostar-culture.jpg", alt: "Herzegovina", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF HERZEGOVINA", textColor: "#af6348" },
      title: { value: "Where Emerald Rivers Carve Historic Valleys", textColor: "#182d09" },
      paragraphs: {
        value: "Herzegovina is famed for its Mediterranean climate, ancient stone bridge architecture, and world-class Žilavka and Blatina wine routes.",
        textColor: "#565e69",
      },
      quote: { value: "“The bridge stands not to divide, but to unite worlds.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Herzegovina", textColor: "#182d09" },
      description: { value: "Must-visit historical and natural marvels.", textColor: "#565e69" },
      items: ["Mostar Old Bridge", "Blagaj Dervish Monastery", "Kravica Waterfalls", "Počitelj Medieval Citadel"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Herzegovina", textColor: "#182d09" },
      description: { value: "Private bridge diver demonstrations, VIP dervish monastery access, and estate wine tastings.", textColor: "#565e69" },
      items: [
        {
          id: "herz-1",
          title: { value: "Mostar Stari Most Private Masterclass & Tasting", textColor: "#182d09" },
          description: { value: "Watch traditional bridge divers from a private riverbank lounge.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/bosnia-and-herzegovina", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Herzegovina Travel Insights", textColor: "#182d09" },
      description: { value: "Essential guidance for visiting Mostar.", textColor: "#565e69" },
      items: [{ question: "How far is Kravica Waterfalls from Mostar?", answer: "Approximately 40 minutes by private car." }],
    },
    cta: {
      title: "Plan Your Herzegovina Journey",
      subtitle: "Bespoke itineraries in Mostar and Blagaj.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Herzegovina & Mostar Travel Guide | MIRA",
        description: "Bespoke luxury tours in Herzegovina, Mostar, Blagaj, and Kravica Waterfalls.",
        keywords: ["Herzegovina", "Mostar", "Blagaj", "Kravica"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/bosnia-and-herzegovina/herzegovina",
      },
    },
  },
  {
    name: "Sarajevo Canton",
    slug: "sarajevo-canton",
    countrySlug: "bosnia-and-herzegovina",
    type: "REGION" as const,
    hero: {
      label: { value: "BOSNIA & HERZEGOVINA / SARAJEVO", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Sarajevo Canton & Baščaršija", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Jerusalem of Europe, Olympic Mountains & Coffee Culture", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Where East meets West in the heart of the Balkans — historic copper bazaars, Ottoman mosques, and Austro-Hungarian architecture.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/bosnia.jpg", alt: "Sarajevo Canton", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF SARAJEVO", textColor: "#af6348" },
      title: { value: "A City of Living History & Resilience", textColor: "#182d09" },
      paragraphs: {
        value: "Sarajevo is renowned for its harmonious co-existence of Islamic, Christian, and Jewish heritage, set against the backdrop of lush forested mountains.",
        textColor: "#565e69",
      },
      quote: { value: "“A city with a soul that stays with you forever.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Sarajevo", textColor: "#182d09" },
      description: { value: "Iconic historical quarters and alpine cable cars.", textColor: "#565e69" },
      items: ["Baščaršija Old Bazaar", "Trebević Cable Car", "Gazi Husrev-beg Mosque", "Latin Bridge"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Sarajevo", textColor: "#182d09" },
      description: { value: "Private Bosnian coffee brewing workshops and WWII history walking tours.", textColor: "#565e69" },
      items: [
        {
          id: "sar-1",
          title: { value: "Authentic Baščaršija Coppersmith Masterclass", textColor: "#182d09" },
          description: { value: "Craft your own traditional copper coffee set with master artisan families.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/bosnia-and-herzegovina", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Sarajevo Travel Insights", textColor: "#182d09" },
      description: { value: "Practical tips for exploring Sarajevo.", textColor: "#565e69" },
      items: [{ question: "Is Sarajevo safe for luxury travelers?", answer: "Extremely safe, welcoming, and rich in warm hospitality." }],
    },
    cta: {
      title: "Plan Your Sarajevo Experience",
      subtitle: "Tailor-made historical and cultural itineraries with MIRA.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Sarajevo Canton & Baščaršija | MIRA Travel",
        description: "Private guided tours of Sarajevo, Trebević, and Baščaršija.",
        keywords: ["Sarajevo", "Bascarsija", "Trebevic"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/bosnia-and-herzegovina/sarajevo-canton",
      },
    },
  },

  // Montenegro Regions
  {
    name: "Bay of Kotor",
    slug: "bay-of-kotor",
    countrySlug: "montenegro",
    type: "REGION" as const,
    hero: {
      label: { value: "MONTENEGRO / BAY OF KOTOR", textColor: "#af6348", textOpacity: 1 },
      title: { value: "The Fjord of the Adriatic & Bay of Kotor", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Venetian Palazzos, Island Sanctuaries & Mega-Yacht Marinas", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Immerse yourself in UNESCO-listed medieval stone towns, Our Lady of the Rocks islet, and luxury living in Porto Montenegro.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/kotor-bay.jpg", alt: "Bay of Kotor", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF KOTOR BAY", textColor: "#af6348" },
      title: { value: "Where Mountains Drop Vertiginously into the Sea", textColor: "#182d09" },
      paragraphs: {
        value: "The Bay of Kotor is Europe's southernmost fjord, featuring maritime Captain palaces in Perast and winding medieval alleyways in Kotor.",
        textColor: "#565e69",
      },
      quote: { value: "“At the birth of our planet, the most beautiful encounter between land and sea occurred.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Kotor Bay", textColor: "#182d09" },
      description: { value: "Coastal gems and historic sea fortresses.", textColor: "#565e69" },
      items: ["Kotor Old Town Fortress", "Our Lady of the Rocks", "Perast Captain Palaces", "Porto Montenegro Tivat"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Kotor", textColor: "#182d09" },
      description: { value: "Private yacht cruises to Mamula Island and clifftop fortress dinners.", textColor: "#565e69" },
      items: [
        {
          id: "kotor-1",
          title: { value: "Private Yacht Sunset Cruise of Kotor Bay", textColor: "#182d09" },
          description: { value: "Savor local Vranac wine while cruising past Perast's dual islands.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/montenegro", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Bay of Kotor Insights", textColor: "#182d09" },
      description: { value: "Practical guidance for luxury yachting.", textColor: "#565e69" },
      items: [{ question: "Best way to explore the bay?", answer: "By private luxury speedboat or motor yacht." }],
    },
    cta: {
      title: "Plan Your Kotor Bay Escape",
      subtitle: "Custom maritime and historic coastal itineraries.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Bay of Kotor & Perast Luxury Travel | MIRA",
        description: "Bespoke tours, private yacht charters, and luxury stays in Kotor Bay.",
        keywords: ["Bay of Kotor", "Perast", "Tivat", "Porto Montenegro"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/montenegro/bay-of-kotor",
      },
    },
  },
  {
    name: "Durmitor National Park",
    slug: "durmitor",
    countrySlug: "montenegro",
    type: "REGION" as const,
    hero: {
      label: { value: "MONTENEGRO / DURMITOR", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Durmitor Alpine Plateau & Tara Canyon", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Glacial Lakes, Deepest Canyons & Alpine Wilderness", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Explore the UNESCO-listed Tara River Canyon — the deepest gorge in Europe — and the emerald waters of Black Lake.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/monte.jpg", alt: "Durmitor National Park", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF DURMITOR", textColor: "#af6348" },
      title: { value: "Dramatic Gorges & Glacial Mountain Eyes", textColor: "#182d09" },
      paragraphs: {
        value: "Durmitor offers 18 glacial lakes known as 'Mountain Eyes', high alpine passes reaching 2,500m, and wild river rafting along the Tara.",
        textColor: "#565e69",
      },
      quote: { value: "“Where mountains touch the sky in silent grandeur.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Durmitor", textColor: "#182d09" },
      description: { value: "Glacial wonders and canyon bridges.", textColor: "#565e69" },
      items: ["Tara River Canyon", "Djurdjevica Bridge", "Black Lake (Crno Jezero)", "Žabljak Alpine Resort"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Durmitor", textColor: "#182d09" },
      description: { value: "Private helicopter scenic flights over Tara Canyon and luxury glamping.", textColor: "#565e69" },
      items: [
        {
          id: "durm-1",
          title: { value: "Tara Canyon Private River Rafting Expedition", textColor: "#182d09" },
          description: { value: "Navigate pristine white-water gorges with expert expedition leads.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/montenegro", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Durmitor Travel Insights", textColor: "#182d09" },
      description: { value: "Practical guidance for mountain visitors.", textColor: "#565e69" },
      items: [{ question: "Is Durmitor suitable for non-hikers?", answer: "Yes, panoramic drives over the Sedlo Pass offer breathtaking views without strenuous hiking." }],
    },
    cta: {
      title: "Plan Your Durmitor Adventure",
      subtitle: "Tailor-made alpine wilderness journeys.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Durmitor National Park & Tara Canyon | MIRA",
        description: "Explore Durmitor, Tara Canyon rafting, and Black Lake with MIRA Travel.",
        keywords: ["Durmitor", "Tara Canyon", "Zabljak"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/montenegro/durmitor",
      },
    },
  },

  // North Macedonia Regions
  {
    name: "Lake Ohrid Region",
    slug: "lake-ohrid",
    countrySlug: "north-macedonia",
    type: "REGION" as const,
    hero: {
      label: { value: "NORTH MACEDONIA / LAKE OHRID", textColor: "#af6348", textOpacity: 1 },
      title: { value: "UNESCO Lake Ohrid & Saint Naum", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Oldest Lake in Europe, Cliffside Churches & Pearl Craft", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Discover 365 ancient churches, Saint John at Kaneo hovering above azure waters, and natural freshwater springs.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/north.jpg", alt: "Lake Ohrid", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF OHRID", textColor: "#af6348" },
      title: { value: "Living Cradle of Slavic Culture", textColor: "#182d09" },
      paragraphs: {
        value: "Lake Ohrid is a rare dual UNESCO site recognized for both outstanding natural beauty and historical heritage dating back over 3 million years.",
        textColor: "#565e69",
      },
      quote: { value: "“A glass mirror reflecting centuries of light.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Ohrid", textColor: "#182d09" },
      description: { value: "Spiritual sanctuaries and natural springs.", textColor: "#565e69" },
      items: ["Church of Saint John at Kaneo", "Monastery of Saint Naum", "Samuel's Fortress", "Bay of Bones Museum"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Ohrid", textColor: "#182d09" },
      description: { value: "Private wooden boat tours to Saint Naum springs and Talevi family pearl masterclass.", textColor: "#565e69" },
      items: [
        {
          id: "ohrid-1",
          title: { value: "Authentic Ohrid Pearl Private Workshop", textColor: "#182d09" },
          description: { value: "Learn the secret family recipe of pearl craft made from Plasica fish scales.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/north-macedonia", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Lake Ohrid Insights", textColor: "#182d09" },
      description: { value: "Practical guidance for visitors.", textColor: "#565e69" },
      items: [{ question: "Is Lake Ohrid suitable for swimming?", answer: "Yes, its crystal clear waters are delightfully warm and pristine during summer." }],
    },
    cta: {
      title: "Plan Your Ohrid Retreat",
      subtitle: "Tailor-made lakeside and spiritual journeys.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Lake Ohrid & Saint Naum Travel Guide | MIRA",
        description: "Explore UNESCO Lake Ohrid, Ohrid pearls, and Saint Naum with MIRA Travel.",
        keywords: ["Lake Ohrid", "Ohrid", "Saint Naum"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/north-macedonia/lake-ohrid",
      },
    },
  },
  {
    name: "Skopje & Matka Region",
    slug: "skopje-matka",
    countrySlug: "north-macedonia",
    type: "REGION" as const,
    hero: {
      label: { value: "NORTH MACEDONIA / SKOPJE", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Skopje Valley & Matka Canyon", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Grand Monuments, Ottoman Bazaars & Dramatic Gorges", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Walk the Stone Bridge over the Vardar River, explore Old Bazaar coffee shops, and kayak inside Vrelo Cave in Matka Canyon.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/des1.jpg", alt: "Skopje & Matka", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF SKOPJE", textColor: "#af6348" },
      title: { value: "An Eccentric Fusion of Epochs", textColor: "#182d09" },
      paragraphs: {
        value: "Skopje is a city of intriguing contrasts — from ancient Byzantine fortresses to bold neo-classical architecture and serene nature just 20 minutes away.",
        textColor: "#565e69",
      },
      quote: { value: "“Where river currents connect empires.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Skopje", textColor: "#182d09" },
      description: { value: "Architectural monuments and canyon caves.", textColor: "#565e69" },
      items: ["Matka Canyon", "Vrelo Cave", "Skopje Old Bazaar", "Kale Fortress"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Skopje", textColor: "#182d09" },
      description: { value: "Private boat excursion inside Vrelo underwater cave and Macedonian wine tasting.", textColor: "#565e69" },
      items: [
        {
          id: "skop-1",
          title: { value: "Matka Canyon Private Boat & Cave Tour", textColor: "#182d09" },
          description: { value: "Navigate sheer vertical limestone cliffs to deep underground spring caves.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/north-macedonia", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Skopje Travel Insights", textColor: "#182d09" },
      description: { value: "Travel recommendations.", textColor: "#565e69" },
      items: [{ question: "How far is Matka Canyon from Skopje?", answer: "Just 15 kilometers (a 25-minute private drive)." }],
    },
    cta: {
      title: "Plan Your Skopje Journey",
      subtitle: "Custom city and canyon exploration with MIRA.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Skopje & Matka Canyon | MIRA Travel",
        description: "Bespoke tours in Skopje and Matka Canyon.",
        keywords: ["Skopje", "Matka Canyon", "Vrelo Cave"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/north-macedonia/skopje-matka",
      },
    },
  },

  // Kosovo Regions
  {
    name: "Prizren Region",
    slug: "prizren-region",
    countrySlug: "kosovo",
    type: "REGION" as const,
    hero: {
      label: { value: "KOSOVO / PRIZREN", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Prizren Citadel & Rugova Gorge", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Cultural Capital, Ottoman Stone Bridges & Filigree Craft", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Walk the stone bridge over the Bistrica River, climb to Prizren Citadel for sunset, and journey into Rugova Canyon.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/kosvo.jpg", alt: "Prizren Region", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF PRIZREN", textColor: "#af6348" },
      title: { value: "The Cultural Jewel of Kosovo", textColor: "#182d09" },
      paragraphs: {
        value: "Prizren is famous for its silver filigree craft masters, vibrant Shadervan square, and rich annual film festivals.",
        textColor: "#565e69",
      },
      quote: { value: "“Where silver wire spins centuries of art.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Prizren", textColor: "#182d09" },
      description: { value: "Historic citadels and mountain passes.", textColor: "#565e69" },
      items: ["Prizren Citadel (Kalaja)", "Sinan Pasha Mosque", "Shadervan Square", "Rugova Gorge"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Prizren", textColor: "#182d09" },
      description: { value: "Private silver filigree workshop with master artisans and citadel sunset receptions.", textColor: "#565e69" },
      items: [
        {
          id: "priz-1",
          title: { value: "Prizren Silver Filigree Master Atelier Visit", textColor: "#182d09" },
          description: { value: "Watch master silver craftsmen bend delicate silver threads into exquisite jewelry.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/kosovo", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Prizren Travel Insights", textColor: "#182d09" },
      description: { value: "Practical guidance.", textColor: "#565e69" },
      items: [{ question: "Is Prizren easy to walk?", answer: "Yes, the historic center is compact and pedestrian friendly." }],
    },
    cta: {
      title: "Plan Your Prizren Journey",
      subtitle: "Custom cultural tours with MIRA.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Prizren Region & Rugova Gorge | MIRA Travel",
        description: "Bespoke travel in Prizren, Kosovo.",
        keywords: ["Prizren", "Rugova Gorge", "Kosovo"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/kosovo/prizren-region",
      },
    },
  },

  // Slovenia Regions
  {
    name: "Julian Alps",
    slug: "julian-alps",
    countrySlug: "slovenia",
    type: "REGION" as const,
    hero: {
      label: { value: "SLOVENIA / JULIAN ALPS", textColor: "#af6348", textOpacity: 1 },
      title: { value: "The Julian Alps & Lake Bled", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Fairytale Island Monasteries, Soča River & Triglav Peaks", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Ring the wishing bell on Lake Bled Island, row traditional pletna boats, and marvel at the emerald green Soča River.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/balkan1.jpg", alt: "Julian Alps", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF JULIAN ALPS", textColor: "#af6348" },
      title: { value: "Alpine Serenity & Emerald Waterways", textColor: "#182d09" },
      paragraphs: {
        value: "The Julian Alps are Slovenia's outdoor paradise, home to Mt. Triglav, serene Lake Bohinj, and World War I historic alpine pass trails.",
        textColor: "#565e69",
      },
      quote: { value: "“A landscape painted with emerald water and limestone peaks.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Julian Alps", textColor: "#182d09" },
      description: { value: "Iconic lakes and mountain valleys.", textColor: "#565e69" },
      items: ["Lake Bled Island", "Lake Bohinj", "Soča River Valley", "Vršič Pass"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Julian Alps", textColor: "#182d09" },
      description: { value: "Private Pletna boat charter to Bled Island and Bled Cream Cake tasting.", textColor: "#565e69" },
      items: [
        {
          id: "julian-1",
          title: { value: "Private Pletna Boat Ride to Lake Bled Island", textColor: "#182d09" },
          description: { value: "Row quietly across mirror-like waters with your private boatman.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/slovenia", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Julian Alps Insights", textColor: "#182d09" },
      description: { value: "Practical guidance.", textColor: "#565e69" },
      items: [{ question: "Best time for Lake Bled?", answer: "May to October for boating, swimming, and clear mountain vistas." }],
    },
    cta: {
      title: "Plan Your Julian Alps Journey",
      subtitle: "Bespoke Slovenian mountain retreats.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Julian Alps & Lake Bled | MIRA Travel",
        description: "Explore Lake Bled, Lake Bohinj, and Soča Valley with MIRA Travel.",
        keywords: ["Julian Alps", "Lake Bled", "Soca Valley"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/slovenia/julian-alps",
      },
    },
  },

  // Bulgaria Regions
  {
    name: "Rila & Plovdiv Region",
    slug: "rila-plovdiv",
    countrySlug: "bulgaria",
    type: "REGION" as const,
    hero: {
      label: { value: "BULGARIA / RILA & PLOVDIV", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Rila Sanctuary & Ancient Plovdiv", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Byzantine Frescoes, Roman Amphitheatres & Thracian Wines", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Explore the striped arches of Rila Monastery, hike Seven Rila Lakes, and stroll Plovdiv’s Kapana creative district.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/bulgaria.jpg", alt: "Rila & Plovdiv", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF RILA & PLOVDIV", textColor: "#af6348" },
      title: { value: "Millennia of Art, Faith & Wine", textColor: "#182d09" },
      paragraphs: {
        value: "Plovdiv is one of the oldest continuously inhabited cities in the world, perfectly paired with the spiritual sanctuary of Rila Monastery in the pine-scented mountains.",
        textColor: "#565e69",
      },
      quote: { value: "“Where Roman stones and Byzantine frescoes meet.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Rila & Plovdiv", textColor: "#182d09" },
      description: { value: "Cultural and mountain highlights.", textColor: "#565e69" },
      items: ["UNESCO Rila Monastery", "Ancient Plovdiv Roman Stadium", "Kapana Arts District", "Seven Rila Lakes"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences", textColor: "#182d09" },
      description: { value: "Private historian guided tour of Rila Monastery and Thracian wine tasting.", textColor: "#565e69" },
      items: [
        {
          id: "rila-1",
          title: { value: "Rila Monastery VIP Historian Tour", textColor: "#182d09" },
          description: { value: "Exclusive access to monastic library collections and fresco galleries.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/bulgaria", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Rila & Plovdiv Insights", textColor: "#182d09" },
      description: { value: "Practical guidance.", textColor: "#565e69" },
      items: [{ question: "How far is Rila Monastery from Sofia?", answer: "Approximately 1 hour 45 minutes by private transfer." }],
    },
    cta: {
      title: "Plan Your Bulgarian Journey",
      subtitle: "Bespoke cultural & mountain itineraries.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Rila Monastery & Plovdiv | MIRA Travel",
        description: "Bespoke tours of Rila Monastery and Plovdiv.",
        keywords: ["Rila Monastery", "Plovdiv", "Bulgaria"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/bulgaria/rila-plovdiv",
      },
    },
  },

  // Greece Regions
  {
    name: "Meteora & Epirus Region",
    slug: "meteora-epirus",
    countrySlug: "greece",
    type: "REGION" as const,
    hero: {
      label: { value: "GREECE / METEORA & EPIRUS", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Suspended Monasteries of Meteora", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Sacred Stone Monoliths, Vikos Gorge & Zagori Stone Hamlets", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Marvel at 14th-century Byzantine monasteries perched atop colossal rock pillars and hike the deepest canyon gorge in the world.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/greece.jpg", alt: "Meteora & Epirus", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF METEORA", textColor: "#af6348" },
      title: { value: "Where Earth & Heaven Intersect", textColor: "#182d09" },
      paragraphs: {
        value: "Meteora means 'suspended in mid-air', offering one of the most astonishing spiritual landscapes in Western civilization.",
        textColor: "#565e69",
      },
      quote: { value: "“Stone pillars touching the sky, built on faith alone.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Meteora & Epirus", textColor: "#182d09" },
      description: { value: "Sacred rocks and deep canyons.", textColor: "#565e69" },
      items: ["Great Meteoron Monastery", "Varlaam Monastery", "Vikos Gorge Trail", "Stone Bridges of Zagori"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Meteora", textColor: "#182d09" },
      description: { value: "Private sunset monastery viewing and Zagori stone village culinary trail.", textColor: "#565e69" },
      items: [
        {
          id: "met-1",
          title: { value: "Meteora Private Golden Hour Sunset Tour", textColor: "#182d09" },
          description: { value: "Watch the golden sun glow across suspended clifftop monasteries.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/greece", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Meteora Travel Insights", textColor: "#182d09" },
      description: { value: "Practical guidance.", textColor: "#565e69" },
      items: [{ question: "Dress code for Meteora Monasteries?", answer: "Modest attire covering shoulders and knees is strictly requested." }],
    },
    cta: {
      title: "Plan Your Meteora Escape",
      subtitle: "Bespoke spiritual and mountain journeys in Greece.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Meteora Monasteries & Zagori | MIRA Travel",
        description: "Bespoke private travel in Meteora and Zagori, Greece.",
        keywords: ["Meteora", "Zagori", "Vikos Gorge"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/greece/meteora-epirus",
      },
    },
  },

  // Croatia Regions
  {
    name: "Dalmatian Coast",
    slug: "dalmatian-coast",
    countrySlug: "croatia",
    type: "REGION" as const,
    hero: {
      label: { value: "CROATIA / DALMATIAN COAST", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Dubrovnik & Dalmatian Archipelago", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Walled Cities, Island Paradises & Roman Palaces", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Cruise from the ancient limestone walls of Dubrovnik to Diocletian’s Palace in Split and lavender fields in Hvar.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        { label: "Plan Your Journey", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: { url: "/images/croatia.jpg", alt: "Dalmatian Coast", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" },
      },
    },
    essence: {
      label: { value: "THE ESSENCE OF DALMATIA", textColor: "#af6348" },
      title: { value: "Where History Meets Azure Waters", textColor: "#182d09" },
      paragraphs: {
        value: "The Dalmatian Coast is Europe's premier island hopping destination, filled with centuries of maritime glory, Venetian fortresses, and crystal clear coves.",
        textColor: "#565e69",
      },
      quote: { value: "“The Pearl of the Adriatic in all its splendor.”", textColor: "#182d09" },
      backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } },
    },
    highlights: {
      label: { value: "REGIONAL HIGHLIGHTS", textColor: "#af6348" },
      title: { value: "Key Places in Dalmatia", textColor: "#182d09" },
      description: { value: "Walled citadels and islands.", textColor: "#565e69" },
      items: ["Dubrovnik Old Town Walls", "Split Diocletian Palace", "Hvar Island Town", "Korčula Island"],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    signatureExperiences: {
      label: { value: "SIGNATURE EXPERIENCES", textColor: "#af6348" },
      title: { value: "Curated Experiences in Dalmatia", textColor: "#182d09" },
      description: { value: "Private yacht charter across Pakleni Islands and exclusive city wall walks.", textColor: "#565e69" },
      items: [
        {
          id: "dal-1",
          title: { value: "Dubrovnik City Walls Private After-Hours Walk", textColor: "#182d09" },
          description: { value: "Stroll the ancient ramparts without crowds at golden hour.", textColor: "#565e69" },
          buttons: [{ label: "View Experience", url: "/destinations/croatia", variant: "link", textColor: "#af6348" }],
        },
      ],
      backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } },
    },
    faq: {
      label: { value: "FREQUENTLY ASKED QUESTIONS", textColor: "#af6348" },
      title: { value: "Dalmatian Coast Insights", textColor: "#182d09" },
      description: { value: "Practical travel tips.", textColor: "#565e69" },
      items: [{ question: "Best way to move between Dubrovnik and Hvar?", answer: "By private high-speed catamaran or luxury yacht charter." }],
    },
    cta: {
      title: "Plan Your Dalmatian Journey",
      subtitle: "Custom luxury coastal itineraries with MIRA.",
      buttonLabel: "Curate My Journey",
      buttonUrl: "/plan-your-journey",
      backgroundMultimedia: { show: "color", color: { color: "#182d09" } },
    },
    metadata: {
      seo: {
        title: "Dalmatian Coast & Dubrovnik | MIRA Travel",
        description: "Explore Dubrovnik, Split, and Hvar with MIRA Travel.",
        keywords: ["Dalmatian Coast", "Dubrovnik", "Split", "Hvar"],
        robots: { index: true, follow: true },
        canonicalUrl: "/destinations/croatia/dalmatian-coast",
      },
    },
  },
]

export const placeSeedData = [
  // Northern Albania Places
  {
    name: "Theth",
    slug: "theth",
    regionSlug: "north-albania",
    type: "PLACE" as const,
    hero: {
      label: { value: "NORTHERN ALBANIA / THETH", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Discover Theth Valley", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Alpine Isolation, Lock-In Towers & Grunas Waterfall", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "A mountain paradise nestled in the heart of the Accursed Mountains.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/therch.jpg", alt: "Theth", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF THETH", textColor: "#af6348" }, title: { value: "The Alpine Gem of Albania", textColor: "#182d09" }, paragraphs: { value: "Famed for its stone Lock-In Tower (Kulla e Ngujimit) and crystal Blue Eye spring.", textColor: "#565e69" }, quote: { value: "“A sanctuary shrouded in alpine peace.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Places in Theth", textColor: "#182d09" }, description: { value: "Top natural marvels.", textColor: "#565e69" }, items: ["Grunas Waterfall", "Theth Blue Eye", "Lock-In Tower", "Church of Theth"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Private Excursions in Theth", textColor: "#182d09" }, description: { value: "Guided hikes to Blue Eye spring.", textColor: "#565e69" }, items: [{ id: "th-1", title: { value: "Theth Blue Eye Private Guided Trek", textColor: "#182d09" }, description: { value: "Hike past natural stone bridges to the ice-blue spring.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Theth Travel Tips", textColor: "#182d09" }, description: { value: "Practical guidance.", textColor: "#565e69" }, items: [{ question: "How to reach Theth?", answer: "A paved scenic mountain road connects Shkodër to Theth." }] },
    cta: { title: "Explore Theth Valley", subtitle: "Private luxury mountain stays with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Theth Valley Travel Guide | MIRA", description: "Discover Theth Valley in Northern Albania.", keywords: ["Theth", "Theth Blue Eye", "Grunas Waterfall"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/north-albania/theth" } },
  },
  {
    name: "Valbona",
    slug: "valbona",
    regionSlug: "north-albania",
    type: "PLACE" as const,
    hero: {
      label: { value: "NORTHERN ALBANIA / VALBONA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Valbona Valley National Park", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Glacial River Valleys & High Alpine Peaks", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Untamed alpine wilderness with turquoise river waters.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/therch.jpg", alt: "Valbona", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF VALBONA", textColor: "#af6348" }, title: { value: "The Crown of the Accursed Mountains", textColor: "#182d09" }, paragraphs: { value: "High altitude pine forests and traditional mountain guesthouses.", textColor: "#565e69" }, quote: { value: "“Where river stones gleam like silver.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Key Spots in Valbona", textColor: "#182d09" }, description: { value: "Alpine trails.", textColor: "#565e69" }, items: ["Valbona River", "Rragam Village", "Valbona Pass Trail"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Excursions in Valbona", textColor: "#182d09" }, description: { value: "High mountain meadow treks.", textColor: "#565e69" }, items: [{ id: "val-1", title: { value: "Valbona Pass Trail", textColor: "#182d09" }, description: { value: "Cross the alpine ridge connecting Valbona to Theth.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Valbona Tips", textColor: "#182d09" }, description: { value: "Advice for visitors.", textColor: "#565e69" }, items: [{ question: "Best hiking season?", answer: "June to October." }] },
    cta: { title: "Explore Valbona", subtitle: "Tailor-made alpine journeys.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Valbona Valley Guide | MIRA", description: "Explore Valbona National Park.", keywords: ["Valbona", "Accursed Mountains"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/north-albania/valbona" } },
  },
  {
    name: "Shkodër",
    slug: "shkoder",
    regionSlug: "north-albania",
    type: "PLACE" as const,
    hero: {
      label: { value: "NORTHERN ALBANIA / SHKODËR", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Shkodër & Rozafa Castle", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Cultural Gateway to the North & Lake Shkodër", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Ancient Illyrian fortress overlooking three converging rivers and Lake Shkodër.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/albania.png", alt: "Shkodër", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF SHKODËR", textColor: "#af6348" }, title: { value: "The Cradle of Northern Culture", textColor: "#182d09" }, paragraphs: { value: "Bicycle-friendly streets, historic Marubi National Photography Museum, and vibrant pedestrian promenades.", textColor: "#565e69" }, quote: { value: "“Where three rivers whisper Illyrian legends.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Key Places in Shkodër", textColor: "#182d09" }, description: { value: "Historical sights.", textColor: "#565e69" }, items: ["Rozafa Castle", "Marubi Photography Museum", "Pedonalja Promenade", "Lead Mosque"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Experiences in Shkodër", textColor: "#182d09" }, description: { value: "Private fortress tours.", textColor: "#565e69" }, items: [{ id: "shk-1", title: { value: "Rozafa Castle Sunset Private Tour", textColor: "#182d09" }, description: { value: "Panoramic views over Lake Shkodër and Buna River.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Shkodër Travel Tips", textColor: "#182d09" }, description: { value: "Practical guidance.", textColor: "#565e69" }, items: [{ question: "Is Shkodër safe?", answer: "Very safe and friendly city." }] },
    cta: { title: "Discover Shkodër", subtitle: "Cultural city tours with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Shkodër & Rozafa Castle Guide | MIRA", description: "Bespoke travel in Shkodër.", keywords: ["Shkoder", "Rozafa Castle"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/north-albania/shkoder" } },
  },
  {
    name: "Lake Koman",
    slug: "lake-koman",
    regionSlug: "north-albania",
    type: "PLACE" as const,
    hero: {
      label: { value: "NORTHERN ALBANIA / LAKE KOMAN", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Lake Koman Fjord Ferry", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Emerald Waters & Vertical Limestone Gorges", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "One of the world's most spectacular river ferry boat journeys.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/albania-journey1.jpg", alt: "Lake Koman", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF KOMAN", textColor: "#af6348" }, title: { value: "The Norwegian Fjord of the Balkans", textColor: "#182d09" }, paragraphs: { value: "Crystal green waters winding through 1,000m sheer limestone cliffs.", textColor: "#565e69" }, quote: { value: "“A boat voyage into pure majesty.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Highlights of Koman", textColor: "#182d09" }, description: { value: "Boat routes.", textColor: "#565e69" }, items: ["Shala River (Albanian Thailand)", "Peace Island", "Limestone Canyon"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Private Boat Cruises", textColor: "#182d09" }, description: { value: "Private wooden boat to Shala River.", textColor: "#565e69" }, items: [{ id: "kom-1", title: { value: "Shala River Private Excursion", textColor: "#182d09" }, description: { value: "Swim in pristine turquoise spring waters.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Koman Ferry Tips", textColor: "#182d09" }, description: { value: "Practical guidance.", textColor: "#565e69" }, items: [{ question: "Duration of ferry ride?", answer: "Approximately 2.5 hours." }] },
    cta: { title: "Explore Lake Koman", subtitle: "Private boat charters with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Lake Koman Ferry Guide | MIRA", description: "Private boat tours on Lake Koman.", keywords: ["Lake Koman", "Shala River"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/north-albania/lake-koman" } },
  },

  // Central Albania Places
  {
    name: "Berat",
    slug: "berat",
    regionSlug: "central-albania",
    type: "PLACE" as const,
    hero: {
      label: { value: "CENTRAL ALBANIA / BERAT", textColor: "#af6348", textOpacity: 1 },
      title: { value: "UNESCO Berat — City of a Thousand Windows", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Ottoman Architecture & Inhabited Castle Citadel", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "White Ottoman houses cascading down the Osum River valley.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/berat.jpg", alt: "Berat", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF BERAT", textColor: "#af6348" }, title: { value: "Living Ottoman Heritage", textColor: "#182d09" }, paragraphs: { value: "Explore Mangalem and Gorica quarters linked by the arched Gorica Bridge.", textColor: "#565e69" }, quote: { value: "“A living museum under open skies.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Key Places in Berat", textColor: "#182d09" }, description: { value: "Historic architecture.", textColor: "#565e69" }, items: ["Berat Castle", "Onufri Iconographic Museum", "Gorica Bridge", "Mangalem Quarter"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Private Experiences in Berat", textColor: "#182d09" }, description: { value: "Wine tasting at Nuremberg-trained Cobo Winery.", textColor: "#565e69" }, items: [{ id: "ber-1", title: { value: "Çobo Winery Private Tasting", textColor: "#182d09" }, description: { value: "Sample rare indigenous Pulës and Shesh i Zi wines.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Berat Insights", textColor: "#182d09" }, description: { value: "Practical guidance.", textColor: "#565e69" }, items: [{ question: "Is Berat Castle inhabited?", answer: "Yes, families still live inside the fortress walls today." }] },
    cta: { title: "Explore Berat", subtitle: "Private heritage itineraries with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "UNESCO Berat Travel Guide | MIRA", description: "Bespoke private tours in Berat.", keywords: ["Berat", "Berat Castle"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/central-albania/berat" } },
  },
  {
    name: "Tirana",
    slug: "tirana",
    regionSlug: "central-albania",
    type: "PLACE" as const,
    hero: {
      label: { value: "CENTRAL ALBANIA / TIRANA", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Vibrant Tirana Capital", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Colourful Facades, BunkArt Museums & Skanderbeg Square", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Albania’s energetic capital transformed into a hub of art, cafe culture, and design.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/tirana.jpg", alt: "Tirana", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF TIRANA", textColor: "#af6348" }, title: { value: "A Metropolis Reborn in Colour", textColor: "#182d09" }, paragraphs: { value: "Discover BunkArt 1 & 2 underground bunker museums and Dajti Express cable car views.", textColor: "#565e69" }, quote: { value: "“Where past shadows transform into vibrant art.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Key Places in Tirana", textColor: "#182d09" }, description: { value: "Urban attractions.", textColor: "#565e69" }, items: ["Skanderbeg Square", "BunkArt 2", "Blloku District", "Dajti Express Cable Car"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Tirana VIP Tours", textColor: "#182d09" }, description: { value: "Architectural walking tour.", textColor: "#565e69" }, items: [{ id: "tir-1", title: { value: "Tirana Blloku & Modern Art VIP Walk", textColor: "#182d09" }, description: { value: "Private guide through former communist high-ranking residential zone.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Tirana Tips", textColor: "#182d09" }, description: { value: "Practical advice.", textColor: "#565e69" }, items: [{ question: "Is Tirana walkable?", answer: "Yes, the center around Skanderbeg Square is very pedestrian friendly." }] },
    cta: { title: "Discover Tirana", subtitle: "Tailor-made urban travel with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Tirana Travel Guide | MIRA", description: "Explore Tirana with MIRA Travel.", keywords: ["Tirana", "BunkArt", "Blloku"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/central-albania/tirana" } },
  },

  // Southern Albania Places
  {
    name: "Gjirokastër",
    slug: "gjirokaster",
    regionSlug: "south-albania",
    type: "PLACE" as const,
    hero: {
      label: { value: "SOUTHERN ALBANIA / GJIROKASTËR", textColor: "#af6348", textOpacity: 1 },
      title: { value: "UNESCO Gjirokastër — City of Stone", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Ottoman Stone Tower Houses & Grand Citadel Fortress", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Cobblestone alleys and slate-roofed Ottoman mansions climbing steep mountain slopes.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/gjirokaster.jpg", alt: "Gjirokastër", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF GJIROKASTËR", textColor: "#af6348" }, title: { value: "The Stone Slate Fortress City", textColor: "#182d09" }, paragraphs: { value: "Home to Ismail Kadare and Enver Hoxha, featuring Zekate House and Gjirokastër Fortress.", textColor: "#565e69" }, quote: { value: "“A stone castle rising like a mountain crown.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Places in Gjirokastër", textColor: "#182d09" }, description: { value: "Historic architecture.", textColor: "#565e69" }, items: ["Gjirokastër Fortress", "Zekate House", "Skenduli House", "Old Bazaar"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Private Mansion Tours", textColor: "#182d09" }, description: { value: "Private Ottoman tower house tours.", textColor: "#565e69" }, items: [{ id: "gji-1", title: { value: "Skenduli House Private Curator Tour", textColor: "#182d09" }, description: { value: "Explore 300-year-old preserved Ottoman rooms.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Gjirokastër Tips", textColor: "#182d09" }, description: { value: "Advice.", textColor: "#565e69" }, items: [{ question: "Comfortable shoes recommended?", answer: "Yes, cobblestone streets are steep." }] },
    cta: { title: "Explore Gjirokastër", subtitle: "Private luxury stone city tours.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Gjirokastër Travel Guide | MIRA", description: "Bespoke tours in Gjirokastër.", keywords: ["Gjirokaster", "City of Stone"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/south-albania/gjirokaster" } },
  },

  // Albanian Riviera Places
  {
    name: "Dhërmi",
    slug: "dhermi",
    regionSlug: "albanian-riviera",
    type: "PLACE" as const,
    hero: {
      label: { value: "ALBANIAN RIVIERA / DHËRMI", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Dhërmi Beach & Clifftop Village", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Turquoise Ionian Waters & Boutique Coastal Luxury", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "White pebble beaches and whitewashed clifftop Orthodox churches.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/alabian-riveria.png", alt: "Dhërmi", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF DHËRMI", textColor: "#af6348" }, title: { value: "The Riviera's Luxury Sanctuary", textColor: "#182d09" }, paragraphs: { value: "Pristine sea clarity, fine dining seafood tavernas, and secret cove access.", textColor: "#565e69" }, quote: { value: "“Where azure sea meets olive-covered cliffs.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Places in Dhërmi", textColor: "#182d09" }, description: { value: "Coastal gems.", textColor: "#565e69" }, items: ["Dhërmi Drymades Beach", "Old Dhërmi Village", "Monastery of Saint Mary"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Private Boat Charters", textColor: "#182d09" }, description: { value: "Speedboat tours to Gjipe Beach.", textColor: "#565e69" }, items: [{ id: "dhe-1", title: { value: "Gjipe Canyon & Secret Beach Boat Excursion", textColor: "#182d09" }, description: { value: "Sail past dramatic coastal canyon walls to secluded coves.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/albania", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Dhërmi Tips", textColor: "#182d09" }, description: { value: "Advice.", textColor: "#565e69" }, items: [{ question: "Best beach months?", answer: "June through September." }] },
    cta: { title: "Plan Your Dhërmi Stay", subtitle: "Bespoke beachfront villas with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Dhërmi Beach & Village Guide | MIRA", description: "Luxury travel in Dhërmi, Albania.", keywords: ["Dhermi", "Albanian Riviera"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/albanian-riviera/dhermi" } },
  },

  // Herzegovina Places
  {
    name: "Mostar",
    slug: "mostar",
    regionSlug: "herzegovina",
    type: "PLACE" as const,
    hero: {
      label: { value: "HERZEGOVINA / MOSTAR", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Mostar & Stari Most Old Bridge", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "UNESCO Ottoman Bridge & Emerald Neretva River", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "The legendary 16th-century arch bridge spanning the emerald Neretva.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/mostar-culture.jpg", alt: "Mostar", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF MOSTAR", textColor: "#af6348" }, title: { value: "Iconic Arch of Harmony", textColor: "#182d09" }, paragraphs: { value: "Watch local bridge divers leap into cold river waters and stroll Kujundžiluk bazaar.", textColor: "#565e69" }, quote: { value: "“An architectural masterpiece uniting cultures.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Key Places in Mostar", textColor: "#182d09" }, description: { value: "Historic sights.", textColor: "#565e69" }, items: ["Stari Most (Old Bridge)", "Kujundžiluk Bazaar", "Koski Mehmed Pasha Mosque", "Crooked Bridge"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "VIP Mostar Tours", textColor: "#182d09" }, description: { value: "Private bridge viewing experience.", textColor: "#565e69" }, items: [{ id: "mos-1", title: { value: "Stari Most Diver Lounge Experience", textColor: "#182d09" }, description: { value: "Private terrace seating with traditional coffee & bridge diving show.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/bosnia-and-herzegovina", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Mostar Insights", textColor: "#182d09" }, description: { value: "Advice.", textColor: "#565e69" }, items: [{ question: "When do bridge divers jump?", answer: "Throughout warm afternoon hours during summer." }] },
    cta: { title: "Explore Mostar", subtitle: "Private luxury tours with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Mostar Travel Guide | MIRA", description: "Bespoke travel in Mostar, Bosnia.", keywords: ["Mostar", "Stari Most"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/bosnia-and-herzegovina/herzegovina/mostar" } },
  },

  // Bay of Kotor Places
  {
    name: "Kotor",
    slug: "kotor",
    regionSlug: "bay-of-kotor",
    type: "PLACE" as const,
    hero: {
      label: { value: "BAY OF KOTOR / KOTOR OLD TOWN", textColor: "#af6348", textOpacity: 1 },
      title: { value: "UNESCO Kotor Medieval Fortress", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Venetian City Walls, Palazzos & San Giovanni Fortress", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Cobblestone squares, medieval churches, and 1,350 steps to San Giovanni fortress.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/kotor-bay.jpg", alt: "Kotor", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF KOTOR", textColor: "#af6348" }, title: { value: "Venetian Gem on the Fjord", textColor: "#182d09" }, paragraphs: { value: "A maze of historic squares, cathedrals, and dramatic fjord mountain reflections.", textColor: "#565e69" }, quote: { value: "“Where stone walls guard centuries of sea history.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Key Places in Kotor", textColor: "#182d09" }, description: { value: "Venetian heritage.", textColor: "#565e69" }, items: ["Saint Tryphon Cathedral", "San Giovanni Fortress", "Square of the Arms", "Kotor City Walls"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Private Kotor Tours", textColor: "#182d09" }, description: { value: "Private fortress walks.", textColor: "#565e69" }, items: [{ id: "kot-1", title: { value: "Kotor Fortress Sunset Private Hike", textColor: "#182d09" }, description: { value: "Watch the fjord glow from San Giovanni castle ramparts.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/montenegro", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Kotor Tips", textColor: "#182d09" }, description: { value: "Advice.", textColor: "#565e69" }, items: [{ question: "Is Kotor car-free?", answer: "Yes, the old town is completely pedestrianized." }] },
    cta: { title: "Discover Kotor", subtitle: "Bespoke Montenegro itineraries with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Kotor Old Town Guide | MIRA", description: "Bespoke travel in Kotor, Montenegro.", keywords: ["Kotor", "Bay of Kotor"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/montenegro/bay-of-kotor/kotor" } },
  },

  // Julian Alps Places
  {
    name: "Lake Bled",
    slug: "lake-bled",
    regionSlug: "julian-alps",
    type: "PLACE" as const,
    hero: {
      label: { value: "JULIAN ALPS / LAKE BLED", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Lake Bled & Island Monastery", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Pletna Boats, Clifftop Castle & Wishing Bell", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Slovenia’s iconic alpine lake with an island church floating in mirror waters.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/balkan1.jpg", alt: "Lake Bled", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF BLED", textColor: "#af6348" }, title: { value: "A Storybook Alpine Wonderland", textColor: "#182d09" }, paragraphs: { value: "Row to Bled Island, climb 99 stone steps, and sample famous Kremšnita cake at Bled Castle.", textColor: "#565e69" }, quote: { value: "“A fairytale brought to life in limestone and water.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Key Places in Bled", textColor: "#182d09" }, description: { value: "Iconic alpine spots.", textColor: "#565e69" }, items: ["Bled Island Church", "Bled Castle", "Vintgar Gorge", "Ojstrica Viewpoint"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Private Excursions in Bled", textColor: "#182d09" }, description: { value: "Private Pletna boat charter.", textColor: "#565e69" }, items: [{ id: "ble-1", title: { value: "Private Pletna Sunset Charter", textColor: "#182d09" }, description: { value: "Glide across serene waters to the island church with private champagne.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/slovenia", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Lake Bled Tips", textColor: "#182d09" }, description: { value: "Advice.", textColor: "#565e69" }, items: [{ question: "Can you swim in Lake Bled?", answer: "Yes, designated bathing areas are open during summer." }] },
    cta: { title: "Explore Lake Bled", subtitle: "Tailor-made alpine journeys with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Lake Bled Travel Guide | MIRA", description: "Bespoke travel in Lake Bled, Slovenia.", keywords: ["Lake Bled", "Bled Island"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/slovenia/julian-alps/lake-bled" } },
  },

  // Dalmatian Coast Places
  {
    name: "Dubrovnik",
    slug: "dubrovnik",
    regionSlug: "dalmatian-coast",
    type: "PLACE" as const,
    hero: {
      label: { value: "DALMATIAN COAST / DUBROVNIK", textColor: "#af6348", textOpacity: 1 },
      title: { value: "UNESCO Dubrovnik — Pearl of the Adriatic", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Medieval City Walls, Stradun Promenade & Fort Lovrijenac", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Intact 16th-century stone ramparts overlooking crystal-clear Adriatic seas.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/croatia.jpg", alt: "Dubrovnik", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ESSENCE OF DUBROVNIK", textColor: "#af6348" }, title: { value: "Venetian Maritime Majesty", textColor: "#182d09" }, paragraphs: { value: "Stroll polished limestone Stradun, ride Srđ cable car, and take private boat tours to Lokrum Island.", textColor: "#565e69" }, quote: { value: "“Paradise on earth for lovers of history and sea.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "LOCAL HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Key Places in Dubrovnik", textColor: "#182d09" }, description: { value: "Historic citadels.", textColor: "#565e69" }, items: ["Dubrovnik City Walls", "Stradun", "Fort Lovrijenac", "Lokrum Island"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    signatureExperiences: { label: { value: "CURATED EXPERIENCES", textColor: "#af6348" }, title: { value: "Private Dubrovnik Tours", textColor: "#182d09" }, description: { value: "VIP after-hours city wall tours.", textColor: "#565e69" }, items: [{ id: "dub-1", title: { value: "City Walls After-Hours VIP Walk", textColor: "#182d09" }, description: { value: "Exclusive rampart access at sunset away from day crowds.", textColor: "#565e69" }, buttons: [{ label: "View Experience", url: "/destinations/croatia", variant: "link", textColor: "#af6348" }] }], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    faq: { label: { value: "FAQ", textColor: "#af6348" }, title: { value: "Dubrovnik Tips", textColor: "#182d09" }, description: { value: "Advice.", textColor: "#565e69" }, items: [{ question: "Best time to walk walls?", answer: "Early morning or late afternoon." }] },
    cta: { title: "Explore Dubrovnik", subtitle: "Private luxury Croatian journeys with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Dubrovnik Travel Guide | MIRA", description: "Bespoke travel in Dubrovnik, Croatia.", keywords: ["Dubrovnik", "City Walls"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/croatia/dalmatian-coast/dubrovnik" } },
  },
]


export async function seedLocationCountries() {
  console.log("📍 Seeding Europe Continent, Country Locations, Region Locations & Place Locations into Neon Database...")

  const regionMap = new Map<string, string>()
  const placeMap = new Map<string, string>()

  // 1. Find or create Europe Continent location
  let europeLocation = await prisma.location.findFirst({
    where: { OR: [{ slug: "europe" }, { name: "Europe" }] },
  })

  const europePayload = {
    name: "Europe",
    slug: "europe",
    type: "CONTINENT" as const,
    parentId: null,
    hero: {
      label: { value: "CONTINENT / EUROPE", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Unveil the Soul of Europe", textColor: "#FFFFFF", textOpacity: 1 },
      subtitle: { value: "Historic Wonders, Alpine Peaks & Coastal Escapes", textColor: "#E5E7EB", textOpacity: 1 },
      description: {
        value: "Explore Europe with Mira Travel. Discover bespoke luxury journeys, rich cultural landmarks, pristine nature, and curated accommodations.",
        textColor: "#F3F4F6",
        textOpacity: 1,
      },
      buttons: [
        {
          label: "Explore Journeys",
          url: "/journeys?continent=europe",
          variant: "primary",
          style: "primary",
          rounded: "full",
          backgroundColor: "#af6348",
          textColor: "#ffffff",
        },
      ],
      backgroundMultimedia: {
        show: "image",
        color: { color: "#171717", opacity: 100 },
        image: {
          url: "/images/hero-bg.jpg",
          alt: "Europe Travel",
          opacity: 100,
          overlayColor: "#000000",
          overlayOpacity: 40,
          fit: "cover",
        },
      },
    },
    metadata: {
      seo: {
        title: "Europe Travel Guide | Historic Wonders, Alpine Peaks & Coastal Escapes",
        robots: { index: true, follow: true },
        keywords: ["Europe", "Luxury Travel", "European Holidays", "Custom Itineraries", "Mira Travel"],
        description: "Explore Europe with Mira Travel. Discover bespoke luxury journeys, rich cultural landmarks, pristine nature, and curated accommodations.",
        canonicalUrl: "/destinations/europe",
      },
    },
  }

  if (europeLocation) {
    console.log(`🔄 Updating existing Europe continent location (ID: ${europeLocation.id})...`)
    europeLocation = await prisma.location.update({
      where: { id: europeLocation.id },
      data: europePayload,
    })
  } else {
    console.log("✨ Creating Europe continent location...")
    europeLocation = await prisma.location.create({
      data: europePayload,
    })
  }

  console.log(`🌍 Europe Continent ID: ${europeLocation.id}`)

  // 2. Seed all country locations with Europe as parentId
  const countryMap = new Map<string, string>()

  for (const item of countrySeedData) {
    const existing = await prisma.location.findFirst({
      where: {
        OR: [{ slug: item.slug }, { name: item.name }],
      },
    })

    const countryPayload = {
      name: item.name,
      slug: item.slug,
      type: item.type,
      parentId: europeLocation.id,
      hero: item.hero,
      essence: item.essence,
      highlights: item.highlights,
      signatureExperiences: item.signatureExperiences,
      faq: item.faq,
      cta: item.cta,
      metadata: item.metadata,
    }

    let savedCountry
    if (existing) {
      console.log(`🔄 Updating existing country location: ${item.name} (${item.slug}) with parentId Europe (${europeLocation.id})...`)
      savedCountry = await prisma.location.update({
        where: { id: existing.id },
        data: countryPayload,
      })
    } else {
      console.log(`✨ Creating new country location: ${item.name} (${item.slug}) with parentId Europe (${europeLocation.id})...`)
      savedCountry = await prisma.location.create({
        data: countryPayload,
      })
    }
    countryMap.set(item.slug, savedCountry.id)
  }

  console.log("✅ All Country Locations saved & mapped!")

  // 3. Seed all Region locations with respective Country as parentId
  for (const region of regionSeedData) {
    const parentCountryId = countryMap.get(region.countrySlug)
    if (!parentCountryId) {
      console.warn(`⚠️ Warning: Country slug '${region.countrySlug}' not found for region '${region.name}'`)
      continue
    }

    const existingRegion = await prisma.location.findFirst({
      where: {
        OR: [{ slug: region.slug }, { name: region.name }],
      },
    })

    const regionPayload = {
      name: region.name,
      slug: region.slug,
      type: region.type,
      parentId: parentCountryId,
      hero: region.hero,
      essence: region.essence,
      highlights: region.highlights,
      signatureExperiences: region.signatureExperiences,
      faq: region.faq,
      cta: region.cta,
      metadata: region.metadata,
    }

    if (existingRegion) {
      console.log(`🔄 Updating existing REGION location: ${region.name} (${region.slug}) -> parent Country ID (${parentCountryId})...`)
      const savedRegion = await prisma.location.update({
        where: { id: existingRegion.id },
        data: regionPayload,
      })
      regionMap.set(region.slug, savedRegion.id)
    } else {
      console.log(`✨ Creating new REGION location: ${region.name} (${region.slug}) -> parent Country ID (${parentCountryId})...`)
      const savedRegion = await prisma.location.create({
        data: regionPayload,
      })
      regionMap.set(region.slug, savedRegion.id)
    }
  }

  console.log("✅ All Region Locations saved & mapped!")

  // 4. Seed all Place locations with respective Region as parentId
  for (const place of placeSeedData) {
    const parentRegionId = regionMap.get(place.regionSlug)
    if (!parentRegionId) {
      console.warn(`⚠️ Warning: Region slug '${place.regionSlug}' not found for place '${place.name}'`)
      continue
    }

    const existingPlace = await prisma.location.findFirst({
      where: {
        OR: [{ slug: place.slug }, { name: place.name }],
      },
    })

    const placePayload = {
      name: place.name,
      slug: place.slug,
      type: place.type,
      parentId: parentRegionId,
      hero: place.hero,
      essence: place.essence,
      highlights: place.highlights,
      signatureExperiences: place.signatureExperiences,
      faq: place.faq,
      cta: place.cta,
      metadata: place.metadata,
    }

    let savedPlace
    if (existingPlace) {
      console.log(`🔄 Updating existing PLACE location: ${place.name} (${place.slug}) -> parent Region ID (${parentRegionId})...`)
      savedPlace = await prisma.location.update({
        where: { id: existingPlace.id },
        data: placePayload,
      })
    } else {
      console.log(`✨ Creating new PLACE location: ${place.name} (${place.slug}) -> parent Region ID (${parentRegionId})...`)
      savedPlace = await prisma.location.create({
        data: placePayload,
      })
    }
    placeMap.set(place.slug, savedPlace.id)
  }

  console.log("✅ All Place Locations saved & mapped!")

  // 5. Seed Landmark locations with respective Place as parentId
  for (const landmark of landmarkSeedData) {
    const parentPlaceId = placeMap.get(landmark.placeSlug)
    if (!parentPlaceId) {
      console.warn(`⚠️ Warning: Place slug '${landmark.placeSlug}' not found for landmark '${landmark.name}'`)
      continue
    }

    const existingLandmark = await prisma.location.findFirst({
      where: { OR: [{ slug: landmark.slug }, { name: landmark.name }] },
    })

    const landmarkPayload = {
      name: landmark.name,
      slug: landmark.slug,
      type: landmark.type,
      parentId: parentPlaceId,
      hero: landmark.hero,
      essence: landmark.essence,
      highlights: landmark.highlights,
      cta: landmark.cta,
      metadata: landmark.metadata,
    }

    if (existingLandmark) {
      console.log(`🔄 Updating existing LANDMARK location: ${landmark.name} (${landmark.slug}) -> parent Place ID (${parentPlaceId})...`)
      await prisma.location.update({
        where: { id: existingLandmark.id },
        data: landmarkPayload,
      })
    } else {
      console.log(`✨ Creating new LANDMARK location: ${landmark.name} (${landmark.slug}) -> parent Place ID (${parentPlaceId})...`)
      await prisma.location.create({
        data: landmarkPayload,
      })
    }
  }

  // 6. Seed Accommodation locations with respective Place as parentId
  for (const acc of accommodationSeedData) {
    const parentPlaceId = placeMap.get(acc.placeSlug)
    if (!parentPlaceId) {
      console.warn(`⚠️ Warning: Place slug '${acc.placeSlug}' not found for accommodation '${acc.name}'`)
      continue
    }

    const existingAcc = await prisma.location.findFirst({
      where: { OR: [{ slug: acc.slug }, { name: acc.name }] },
    })

    const accPayload = {
      name: acc.name,
      slug: acc.slug,
      type: acc.type,
      parentId: parentPlaceId,
      hero: acc.hero,
      essence: acc.essence,
      highlights: acc.highlights,
      cta: acc.cta,
      metadata: acc.metadata,
    }

    if (existingAcc) {
      console.log(`🔄 Updating existing ACCOMMODATION location: ${acc.name} (${acc.slug}) -> parent Place ID (${parentPlaceId})...`)
      await prisma.location.update({
        where: { id: existingAcc.id },
        data: accPayload,
      })
    } else {
      console.log(`✨ Creating new ACCOMMODATION location: ${acc.name} (${acc.slug}) -> parent Place ID (${parentPlaceId})...`)
      await prisma.location.create({
        data: accPayload,
      })
    }
  }

  console.log("✅ Successfully seeded Europe Continent, 9 Countries, 16 Regions, 48 Places, LANDMARKS, and ACCOMMODATIONS into Neon DB!")
}

export const landmarkSeedData = [
  {
    name: "Lock-In Tower (Kulla e Ngujimit)",
    slug: "lock-in-tower",
    placeSlug: "theth",
    type: "LANDMARK" as const,
    hero: {
      label: { value: "THETH / LANDMARK", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Theth Lock-In Tower", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Ancient Kanun Sanctuary of Peace", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "A centuries-old stone tower of refuge where mountain feuds were mediated in accordance with the Code of Lekë Dukagjini.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/therch.jpg", alt: "Lock-In Tower", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "HISTORIC SANCTUARY", textColor: "#af6348" }, title: { value: "Living Legacy of Mountain Kanun", textColor: "#182d09" }, paragraphs: { value: "Preserved stone masonry tower offering rare historical glimpses into northern Albanian tribal law.", textColor: "#565e69" }, quote: { value: "“A tower built to protect human life.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Features of the Tower", textColor: "#182d09" }, description: { value: "Architectural details.", textColor: "#565e69" }, items: ["Slit Arrow Windows", "Original Wooden Beams", "Elder Council Room"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    cta: { title: "Visit Lock-In Tower", subtitle: "Private guided historical tours with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Lock-In Tower Theth | MIRA Travel", description: "Visit the historic Lock-In Tower in Theth Valley.", keywords: ["Lock-In Tower", "Theth Kanun"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/north-albania/theth/lock-in-tower" } },
  },
  {
    name: "Berat Castle",
    slug: "berat-castle",
    placeSlug: "berat",
    type: "LANDMARK" as const,
    hero: {
      label: { value: "BERAT / LANDMARK", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Berat Inhabited Fortress", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "2,400 Years of Byzantine Citadel History", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "High atop the hill overlooking the Osum river, Berat Castle remains one of the few inhabited fortresses in Europe.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/berat.jpg", alt: "Berat Castle", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "BYZANTINE CITADEL", textColor: "#af6348" }, title: { value: "The Living Citadel", textColor: "#182d09" }, paragraphs: { value: "Contains 24 medieval stone churches and the famed Onufri Museum.", textColor: "#565e69" }, quote: { value: "“A stone city floating in the sky.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Citadel Sights", textColor: "#182d09" }, description: { value: "Key sights.", textColor: "#565e69" }, items: ["Onufri Museum", "Holy Trinity Church", "Citadel Watchtower"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    cta: { title: "Explore Berat Castle", subtitle: "Private historian tours with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Berat Castle Guide | MIRA Travel", description: "Bespoke tours of UNESCO Berat Castle.", keywords: ["Berat Castle", "Onufri Museum"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/central-albania/berat/berat-castle" } },
  },
  {
    name: "Stari Most (Old Bridge)",
    slug: "stari-most",
    placeSlug: "mostar",
    type: "LANDMARK" as const,
    hero: {
      label: { value: "MOSTAR / LANDMARK", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Stari Most Ottoman Arch Bridge", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "16th-Century Ottoman Masterpiece", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Mimar Hayruddin's graceful stone arch leaping 24 meters over the cold Neretva river.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/mostar-culture.jpg", alt: "Stari Most", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "SYMBOL OF HARMONY", textColor: "#af6348" }, title: { value: "The Arch of Mostar", textColor: "#182d09" }, paragraphs: { value: "Famous for traditional bridge divers leaping into emerald river waters.", textColor: "#565e69" }, quote: { value: "“A stone crescent frozen over emerald water.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Bridge Highlights", textColor: "#182d09" }, description: { value: "Key sights.", textColor: "#565e69" }, items: ["Tara Tower", "Halebija Tower", "Bridge Divers Club"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    cta: { title: "Visit Stari Most", subtitle: "Private VIP bridge experiences.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Stari Most Old Bridge Guide | MIRA", description: "Explore Mostar Stari Most with MIRA Travel.", keywords: ["Stari Most", "Mostar Bridge"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/bosnia-and-herzegovina/herzegovina/mostar/stari-most" } },
  },
  {
    name: "Dubrovnik City Walls",
    slug: "dubrovnik-city-walls",
    placeSlug: "dubrovnik",
    type: "LANDMARK" as const,
    hero: {
      label: { value: "DUBROVNIK / LANDMARK", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Medieval Walls of Dubrovnik", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "2 Kilometers of Unbroken Maritime Fortifications", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Walk atop massive limestone ramparts surrounding the old city facing the open Adriatic.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Plan Your Visit", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/croatia.jpg", alt: "Dubrovnik City Walls", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "ADRIATIC RAMPARTS", textColor: "#af6348" }, title: { value: "Impenetrable Stone Defense", textColor: "#182d09" }, paragraphs: { value: "Features Minčeta Tower, Bokar Fortress, and St. John Fortress.", textColor: "#565e69" }, quote: { value: "“The crown of medieval Adriatic engineering.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "HIGHLIGHTS", textColor: "#af6348" }, title: { value: "Rampart Towers", textColor: "#182d09" }, description: { value: "Fortresses.", textColor: "#565e69" }, items: ["Minčeta Fortress", "Bokar Fort", "St. John Fortress"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    cta: { title: "Walk Dubrovnik Walls", subtitle: "Private sunset wall walks with MIRA.", buttonLabel: "Curate My Journey", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Dubrovnik City Walls Guide | MIRA", description: "Bespoke tours of Dubrovnik City Walls.", keywords: ["Dubrovnik Walls", "Minceta Fortress"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/croatia/dalmatian-coast/dubrovnik/dubrovnik-city-walls" } },
  },
]

export const accommodationSeedData = [
  {
    name: "Royal Tulip Sea Pearl Resort",
    slug: "royal-tulip-sea-pearl",
    placeSlug: "dhermi",
    type: "ACCOMMODATION" as const,
    hero: {
      label: { value: "DHËRMI / LUXURY STAY", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Royal Tulip Sea Pearl Resort", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "5-Star Beachfront Luxury & Private Infinity Pools", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Premier luxury sanctuary on the Albanian Riviera featuring private beach access and Mediterranean fine dining.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Reserve Stay", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/royal-tulip-sea-pearl.jpg", alt: "Royal Tulip Sea Pearl", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "BOUTIQUE LUXURY", textColor: "#af6348" }, title: { value: "Ionian Coastal Serenity", textColor: "#182d09" }, paragraphs: { value: "Private sea view suites, luxury wellness spa, and gourmet seafood dining.", textColor: "#565e69" }, quote: { value: "“Where luxury meets the sapphire sea.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "AMENITIES", textColor: "#af6348" }, title: { value: "Resort Amenities", textColor: "#182d09" }, description: { value: "Luxury features.", textColor: "#565e69" }, items: ["Private Beach Access", "Infinity Sky Pool", "Holistic Spa & Sauna", "Seafood Fine Dining"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    cta: { title: "Reserve Royal Tulip Stay", subtitle: "Curated suite reservations through MIRA.", buttonLabel: "Curate My Stay", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Royal Tulip Sea Pearl Dhërmi | MIRA", description: "Bespoke luxury stays at Royal Tulip Sea Pearl Dhërmi.", keywords: ["Royal Tulip Dhermi", "Luxury Riviera Hotel"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/albania/albanian-riviera/dhermi/royal-tulip-sea-pearl" } },
  },
  {
    name: "Villa Orsula Dubrovnik",
    slug: "villa-orsula-dubrovnik",
    placeSlug: "dubrovnik",
    type: "ACCOMMODATION" as const,
    hero: {
      label: { value: "DUBROVNIK / LUXURY STAY", textColor: "#af6348", textOpacity: 1 },
      title: { value: "Villa Orsula Dubrovnik", textColor: "#ffffff", textOpacity: 1 },
      subtitle: { value: "Clifftop Boutique Villa Overlooking Old Town", textColor: "#E5E7EB", textOpacity: 1 },
      description: { value: "Exclusive 1930s seaside villa surrounded by orange trees and lavender gardens.", textColor: "#F3F4F6", textOpacity: 1 },
      buttons: [{ label: "Reserve Stay", url: "/plan-your-journey", variant: "primary", style: "primary", rounded: "full", backgroundColor: "#af6348", textColor: "#ffffff" }],
      backgroundMultimedia: { show: "image", color: { color: "#171717", opacity: 100 }, image: { url: "/images/accommodation.jpg", alt: "Villa Orsula Dubrovnik", opacity: 100, overlayColor: "#000000", overlayOpacity: 40, fit: "cover" } },
    },
    essence: { label: { value: "EXCLUSIVE RETREAT", textColor: "#af6348" }, title: { value: "Sophisticated Adriatic Elegance", textColor: "#182d09" }, paragraphs: { value: "13 bespoke rooms and suites with uninterrupted views of Lokrum Island and city walls.", textColor: "#565e69" }, quote: { value: "“Unrivaled views of Dubrovnik's red roofs.”", textColor: "#182d09" }, backgroundMultimedia: { show: "color", color: { color: "#FFF8F2" } } },
    highlights: { label: { value: "AMENITIES", textColor: "#af6348" }, title: { value: "Villa Features", textColor: "#182d09" }, description: { value: "Boutique features.", textColor: "#565e69" }, items: ["Victoria Restaurant Terrace", "Private Beach Dock", "Butler Service"], backgroundMultimedia: { show: "color", color: { color: "#FFFFFF" } } },
    cta: { title: "Reserve Villa Orsula", subtitle: "Private luxury villa stays with MIRA.", buttonLabel: "Curate My Stay", buttonUrl: "/plan-your-journey", backgroundMultimedia: { show: "color", color: { color: "#182d09" } } },
    metadata: { seo: { title: "Villa Orsula Dubrovnik | MIRA Travel", description: "Reserve Villa Orsula Dubrovnik with MIRA Travel.", keywords: ["Villa Orsula", "Dubrovnik Luxury Villa"], robots: { index: true, follow: true }, canonicalUrl: "/destinations/croatia/dalmatian-coast/dubrovnik/villa-orsula-dubrovnik" } },
  },
]

// Run if executed directly
if (process.argv[1] && (process.argv[1].endsWith("seedLocationCountries.js") || process.argv[1].endsWith("seedLocationCountries.ts"))) {
  seedLocationCountries()
    .then(async () => {
      await prisma.$disconnect()
      process.exit(0)
    })
    .catch(async (e) => {
      console.error("❌ Seeding location countries and regions failed:", e)
      await prisma.$disconnect()
      process.exit(1)
    })
}
