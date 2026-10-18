import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serves images uploaded through the admin portal from `data/uploads`.
 * (Files added to /public after a build are not served by `next start`.)
 */
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

const TYPES: Record<string, string> = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

export async function GET(_request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const segments = (await params).path;
  const file = path.join(UPLOAD_DIR, ...segments);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type || !file.startsWith(UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });

  try {
    const body = await readFile(file);
    return new Response(new Uint8Array(body), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
