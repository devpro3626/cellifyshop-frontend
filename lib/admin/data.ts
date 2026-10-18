import { redirect } from "next/navigation";
import { getCatalog } from "@/lib/catalog/repository";
import { isAuthenticated } from "./auth";

/**
 * Catalogue access for admin pages. Pages render in parallel with their
 * layout, so each one checks the session itself before reading any data.
 */
export async function getAdminCatalog() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return getCatalog();
}
