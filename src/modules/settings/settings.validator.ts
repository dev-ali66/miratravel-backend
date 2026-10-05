import { z } from "zod";

export const socialLinkItemSchema = z.object({
  id: z.string().nullish(),
  platform: z.string().nullish(),
  title: z.string().nullish(),
  url: z.string().nullish(),
  icon: z.string().nullish(),
  iconImage: z.string().nullish(),
});

export const updateSettingsValidator = z.object({
  body: z.object({
    id: z.string().nullish(),

    // 1. Identity
    siteName: z.string().trim().max(100).nullish(),
    siteTagline: z.string().trim().max(255).nullish(),
    siteDescription: z.string().nullish(),
    siteUrl: z.string().trim().nullish(),
    defaultLanguage: z.string().trim().max(10).nullish(),
    defaultTimezone: z.string().trim().max(50).nullish(),
    contactEmail: z.string().trim().nullish(),
    supportEmail: z.string().trim().nullish(),
    phoneNumber: z.string().trim().max(50).nullish(),
    secondaryPhoneNumber: z.string().trim().max(50).nullish(),
    businessName: z.string().trim().max(150).nullish(),
    businessAddress: z.string().nullish(),
    copyrightText: z.string().trim().max(255).nullish(),

    // 2. Brand
    siteLogo: z.any().nullish(),
    siteLogoLight: z.any().nullish(),
    siteLogoDark: z.any().nullish(),
    siteFavicon: z.any().nullish(),
    navbarLogo: z.any().nullish(),
    footerLogo: z.any().nullish(),
    authLogo: z.any().nullish(),
    loadingVideo: z.any().nullish(),

    // 3. Social
    socialLinks: z.array(socialLinkItemSchema).or(z.any()).nullish(),

    // 4. Social Meta (Open Graph & Twitter)
    seoOgTitle: z.string().trim().max(150).nullish(),
    seoOgDescription: z.string().nullish(),
    seoOgImage: z.string().nullish(),
    seoTwitterTitle: z.string().trim().max(150).nullish(),
    seoTwitterDescription: z.string().nullish(),
    seoTwitterImage: z.string().nullish(),
    seoTwitterCard: z.string().nullish(),

    // 5. SEO
    seoDefaultTitle: z.string().trim().max(150).nullish(),
    seoTitleTemplate: z.string().trim().max(150).nullish(),
    seoMetaDescription: z.string().nullish(),
    seoKeywords: z.string().nullish(),
    seoCanonicalUrl: z.string().trim().nullish(),
    seoRobots: z.string().trim().max(100).nullish(),
    seoAuthor: z.string().trim().max(100).nullish(),
    seoGoogleVerification: z.string().trim().nullish(),
    seoBingVerification: z.string().trim().nullish(),
    seoSchemaEnabled: z.boolean().nullish(),

    createdAt: z.any().nullish(),
    updatedAt: z.any().nullish(),
  }),
});

