/**
 * Universal Recursive Media Reference Extractor
 * Traverses any database record, JSONB field, nested object, or array
 * and extracts all media URLs along with their precise dot-notation fieldPath.
 */

export interface ExtractedMediaReference {
  url: string;
  fieldPath: string;
}

const MEDIA_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".mp4",
  ".webm",
  ".ogg",
  ".mov",
];

const KNOWN_STORAGE_DOMAINS = [
  "/multimedia/uploads/",
  "/uploads/",
  "api.miratravel.nl",
  "res.cloudinary.com",
  "cloudinary.com",
];

/**
 * Validates whether a given string is a valid media URL or storage path.
 */
export function isMediaUrl(val: any): boolean {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.length < 5) return false;

  // Single URL should not contain HTML tags, quotes, or whitespace
  if (
    /\s/.test(trimmed) ||
    trimmed.includes("<") ||
    trimmed.includes(">") ||
    trimmed.includes('"') ||
    trimmed.includes("'")
  ) {
    return false;
  }

  // Domain or storage path match
  const hasDomainMatch = KNOWN_STORAGE_DOMAINS.some((d) => trimmed.includes(d));
  if (hasDomainMatch) return true;

  // URL protocol with media extension
  const isUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
  if (!isUrl) return false;

  const cleanUrl = trimmed.split("?")[0].toLowerCase();
  return MEDIA_EXTENSIONS.some((ext) => cleanUrl.endsWith(ext));
}

/**
 * Recursively extracts all media URLs and their exact field paths from any object or array.
 * 
 * @param data Any entity object or JSON value
 * @param currentPath Accumulated dot-notation path (e.g., "hero.image.url", "blocks[0].content.value")
 * @param results Target array collecting extracted references
 */
export function extractMediaReferences(
  data: any,
  currentPath: string = "",
  results: ExtractedMediaReference[] = [],
): ExtractedMediaReference[] {
  if (data === null || data === undefined) return results;

  // Handle strings (direct URL check OR embedded HTML/rich-text)
  if (typeof data === "string") {
    if (isMediaUrl(data)) {
      results.push({
        url: data.trim(),
        fieldPath: currentPath,
      });
      return results;
    }

    // Check if string contains HTML or rich text with embedded media URLs
    if (
      data.includes("<") ||
      data.includes("http://") ||
      data.includes("https://") ||
      data.includes("/uploads/") ||
      data.includes("/multimedia/uploads/")
    ) {
      const foundUrls = new Set<string>();

      // 1. Extract from src/href attributes: src="..." or src='...'
      const attrRegex = /(?:src|href)=["']([^"']+)["']/gi;
      let attrMatch: RegExpExecArray | null;
      while ((attrMatch = attrRegex.exec(data)) !== null) {
        const urlCandidate = attrMatch[1]?.trim();
        if (urlCandidate && isMediaUrl(urlCandidate)) {
          foundUrls.add(urlCandidate);
        }
      }

      // 2. Extract from Markdown image syntax: ![alt](url)
      const mdRegex = /!\[.*?\]\(([^)\s]+)\)/gi;
      let mdMatch: RegExpExecArray | null;
      while ((mdMatch = mdRegex.exec(data)) !== null) {
        const urlCandidate = mdMatch[1]?.trim();
        if (urlCandidate && isMediaUrl(urlCandidate)) {
          foundUrls.add(urlCandidate);
        }
      }

      // 3. Extract raw URLs matching known domains or extensions
      const rawUrlRegex = /(https?:\/\/[^\s"'<>()]+|\/(?:multimedia\/uploads|uploads)\/[^\s"'<>()]+)/gi;
      let rawMatch: RegExpExecArray | null;
      while ((rawMatch = rawUrlRegex.exec(data)) !== null) {
        const urlCandidate = rawMatch[1]?.trim();
        if (urlCandidate && isMediaUrl(urlCandidate)) {
          foundUrls.add(urlCandidate);
        }
      }

      for (const u of foundUrls) {
        results.push({
          url: u,
          fieldPath: currentPath,
        });
      }
    }
    return results;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const nextPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
      extractMediaReferences(item, nextPath, results);
    });
    return results;
  }

  // Handle Objects
  if (typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      // Skip internal metadata fields that are not content
      if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "deletedAt") {
        continue;
      }
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      extractMediaReferences(value, nextPath, results);
    }
  }

  return results;
}
