"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { adminCatalogApi } from "@/lib/api/catalog.api";
import { messagesApi } from "@/lib/api/messages.api";
import { ApiError } from "@/lib/api/errors";
import { CATALOG_TAG } from "@/lib/catalog/repository";
import type { Attribute, Category, Product } from "@/lib/catalog/types";
import { signIn, signOut } from "./auth";

/**
 * Server actions behind the admin portal. Each forwards to the CellifyShop API
 * (which validates input and checks the admin token), then refreshes every
 * storefront page that reads the catalogue.
 *
 * On success they also re-render the current admin page. The fresh page comes
 * back in the same response as the result, so a list already shows the change
 * when the loader stops (no second round trip with router.refresh()).
 */

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.isUnauthorized ? "Your session has expired. Sign in again." : error.message;
  return "Something went wrong. Please try again.";
}

/** Run an API write, refresh the storefront cache, and report the outcome to the form. */
async function write<T>(work: () => Promise<T>, rerender = true): Promise<ActionResult<T>> {
  try {
    const data = await work();
    updateTag(CATALOG_TAG);
    if (rerender) refresh();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

/* ── Session ──────────────────────────────────────────────────────────── */

export async function login(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  try {
    await signIn(password);
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
  redirect("/admin");
}

export async function logout() {
  await signOut();
  redirect("/admin/login");
}

/* ── Categories ───────────────────────────────────────────────────────── */

export async function saveCategory(input: Category): Promise<ActionResult<{ id: string }>> {
  // The API ignores read-only fields (slug, timestamps), so the draft can be sent as is.
  const { id, ...fields } = input;
  return write(async () => {
    const saved = id ? await adminCatalogApi.updateCategory(id, fields) : await adminCatalogApi.createCategory(fields);
    return { id: saved.id };
  });
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  return write(() => adminCatalogApi.deleteCategory(id));
}

/* ── Taxonomy ─────────────────────────────────────────────────────────── */

export async function saveAttribute(input: Attribute, isNew: boolean): Promise<ActionResult<{ id: string }>> {
  const { id, ...fields } = input;
  return write(async () => {
    const saved = isNew ? await adminCatalogApi.createAttribute(fields) : await adminCatalogApi.updateAttribute(id, fields);
    return { id: saved.id };
  });
}

export async function deleteAttribute(id: string): Promise<ActionResult> {
  return write(() => adminCatalogApi.deleteAttribute(id));
}

/* ── Products ─────────────────────────────────────────────────────────── */

export async function saveProduct(input: Product): Promise<ActionResult<{ id: string }>> {
  const { id, ...fields } = input;
  const payload = {
    ...fields,
    highlights: fields.highlights.filter(Boolean),
    inTheBox: fields.inTheBox?.filter(Boolean) ?? [],
    specs: fields.specs.filter((s) => s.label && s.value),
  };
  return write(async () => {
    const saved = id ? await adminCatalogApi.updateProduct(id, payload) : await adminCatalogApi.createProduct(payload);
    return { id: saved.id };
  });
}

/** On success, goes straight to the product list (the edit page no longer exists). */
export async function deleteProduct(id: string): Promise<ActionResult> {
  const result = await write(() => adminCatalogApi.deleteProduct(id), false);
  if (result.ok) redirect("/admin/products");
  return result;
}

/* ── Messages ─────────────────────────────────────────────────────────── */

/** Messages don't affect the storefront, so only the admin page is re-rendered. */
async function call<T>(work: () => Promise<T>, rerender = true): Promise<ActionResult<T>> {
  try {
    const data = await work();
    if (rerender) refresh();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

/** `rerender: false` saves quietly, e.g. when opening a message, so it stays in view. */
export async function setMessageRead(id: string, read: boolean, rerender = true): Promise<ActionResult> {
  return call(async () => {
    await messagesApi.setRead(id, read);
    return undefined;
  }, rerender);
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  return call(() => messagesApi.remove(id));
}
