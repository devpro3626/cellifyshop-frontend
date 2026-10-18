import { site } from "./config/site";

const currency = new Intl.NumberFormat(site.locale, {
  style: "currency",
  currency: site.currency,
  maximumFractionDigits: 0,
});

export const formatPrice = (amount: number) => currency.format(amount);

/**
 * Opens a WhatsApp chat with the store and a pre-filled message. Without a
 * configured number WhatsApp asks the visitor to pick a contact instead.
 */
export function whatsappLink(message: string) {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Absolute link to a product page, optionally preselecting its options. */
export function productUrl(id: string, selection: Record<string, string> = {}) {
  const query = new URLSearchParams(selection).toString();
  return `${site.url}/product/${id}${query ? `?${query}` : ""}`;
}
