export const extractDomains = (input: unknown): string[] => {
  const result = new Set<string>(); // using Set to automatically remove duplicates

  const flatten = (item: unknown) => {
    if (Array.isArray(item)) {
      item.forEach(flatten);
    } else if (item && typeof item === "object") {
      Object.values(item).forEach(flatten);
    } else if (typeof item === "string") {
      try {
        // Try to extract hostname if it's a URL
        const url = new URL(item.startsWith("http") ? item : `http://${item}`);
        result.add(url.hostname);
      } catch {
        // Not a URL, treat as plain domain
        result.add(item);
      }
    } else {
      throw new Error("Invalid input format");
    }
  };

  flatten(input);
  return [...result]; // convert Set back to array
};
