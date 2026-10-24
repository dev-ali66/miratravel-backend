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
 * @param currentPath Accumulated dot-notation path (e.g., "hero.image.url", "accommodations[0].stay.multimedia.image.url")
 * @param results Target array collecting extracted references
 */
export function extractMediaReferences(
  data: any,
  currentPath: string = "",
  results: ExtractedMediaReference[] = [],
): ExtractedMediaReference[] {
  if (data === null || data === undefined) return results;

  // Handle strings (direct URL check)
  if (typeof data === "string") {
    if (isMediaUrl(data)) {
      results.push({
        url: data.trim(),
        fieldPath: currentPath,
      });
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
