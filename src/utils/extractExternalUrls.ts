// utils/extractExternalUrlsDeep.js

export const extractExternalUrlsDeep = (
  input :any,
  urls = new Set(),
  domains = ["res.cloudinary.com"],
) => {
  if (!input) return urls;

  const domainList = Array.isArray(domains) ? domains : [domains];

  const safeParse = (value:any) => {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();

    // Try parsing only if it looks like JSON
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    }

    return value;
  };

  const traverse = (value:any) => {
    value = safeParse(value);

    // Array
    if (Array.isArray(value)) {
      value.forEach(traverse);
      return;
    }

    // Object
    if (value && typeof value === "object") {
      Object.values(value).forEach(traverse);
      return;
    }

    // String (URL check)
    if (typeof value === "string") {
      for (const domain of domainList) {
        if (value.includes(domain)) {
          urls.add(value.trim());
          break;
        }
      }
    }
  };

  traverse(input);
  return urls;
};
