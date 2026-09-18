import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function buildGeoData(config: {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  mapZoom: number;
  timezone: string;
  areaValue: number;
  areaUnit?: string;
  pitch?: number;
  bearing?: number;
}) {
  return {
    title: {
      value: config.title,
      textColor: "#0a0a0a",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    description: {
      value: config.description,
      textColor: "#565e69",
      textOpacity: 1,
      backgroundColor: null,
      backgroundOpacity: 1,
    },
    backgroundMultimedia: {
      show: "color",
      color: {
        color: "#FFF8F2",
        opacity: 100,
        width: "100%",
        height: "100%",
        aspectRatio: "auto",
      },
      image: {
        url: "",
        alt: "Map background image",
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
        alt: "Map background video",
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
    },
    geo: {
      latitude: config.latitude,
      longitude: config.longitude,
      mapZoom: config.mapZoom,
      pitch: config.pitch ?? 0,
      bearing: config.bearing ?? 0,
      timezone: config.timezone,
      area: {
        value: config.areaValue,
        unit: config.areaUnit ?? "km²",
      },
    },
    // Top-level aliases for universal component compatibility
    latitude: config.latitude,
    longitude: config.longitude,
    mapZoom: config.mapZoom,
    pitch: config.pitch ?? 0,
    bearing: config.bearing ?? 0,
    timezone: config.timezone,
    area: {
      value: config.areaValue,
      unit: config.areaUnit ?? "km²",
    },
    showChildren: true,
  };
}

const geoDataMap: Record<string, ReturnType<typeof buildGeoData>> = {
  // CONTINENT
  europe: buildGeoData({
    title: "Explore Europe",
    description: "Discover the breathtaking landscapes, ancient history, and luxury escapes across Europe.",
    latitude: 54.5260,
    longitude: 15.2551,
    mapZoom: 3.5,
    timezone: "UTC+0 to UTC+4",
    areaValue: 10180000,
  }),

  // COUNTRIES
  albania: buildGeoData({
    title: "Map of Albania",
    description: "Explore Albania's majestic mountain peaks, Ottoman heritage towns, and pristine Riviera coastline.",
    latitude: 41.1533,
    longitude: 20.1683,
    mapZoom: 7.5,
    timezone: "UTC+1 (CET)",
    areaValue: 28748,
  }),
  greece: buildGeoData({
    title: "Map of Greece",
    description: "Uncover cliffside monasteries, Aegean islands, and legendary ancient monuments.",
    latitude: 39.0742,
    longitude: 21.8243,
    mapZoom: 6.8,
    timezone: "UTC+2 (EET)",
    areaValue: 131957,
  }),
  bulgaria: buildGeoData({
    title: "Map of Bulgaria",
    description: "Traverse Balkan mountain ranges, historic Plovdiv, and sacred alpine monasteries.",
    latitude: 42.7339,
    longitude: 25.4858,
    mapZoom: 7.2,
    timezone: "UTC+2 (EET)",
    areaValue: 110994,
  }),
  slovenia: buildGeoData({
    title: "Map of Slovenia",
    description: "Experience emerald alpine lakes, Julian Alps peaks, and subterranean wonders.",
    latitude: 46.1512,
    longitude: 14.9955,
    mapZoom: 8.2,
    timezone: "UTC+1 (CET)",
    areaValue: 20273,
  }),
  "north-macedonia": buildGeoData({
    title: "Map of North Macedonia",
    description: "Discover ancient Lake Ohrid, dramatic Matka Canyon, and vibrant Skopje.",
    latitude: 41.6086,
    longitude: 21.7453,
    mapZoom: 8.0,
    timezone: "UTC+1 (CET)",
    areaValue: 25713,
  }),
  kosovo: buildGeoData({
    title: "Map of Kosovo",
    description: "Explore medieval Ottoman fortresses, Rugova gorge, and historic Prizren.",
    latitude: 42.6026,
    longitude: 20.9030,
    mapZoom: 8.5,
    timezone: "UTC+1 (CET)",
    areaValue: 10887,
  }),
  montenegro: buildGeoData({
    title: "Map of Montenegro",
    description: "Where fjord-like Adriatic bays meet towering limestone mountain national parks.",
    latitude: 42.7087,
    longitude: 19.3744,
    mapZoom: 8.5,
    timezone: "UTC+1 (CET)",
    areaValue: 13812,
  }),
  "bosnia-and-herzegovina": buildGeoData({
    title: "Map of Bosnia & Herzegovina",
    description: "Traverse Ottoman stone bridges, emerald river canyons, and historic Sarajevo.",
    latitude: 43.9159,
    longitude: 17.6791,
    mapZoom: 7.8,
    timezone: "UTC+1 (CET)",
    areaValue: 51129,
  }),
  croatia: buildGeoData({
    title: "Map of Croatia",
    description: "Discover medieval coastal city walls, thousand Adriatic islands, and Dalmatian heritage.",
    latitude: 45.1000,
    longitude: 15.2000,
    mapZoom: 7.2,
    timezone: "UTC+1 (CET)",
    areaValue: 56594,
  }),

  // REGIONS
  "north-albania": buildGeoData({
    title: "Northern Albania Region",
    description: "The wild heart of the Accursed Mountains, glacial lakes, and river canyons.",
    latitude: 42.2000,
    longitude: 19.8000,
    mapZoom: 9.2,
    timezone: "UTC+1 (CET)",
    areaValue: 5260,
  }),
  "central-albania": buildGeoData({
    title: "Central Albania Region",
    description: "Vibrant capital culture of Tirana, Krujë castle heights, and coastal plains.",
    latitude: 41.3275,
    longitude: 19.8189,
    mapZoom: 9.5,
    timezone: "UTC+1 (CET)",
    areaValue: 4850,
  }),
  "south-albania": buildGeoData({
    title: "Southern Albania Region",
    description: "UNESCO stone towns of Gjirokastër, Benja thermal baths, and Vjosa River valley.",
    latitude: 40.1000,
    longitude: 20.1000,
    mapZoom: 9.2,
    timezone: "UTC+1 (CET)",
    areaValue: 6500,
  }),
  "albanian-riviera": buildGeoData({
    title: "Albanian Riviera Region",
    description: "Turquoise Ionian waters, cliffside villages, and pristine secluded beaches.",
    latitude: 40.0600,
    longitude: 19.7800,
    mapZoom: 9.8,
    timezone: "UTC+1 (CET)",
    areaValue: 1200,
  }),
  "eastern-albania": buildGeoData({
    title: "Eastern Albania Region",
    description: "Lakeside Pogradec, historic Korçë, and mountain pine forests.",
    latitude: 40.6200,
    longitude: 20.7800,
    mapZoom: 9.2,
    timezone: "UTC+1 (CET)",
    areaValue: 3750,
  }),
  herzegovina: buildGeoData({
    title: "Herzegovina Region",
    description: "Sun-drenched stone towns, Neretva River canyons, and Blagaj Tekke springs.",
    latitude: 43.3400,
    longitude: 17.8100,
    mapZoom: 9.2,
    timezone: "UTC+1 (CET)",
    areaValue: 11400,
  }),
  "sarajevo-canton": buildGeoData({
    title: "Sarajevo Canton Region",
    description: "Historic Olympic mountains, Ottoman Baščaršija, and cultural crossroads.",
    latitude: 43.8563,
    longitude: 18.4131,
    mapZoom: 10.2,
    timezone: "UTC+1 (CET)",
    areaValue: 1277,
  }),
  "bay-of-kotor": buildGeoData({
    title: "Bay of Kotor Region",
    description: "Dramatic fjord landscapes, Venetian fortified towns, and island sanctuaries.",
    latitude: 42.4575,
    longitude: 18.6947,
    mapZoom: 10.8,
    timezone: "UTC+1 (CET)",
    areaValue: 300,
  }),
  durmitor: buildGeoData({
    title: "Durmitor National Park Region",
    description: "Alpine glacial peaks, deep Tara River Canyon, and pristine Black Lake.",
    latitude: 43.1400,
    longitude: 19.0600,
    mapZoom: 10.8,
    timezone: "UTC+1 (CET)",
    areaValue: 390,
  }),
  "skopje-matka": buildGeoData({
    title: "Skopje & Matka Region",
    description: "Dramatic limestone gorges, ancient cave monasteries, and capital landmarks.",
    latitude: 41.9981,
    longitude: 21.4254,
    mapZoom: 10.2,
    timezone: "UTC+1 (CET)",
    areaValue: 1818,
  }),
  "lake-ohrid": buildGeoData({
    title: "Lake Ohrid Region",
    description: "Europe's oldest lake, UNESCO heritage churches, and crystal springs.",
    latitude: 41.1172,
    longitude: 20.8019,
    mapZoom: 10.8,
    timezone: "UTC+1 (CET)",
    areaValue: 890,
  }),
  "prizren-region": buildGeoData({
    title: "Prizren Region",
    description: "Ottoman stone bridges, Shadervan square, and Sharr mountain backdrops.",
    latitude: 42.2139,
    longitude: 20.7397,
    mapZoom: 10.5,
    timezone: "UTC+1 (CET)",
    areaValue: 640,
  }),
  "julian-alps": buildGeoData({
    title: "Julian Alps Region",
    description: "Mount Triglav national park, emerald Soča River, and glacial valley lakes.",
    latitude: 46.3500,
    longitude: 13.8333,
    mapZoom: 10.2,
    timezone: "UTC+1 (CET)",
    areaValue: 1540,
  }),
  "rila-plovdiv": buildGeoData({
    title: "Rila & Plovdiv Region",
    description: "Ancient Roman Plovdiv amphitheater, Seven Rila Lakes, and sacred mountain monasteries.",
    latitude: 42.1354,
    longitude: 24.7453,
    mapZoom: 9.8,
    timezone: "UTC+2 (EET)",
    areaValue: 5928,
  }),
  "meteora-epirus": buildGeoData({
    title: "Meteora & Epirus Region",
    description: "Monasteries perched atop towering sandstone pillars and deep Vikos Gorge.",
    latitude: 39.7217,
    longitude: 21.6306,
    mapZoom: 9.8,
    timezone: "UTC+2 (EET)",
    areaValue: 9203,
  }),
  "dalmatian-coast": buildGeoData({
    title: "Dalmatian Coast Region",
    description: "Medieval coastal strongholds, island archipelagos, and sparkling Adriatic waters.",
    latitude: 43.5081,
    longitude: 16.4402,
    mapZoom: 8.8,
    timezone: "UTC+1 (CET)",
    areaValue: 12100,
  }),

  // PLACES
  theth: buildGeoData({
    title: "Theth Village Map",
    description: "Secluded alpine valley village surrounded by dramatic 2,000m Accursed Mountain peaks.",
    latitude: 42.3917,
    longitude: 19.7817,
    mapZoom: 12.8,
    timezone: "UTC+1 (CET)",
    areaValue: 26,
  }),
  valbona: buildGeoData({
    title: "Valbona Valley Map",
    description: "Glacial river valley surrounded by pristine pine forests and alpine hiking pass.",
    latitude: 42.4528,
    longitude: 19.8978,
    mapZoom: 12.8,
    timezone: "UTC+1 (CET)",
    areaValue: 80,
  }),
  shkoder: buildGeoData({
    title: "Shkodër City Map",
    description: "Cultural gateway to Northern Albania situated beside Lake Shkodër and Rozafa Castle.",
    latitude: 42.0683,
    longitude: 19.5126,
    mapZoom: 12.2,
    timezone: "UTC+1 (CET)",
    areaValue: 872,
  }),
  "lake-koman": buildGeoData({
    title: "Lake Koman Map",
    description: "Fjord-like reservoir route cutting through towering vertical canyon walls.",
    latitude: 42.1000,
    longitude: 19.8250,
    mapZoom: 12.2,
    timezone: "UTC+1 (CET)",
    areaValue: 12,
  }),
  tirana: buildGeoData({
    title: "Tirana City Map",
    description: "Colorful capital city showcasing Skanderbeg Square, Mount Dajti, and Bunk'Art.",
    latitude: 41.3275,
    longitude: 19.8189,
    mapZoom: 12.8,
    timezone: "UTC+1 (CET)",
    areaValue: 1110,
  }),
  berat: buildGeoData({
    title: "Berat UNESCO Town Map",
    description: "The 'City of a Thousand Windows' featuring Ottoman hillside houses and castle citadel.",
    latitude: 40.7058,
    longitude: 19.9522,
    mapZoom: 13.2,
    timezone: "UTC+1 (CET)",
    areaValue: 380,
  }),
  gjirokaster: buildGeoData({
    title: "Gjirokastër UNESCO Town Map",
    description: "Stone-roofed Ottoman town birthplace of Ismail Kadare, overlooked by grand fortress.",
    latitude: 40.0758,
    longitude: 20.1389,
    mapZoom: 13.2,
    timezone: "UTC+1 (CET)",
    areaValue: 470,
  }),
  dhermi: buildGeoData({
    title: "Dhërmi Beach Map",
    description: "Picturesque coastal village perched above white pebble beaches and crystal Ionian waters.",
    latitude: 40.1542,
    longitude: 19.6417,
    mapZoom: 13.8,
    timezone: "UTC+1 (CET)",
    areaValue: 45,
  }),
  mostar: buildGeoData({
    title: "Mostar Town Map",
    description: "Historic Herzegovina city famous for Stari Most arch bridge over emerald Neretva.",
    latitude: 43.3438,
    longitude: 17.8078,
    mapZoom: 13.2,
    timezone: "UTC+1 (CET)",
    areaValue: 1175,
  }),
  kotor: buildGeoData({
    title: "Kotor Bay Town Map",
    description: "Fortified UNESCO medieval town nestled beneath San Giovanni fortress mountain cliffs.",
    latitude: 42.4247,
    longitude: 18.7712,
    mapZoom: 13.8,
    timezone: "UTC+1 (CET)",
    areaValue: 335,
  }),
  "lake-bled": buildGeoData({
    title: "Lake Bled Resort Map",
    description: "Iconic alpine lake featuring island church, cliffside medieval castle, and Pletna boats.",
    latitude: 46.3636,
    longitude: 14.0938,
    mapZoom: 13.2,
    timezone: "UTC+1 (CET)",
    areaValue: 72,
  }),
  dubrovnik: buildGeoData({
    title: "Dubrovnik City Map",
    description: "The 'Pearl of the Adriatic' surrounded by massive 16th-century stone city walls.",
    latitude: 42.6507,
    longitude: 18.0944,
    mapZoom: 13.2,
    timezone: "UTC+1 (CET)",
    areaValue: 143,
  }),

  // LANDMARKS
  "lock-in-tower": buildGeoData({
    title: "Lock-In Tower (Kulla e Ngujimit) Landmark",
    description: "Historic 400-year-old stone defense tower in Theth used during blood feud reconciliations.",
    latitude: 42.3894,
    longitude: 19.7844,
    mapZoom: 16.5,
    timezone: "UTC+1 (CET)",
    areaValue: 0.05,
  }),
  "berat-castle": buildGeoData({
    title: "Berat Castle Citadel Landmark",
    description: "Living 13th-century fortress citadel overlooking the Osum River and Berat UNESCO quarter.",
    latitude: 40.7086,
    longitude: 19.9461,
    mapZoom: 15.8,
    timezone: "UTC+1 (CET)",
    areaValue: 0.1,
  }),
  "stari-most": buildGeoData({
    title: "Stari Most Old Bridge Landmark",
    description: "Reconstructed 16th-century Ottoman bridge connecting two halves of Mostar across Neretva.",
    latitude: 43.3373,
    longitude: 17.8150,
    mapZoom: 16.8,
    timezone: "UTC+1 (CET)",
    areaValue: 0.02,
  }),
  "dubrovnik-city-walls": buildGeoData({
    title: "Dubrovnik City Walls Landmark",
    description: "2-kilometer continuous medieval stone ramparts surrounding Dubrovnik's Old Town.",
    latitude: 42.6413,
    longitude: 18.1077,
    mapZoom: 15.8,
    timezone: "UTC+1 (CET)",
    areaValue: 0.2,
  }),

  // ACCOMMODATIONS
  "royal-tulip-sea-pearl-resort": buildGeoData({
    title: "Royal Tulip Sea Pearl Resort Location Map",
    description: "Luxury 5-star beachfront retreat in Dhërmi with private beach access and panoramic Ionian views.",
    latitude: 40.1492,
    longitude: 19.6389,
    mapZoom: 16.2,
    timezone: "UTC+1 (CET)",
    areaValue: 0.08,
  }),
  "villa-orsula-dubrovnik": buildGeoData({
    title: "Villa Orsula Dubrovnik Location Map",
    description: "Bespoke 1930s luxury villa offering direct Lokrum Island views steps from Old Town walls.",
    latitude: 42.6402,
    longitude: 18.1172,
    mapZoom: 16.2,
    timezone: "UTC+1 (CET)",
    areaValue: 0.05,
  }),
};

async function main() {
  const locations = await prisma.location.findMany();
  console.log(`Starting real geoData update for ${locations.length} locations...`);

  let updatedCount = 0;

  for (const loc of locations) {
    const geoData = geoDataMap[loc.slug];
    if (geoData) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { geoData },
      });
      console.log(`✅ [UPDATED] ${loc.name} (${loc.type}) -> lat: ${geoData.geo.latitude}, lng: ${geoData.geo.longitude}, zoom: ${geoData.geo.mapZoom}`);
      updatedCount++;
    } else {
      // Fallback default for any unexpected location
      const fallbackGeo = buildGeoData({
        title: `Map of ${loc.name}`,
        description: `Explore ${loc.name} on the interactive map.`,
        latitude: 41.1533,
        longitude: 20.1683,
        mapZoom: 8,
        timezone: "UTC+1 (CET)",
        areaValue: 1000,
      });
      await prisma.location.update({
        where: { id: loc.id },
        data: { geoData: fallbackGeo },
      });
      console.log(`⚠️ [FALLBACK UPDATED] ${loc.name} (${loc.type})`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Successfully updated real geoData for ALL ${updatedCount} locations in Neon PostgreSQL DB!`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding geoData:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
