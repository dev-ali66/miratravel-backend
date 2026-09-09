import prisma from "../../config/prisma.js";

export const getSiteSettings = async () => {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: "global" },
  });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: "global",
        siteName: "MIRA Luxury Travel",
        siteTagline: "Curating bespoke journeys",
        defaultLanguage: "en",
        defaultTimezone: "UTC",
        seoRobots: "index, follow",
        seoSchemaEnabled: true,
      },
    });
  }

  return settings;
};

export const updateSiteSettings = async (data: any) => {
  const { id, createdAt, updatedAt, ...updatePayload } = data || {};

  const settings = await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: updatePayload,
    create: {
      id: "global",
      ...updatePayload,
    },
  });

  return settings;
};
