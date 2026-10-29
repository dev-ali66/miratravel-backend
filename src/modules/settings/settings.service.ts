import prisma from "../../config/prisma.js";
import { syncEntityMediaReferences } from "../../shared/mediaReference.service.js";

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

  if (settings && typeof settings.socialLinks === "string") {
    try {
      settings.socialLinks = JSON.parse(settings.socialLinks);
    } catch {
      settings.socialLinks = [];
    }
  }

  return settings;
};

export const updateSiteSettings = async (data: any) => {
  const { id, createdAt, updatedAt, ...updatePayload } = data || {};

  if (updatePayload.socialLinks && typeof updatePayload.socialLinks === "string") {
    try {
      updatePayload.socialLinks = JSON.parse(updatePayload.socialLinks);
    } catch {
      // keep as is
    }
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: updatePayload,
    create: {
      id: "global",
      ...updatePayload,
    },
  });

  if (settings && typeof settings.socialLinks === "string") {
    try {
      settings.socialLinks = JSON.parse(settings.socialLinks);
    } catch {
      settings.socialLinks = [];
    }
  }

  try {
    await syncEntityMediaReferences("SiteSettings", "global", settings);
  } catch (syncErr) {
    console.warn(`[updateSiteSettings] syncEntityMediaReferences error for SiteSettings:global`, syncErr);
  }

  return settings;
};
