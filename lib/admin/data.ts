import "server-only";
import { redirect } from "next/navigation";
import { adminCatalogApi, type ProductListQuery } from "@/lib/api/catalog.api";
import { messagesApi, type MessageListQuery } from "@/lib/api/messages.api";
import { isAuthenticated } from "./auth";

/**
 * Data access for admin pages. Pages render in parallel with their layout, so
 * each read checks the session itself first. Reads are uncached so the admin
 * always sees the latest saved state.
 */

async function requireAdmin() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

export async function getAdminCatalog() {
  await requireAdmin();
  return adminCatalogApi.getCatalog();
}

export async function getAdminCategories() {
  await requireAdmin();
  return adminCatalogApi.listCategories();
}

export async function getAdminProducts(query: ProductListQuery) {
  await requireAdmin();
  return adminCatalogApi.listProducts(query);
}

export async function getAdminMessages(query: MessageListQuery) {
  await requireAdmin();
  return messagesApi.list(query);
}

/** Read a single string from Next.js searchParams. */
export const param = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) || undefined;

/** A positive page number from searchParams, defaulting to 1. */
export const pageParam = (value: string | string[] | undefined) => Math.max(1, Number.parseInt(param(value) ?? "1", 10) || 1);
