import { manageRecordWithFiles } from "../../../shared/manageRecordWithFiles.service.js";
import { deleteRecordsSafely } from "../../../shared/delete.service.js";
import prisma from "../../../config/prisma.js";
import { getRecords } from "../../../shared/getRecords.service.js";

const normalizeCmsPageData = (page: any) => {
  if (!page || typeof page !== "object") return page;

  let rawData = page.data;
  if (typeof rawData === "string") {
    try {
      rawData = JSON.parse(rawData);
    } catch {
      // keep raw string if not JSON
    }
  }

  if (!rawData || typeof rawData !== "object") return page;

  const dataObj = { ...rawData };
  let sections: any[] = Array.isArray(dataObj.sections) ? [...dataObj.sections] : [];

  // If sections array is empty, but keyed sections exist (hero, cta, etc.), build sections array
  if (sections.length === 0) {
    const knownKeys = [
      "hero",
      "explore_journeys",
      "destinations",
      "mira_stories",
      "why_mira",
      "travel_insights",
      "custom_journey_cta",
      "cta",
      "process",
      "inquiry_form",
      "plan_travel",
      "contact_info",
      "philosophy",
      "approach",
      "regional_knowledge",
      "people",
      "faq_intro",
      "faq_list",
      "faq_cta",
      "faq",
      "topics",
      "seo",
    ];
    for (const key of knownKeys) {
      if (dataObj[key] && typeof dataObj[key] === "object") {
        sections.push({
          key: key === "cta" ? "custom_journey_cta" : key,
          ...dataObj[key],
        });
      }
    }
  }

  // Populate keyed section objects directly inside data while merging top-level updates
  sections.forEach((sec: any, idx: number) => {
    const key = sec?.key || sec?.type;
    if (key && dataObj[key] && typeof dataObj[key] === "object") {
      const merged = {
        ...sec,
        ...dataObj[key],
        key: key === "cta" ? "custom_journey_cta" : key,
      };
      sections[idx] = merged;
      dataObj[key] = merged;
      if (key === "custom_journey_cta") {
        dataObj["cta"] = merged;
      }
    } else if (key) {
      dataObj[key] = sec;
      if (key === "custom_journey_cta") {
        dataObj["cta"] = sec;
      }
    }
  });

  dataObj.sections = sections;

  return {
    ...page,
    data: dataObj,
  };
};

export const getCmsPageService = async (req: any) => {
  let result = await getRecords({
    req,
    model: prisma.cmsPage,
    modelName: "cmsPage",
    singleRecordAsArray: false,
    include: {},
  });

  if (result?.data) {
    if (Array.isArray(result.data)) {
      result.data = result.data.map(normalizeCmsPageData);
    } else {
      result.data = normalizeCmsPageData(result.data);
    }
  }

  return result;
};

export const manageCmsPageService = async (req: any, res: any) => {
  if (req.body?.data) {
    if (typeof req.body.data === "string") {
      try {
        req.body.data = JSON.parse(req.body.data);
      } catch {}
    }
    if (typeof req.body.data === "object") {
      req.body.data = normalizeCmsPageData({ data: req.body.data }).data;
    }
  }
  if (req.validated?.body?.data) {
    if (typeof req.validated.body.data === "string") {
      try {
        req.validated.body.data = JSON.parse(req.validated.body.data);
      } catch {}
    }
    if (typeof req.validated.body.data === "object") {
      req.validated.body.data = normalizeCmsPageData({ data: req.validated.body.data }).data;
    }
  }

  let result = await manageRecordWithFiles({
    req,
    res,
    prisma,
    model: prisma.cmsPage,
    modelName: "cmsPage",
    externalDomain: ["res.cloudinary.com"],
    attachUser: false,
  });

  if (result?.data) {
    if (Array.isArray(result.data)) {
      result.data = result.data.map(normalizeCmsPageData);
    } else {
      result.data = normalizeCmsPageData(result.data);
    }
  }

  return result;
};

export const deleteCmsPageService = async (req: any, res: any) => {
  const result = await deleteRecordsSafely({
    res,
    req,
    prisma,
    model: prisma.cmsPage,
    modelName: "cmsPage",
    softDelete: true,
    rawIds: req.body.id,
    externalDomain: ["res.cloudinary.com"],
    maxLimit: 10,
    txClient: prisma,
  });
  return result;
};

