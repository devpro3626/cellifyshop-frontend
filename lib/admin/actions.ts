"use server";

import { updateTag } from "next/cache";
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
 */

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.isUnauthorized ? "Your session has expired. Sign in again." : error.message;
  return "Something went wrong. Please try again.";
}

/** Run an API write, refresh the storefront cache, and report the outcome to the form. */
async function write<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await work();
    updateTag(CATALOG_TAG);
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

export async function deleteProduct(id: string): Promise<ActionResult> {
  return write(() => adminCatalogApi.deleteProduct(id));
}

/* ── Messages ─────────────────────────────────────────────────────────── */

/** Messages don't affect the storefront, so no cache refresh is needed. */
async function call<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  return call(async () => {
    await messagesApi.setRead(id, read);
    return undefined;
  });
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  return call(() => messagesApi.remove(id));
}
