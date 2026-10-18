"use server";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { CATALOG_TAG } from "@/lib/catalog/repository";
import { readCatalog, writeCatalog } from "@/lib/catalog/store";
import type { Attribute, AttributeDisplay, AttributeValue, Category, Product, ProductKind } from "@/lib/catalog/types";
import { checkPassword, createSession, destroySession, isAuthenticated } from "./auth";
import { slugify, uniqueId } from "./slug";

/**
 * Server actions behind the admin portal. Every action re-checks the session:
 * server actions are public endpoints, so the UI being hidden is not enough.
 */

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const fail = (error: string): ActionResult<never> => ({ ok: false, error });

async function requireAdmin() {
  if (!(await isAuthenticated())) throw new Error("Your session has expired. Sign in again.");
}

/** Read, change and persist the catalogue, then refresh every page that uses it. */
async function mutate<T>(change: (data: Awaited<ReturnType<typeof readCatalog>>) => T): Promise<T> {
  await requireAdmin();
  const data = await readCatalog();
  const result = change(data);
  await writeCatalog(data);
  updateTag(CATALOG_TAG);
  return result;
}

async function guarded<T>(work: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await work();
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Something went wrong.");
  }
}

const text = (value: unknown, max = 2000) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);
const isImagePath = (value: string) => /^\/(images|uploads)\/[\w\-./]+$/.test(value) && !value.includes("..");

/* ── Session ──────────────────────────────────────────────────────────── */

export async function login(_: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const password = text(formData.get("password"), 200);
  if (!checkPassword(password)) return fail("That password isn't right.");
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ── Categories ───────────────────────────────────────────────────────── */

export async function saveCategory(input: Category): Promise<ActionResult<{ id: string }>> {
  return guarded<{ id: string }>(async () => {
    const name = text(input.name, 80);
    const slug = slugify(text(input.slug, 80) || name);
    if (!name) return fail("Give the category a name.");
    if (!slug) return fail("The URL slug can only use letters, numbers and dashes.");
    const image = text(input.image, 300);
    if (image && !isImagePath(image)) return fail("Upload an image or use a path starting with /images/ or /uploads/.");

    return mutate((data) => {
      if (data.categories.some((c) => c.slug === slug && c.id !== input.id)) throw new Error(`Another category already uses “${slug}”.`);
      const existing = data.categories.find((c) => c.id === input.id);
      const category: Category = {
        id: existing?.id ?? uniqueId("cat", slug),
        slug,
        name,
        tagline: text(input.tagline, 120),
        description: text(input.description, 600),
        image: image || existing?.image || "",
        imageFit: input.imageFit === "cover" ? "cover" : "contain",
        tint: isHex(input.tint) ? input.tint : "#EEEEEF",
        order: Number.isFinite(input.order) ? Math.round(input.order) : data.categories.length + 1,
      };
      data.categories = existing ? data.categories.map((c) => (c.id === category.id ? category : c)) : [...data.categories, category];
      return { ok: true as const, data: { id: category.id } };
    });
  });
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  return guarded(() =>
    mutate((data) => {
      const count = data.products.filter((p) => p.categoryId === id).length;
      if (count) throw new Error(`Move or delete its ${count} product${count === 1 ? "" : "s"} first.`);
      data.categories = data.categories.filter((c) => c.id !== id);
      return { ok: true as const };
    }),
  );
}

/* ── Taxonomy ─────────────────────────────────────────────────────────── */

const DISPLAYS: AttributeDisplay[] = ["swatch", "pill", "list"];

export async function saveAttribute(input: Attribute, isNew: boolean): Promise<ActionResult<{ id: string }>> {
  return guarded<{ id: string }>(async () => {
    const name = text(input.name, 60);
    if (!name) return fail("Give the attribute a name.");
    const display = DISPLAYS.includes(input.display) ? input.display : "pill";

    const seen = new Set<string>();
    const values: AttributeValue[] = [];
    for (const value of input.values ?? []) {
      const label = text(value.label, 60);
      if (!label) continue;
      const id = text(value.id, 60) || slugify(label);
      if (seen.has(id)) return fail(`“${label}” is listed twice.`);
      seen.add(id);
      values.push({
        id,
        label,
        ...(display === "swatch" ? { hex: isHex(text(value.hex, 7)) ? text(value.hex, 7) : "#CCCCCC" } : {}),
        ...(text(value.hint, 120) ? { hint: text(value.hint, 120) } : {}),
      });
    }
    if (!values.length) return fail("Add at least one value.");

    return mutate((data) => {
      const id = isNew ? slugify(name) : input.id;
      if (!id) throw new Error("Use letters or numbers in the name.");
      if (isNew && data.attributes.some((a) => a.id === id)) throw new Error(`An attribute called “${name}” already exists.`);

      // Values in use by a product can't be removed.
      const removed = (data.attributes.find((a) => a.id === id)?.values ?? []).filter((v) => !seen.has(v.id));
      for (const value of removed) {
        const user = data.products.find((p) => p.options.some((o) => o.attributeId === id && o.valueIds.includes(value.id)));
        if (user) throw new Error(`“${value.label}” is used by ${user.name}. Remove it from that product first.`);
      }

      const attribute: Attribute = { id, name, display, values };
      data.attributes = isNew ? [...data.attributes, attribute] : data.attributes.map((a) => (a.id === id ? attribute : a));
      return { ok: true as const, data: { id } };
    });
  });
}

export async function deleteAttribute(id: string): Promise<ActionResult> {
  return guarded(() =>
    mutate((data) => {
      const user = data.products.find((p) => p.options.some((o) => o.attributeId === id));
      if (user) throw new Error(`It's used by ${user.name}. Remove it from that product first.`);
      data.attributes = data.attributes.filter((a) => a.id !== id);
      return { ok: true as const };
    }),
  );
}

/* ── Products ─────────────────────────────────────────────────────────── */

const KINDS: ProductKind[] = ["device", "accessory", "service"];
const list = (values: unknown, max = 20) => (Array.isArray(values) ? values.map((v) => text(v, 200)).filter(Boolean).slice(0, max) : []);

export async function saveProduct(input: Product): Promise<ActionResult<{ id: string; slug: string }>> {
  return guarded<{ id: string; slug: string }>(async () => {
    const name = text(input.name, 100);
    const slug = slugify(text(input.slug, 100) || name);
    if (!name) return fail("Give the product a name.");
    if (!slug) return fail("The URL slug can only use letters, numbers and dashes.");

    const media = (input.media ?? [])
      .map((m) => ({ src: text(m.src, 300), alt: text(m.alt, 160) || name, ...(m.match && Object.keys(m.match).length ? { match: m.match } : {}) }))
      .filter((m) => isImagePath(m.src));
    if (!media.length) return fail("Add at least one image.");

    const variants = (input.variants ?? []).map((v) => ({
      id: text(v.id, 120),
      sku: text(v.sku, 80).toUpperCase(),
      selection: v.selection ?? {},
      price: Math.round(Number(v.price)),
      stock: Math.max(0, Math.round(Number(v.stock) || 0)),
      ...(Number(v.compareAtPrice) > Number(v.price) ? { compareAtPrice: Math.round(Number(v.compareAtPrice)) } : {}),
    }));
    if (!variants.length) return fail("The product needs at least one variant.");
    if (variants.some((v) => !Number.isFinite(v.price) || v.price <= 0)) return fail("Every variant needs a price above zero.");

    return mutate((data) => {
      if (!data.categories.some((c) => c.id === input.categoryId)) throw new Error("Choose a category.");
      if (data.products.some((p) => p.slug === slug && p.id !== input.id)) throw new Error(`Another product already uses “${slug}”.`);

      // Options must reference real taxonomy values.
      const options = (input.options ?? [])
        .map((o) => {
          const attribute = data.attributes.find((a) => a.id === o.attributeId);
          const valueIds = attribute ? o.valueIds.filter((id) => attribute.values.some((v) => v.id === id)) : [];
          return { attributeId: o.attributeId, valueIds };
        })
        .filter((o) => o.valueIds.length > 0);

      const existing = data.products.find((p) => p.id === input.id);
      const id = existing?.id ?? uniqueId("prd", slug);
      const product: Product = {
        id,
        slug,
        name,
        categoryId: input.categoryId,
        kind: KINDS.includes(input.kind) ? input.kind : "device",
        ...(text(input.badge, 40) ? { badge: text(input.badge, 40) } : {}),
        summary: text(input.summary, 240),
        description: text(input.description, 1200),
        highlights: list(input.highlights),
        specs: (input.specs ?? []).map((s) => ({ label: text(s.label, 60), value: text(s.value, 200) })).filter((s) => s.label && s.value),
        ...(list(input.inTheBox).length ? { inTheBox: list(input.inTheBox) } : {}),
        options,
        variants: variants.map((v, i) => ({ ...v, id: v.id || `${slug}-${i + 1}`, sku: v.sku || `${slug}-${i + 1}`.toUpperCase() })),
        media,
        tint: isHex(input.tint) ? input.tint : "#EEEEEF",
        featured: Boolean(input.featured),
        createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
        ...(text(input.turnaround, 40) ? { turnaround: text(input.turnaround, 40) } : {}),
        ...(text(input.warranty, 80) ? { warranty: text(input.warranty, 80) } : {}),
      };
      data.products = existing ? data.products.map((p) => (p.id === id ? product : p)) : [product, ...data.products];
      return { ok: true as const, data: { id, slug } };
    });
  });
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  return guarded(() =>
    mutate((data) => {
      data.products = data.products.filter((p) => p.id !== id);
      return { ok: true as const };
    }),
  );
}

/* ── Images ───────────────────────────────────────────────────────────── */

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_UPLOAD = 10 * 1024 * 1024;

/** Accepts one image, converts it to WebP (max 1600px) and returns its public path. */
export async function uploadImage(formData: FormData): Promise<ActionResult<{ src: string }>> {
  return guarded<{ src: string }>(async () => {
    await requireAdmin();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.type.startsWith("image/")) return fail("Choose an image file.");
    if (file.size > MAX_UPLOAD) return fail("Images must be under 10 MB.");

    const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
    const name = `${base}-${randomBytes(3).toString("hex")}.webp`;
    const output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer();

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), output);
    return { ok: true, data: { src: `/uploads/${name}` } };
  });
}
