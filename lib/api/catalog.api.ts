import "server-only";
import type { Attribute, CatalogData, Category, Paginated, Product } from "@/lib/catalog/types";
import { adminApi, publicApi } from "./client";

/** Fields the admin sends; ids, slugs and timestamps are assigned by the API. */
export type CategoryInput = Omit<Category, "id" | "slug">;
export type AttributeInput = Omit<Attribute, "id">;
export type ProductInput = Omit<Product, "id" | "createdAt">;

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  /** Category slug or id. */
  category?: string;
}

/** Storefront reads. */
export const catalogApi = {
  getCatalog: () => publicApi.get<CatalogData>("/catalog").then((r) => r.data),
};

/** Admin writes (authenticated by the adminApi request interceptor). */
export const adminCatalogApi = {
  /** Uncached read so the admin always sees the latest data. */
  getCatalog: () => adminApi.get<CatalogData>("/catalog").then((r) => r.data),

  listCategories: () => adminApi.get<Category[]>("/categories").then((r) => r.data),
  createCategory: (input: CategoryInput) => adminApi.post<Category>("/categories", input).then((r) => r.data),
  updateCategory: (id: string, input: CategoryInput) => adminApi.put<Category>(`/categories/${id}`, input).then((r) => r.data),
  deleteCategory: (id: string) => adminApi.delete(`/categories/${id}`).then(() => undefined),

  createAttribute: (input: AttributeInput) => adminApi.post<Attribute>("/attributes", input).then((r) => r.data),
  updateAttribute: (id: string, input: AttributeInput) => adminApi.put<Attribute>(`/attributes/${id}`, input).then((r) => r.data),
  deleteAttribute: (id: string) => adminApi.delete(`/attributes/${id}`).then(() => undefined),

  listProducts: (query: ProductListQuery = {}) => adminApi.get<Paginated<Product>>("/products", { params: query }).then((r) => r.data),
  getProduct: (id: string) => adminApi.get<Product>(`/products/${id}`).then((r) => r.data),
  createProduct: (input: ProductInput) => adminApi.post<Product>("/products", input).then((r) => r.data),
  updateProduct: (id: string, input: ProductInput) => adminApi.put<Product>(`/products/${id}`, input).then((r) => r.data),
  deleteProduct: (id: string) => adminApi.delete(`/products/${id}`).then(() => undefined),
};

/** Admin session. */
export const authApi = {
  login: (password: string) => publicApi.post<{ token: string; expiresAt: string }>("/auth/login", { password }).then((r) => r.data),
  me: () => adminApi.get<{ role: string; expiresAt: string }>("/auth/me").then((r) => r.data),
};
