/** URL-safe slug: lowercase letters, numbers and single dashes. */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Stable-looking id with a short random suffix, e.g. `prd-iphone-18-pro-4f2a`. */
export function uniqueId(prefix: string, slug: string) {
  return `${prefix}-${slug}-${Math.random().toString(36).slice(2, 6)}`;
}
