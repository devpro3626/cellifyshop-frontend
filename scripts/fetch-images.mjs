/**
 * Downloads and prepares every image the storefront uses.
 *
 *   npm run images              # fetch everything that is missing
 *   npm run images -- --force   # re-fetch all
 *   npm run images -- airpods   # only outputs whose path contains "airpods"
 *
 * Product cut-outs come from Apple's public store image service and are
 * trimmed, keyed off their grey studio background and padded to a square.
 * Editorial and repair photography comes from Unsplash (Unsplash License).
 *
 * Before launch, confirm you are allowed to use manufacturer imagery
 * (authorised reseller programmes usually grant this), or replace these files
 * with your own photography. Every image lives in /public/images, so swapping
 * one is a file replacement; no code changes needed.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUBLIC = path.resolve(import.meta.dirname, "..", "public");
const args = process.argv.slice(2);
const force = args.includes("--force");
const filters = args.filter((a) => !a.startsWith("--"));

const APPLE_HOSTS = ["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is", "https://as-images.apple.com/is"];

/* ── Manifest ─────────────────────────────────────────────────────────── */

const jobs = [];
const cutout = (output, sources) => jobs.push({ kind: "cutout", output, sources: [sources].flat() });
const photo = (output, id, credit) => jobs.push({ kind: "photo", output, id, credit });

/** New-generation store images: transparent, several angles per finish. */
function phone(slug, prefix, date, finishes, angles = ["", "_AV2", "_AV3"], geo = false) {
  for (const [colorId, appleName] of Object.entries(finishes)) {
    angles.forEach((suffix, i) => {
      const base = `${prefix}-finish-select-${appleName}-${date}`;
      const candidates = i === 0 && geo ? [`${base}_GEO_US`, base] : [`${base}${suffix}`];
      cutout(`/images/products/${slug}/${colorId}-${i + 1}.webp`, candidates);
    });
  }
}

/** Previous-generation images: one front-and-back shot per finish. */
function legacyPhone(slug, stem, finishes) {
  for (const [colorId, appleName] of Object.entries(finishes)) {
    cutout(`/images/products/${slug}/${colorId}-1.webp`, `${stem}-${appleName}`);
  }
}

phone("iphone-18-pro", "iphone-18-pro", "202609", { black: "black", burgundy: "burgundy", glacier: "glacier", silver: "silver" });
phone("iphone-air", "iphone-air", "202509", { "sky-blue": "skyblue", "light-gold": "lightgold", "cloud-white": "cloudwhite", "space-black": "spaceblack" });
phone("iphone-17", "iphone-17", "202509", { lavender: "lavender", sage: "sage", "mist-blue": "mistblue", white: "white", black: "black" }, undefined, true);
phone("iphone-17e", "iphone-17e", "202603", { black: "black", "soft-pink": "softpink", white: "white" }, ["", "_AV2"]);
phone("iphone-17-pro", "iphone-17-pro", "202509", { "cosmic-orange": "cosmicorange", "deep-blue": "deepblue", silver: "silver" });
legacyPhone("iphone-16-pro", "iphone-16-pro-finish-select-202409-6-3inch", {
  "desert-titanium": "deserttitanium",
  "natural-titanium": "naturaltitanium",
  "white-titanium": "whitetitanium",
  "black-titanium": "blacktitanium",
});
legacyPhone("iphone-15", "iphone-15-finish-select-202309-6-1inch", { pink: "pink", yellow: "yellow", green: "green", blue: "blue", black: "black" });
legacyPhone("iphone-13", "iphone-13-finish-select-202207-6-1inch", {
  midnight: "midnight",
  starlight: "starlight",
  "pacific-blue": "blue",
  pink: "pink",
  "alpine-green": "green",
  red: "product-red",
});

const caseColors = { burgundy: "MKD14", berry: "MKD24", olive: "MKD34", taupe: "MKD44", "slate-blue": "MKD54", black: "MKD64" };
for (const [colorId, part] of Object.entries(caseColors)) {
  ["", "_AV1", "_AV2"].forEach((suffix, i) => cutout(`/images/products/iphone-18-pro-techwoven-case/${colorId}-${i + 1}.webp`, `${part}${suffix}`));
}
["", "_AV1", "_AV2"].forEach((suffix, i) => cutout(`/images/products/iphone-18-pro-clear-case/main-${i + 1}.webp`, `MKDU4${suffix}`));
cutout("/images/products/usb-c-power-adapter/20w.webp", "MHJA3");
cutout("/images/products/usb-c-power-adapter/35w-dual.webp", "MW2H3");
cutout("/images/products/usb-c-power-adapter/40w-dynamic.webp", "MGKN4");
["", "_AV1"].forEach((suffix, i) => cutout(`/images/products/usb-c-woven-cable/main-${i + 1}.webp`, `MQKJ3${suffix}`));
["", "_AV1", "_AV2"].forEach((suffix, i) => cutout(`/images/products/magsafe-charger/main-${i + 1}.webp`, `MGDM4${suffix}`));
["", "_AV1", "_AV2"].forEach((suffix, i) => cutout(`/images/products/iphone-air-magsafe-battery/main-${i + 1}.webp`, `MGPG4${suffix}`));
cutout("/images/products/airpods-pro-3/main-1.webp", "airpods-pro-3-hero-select-202509");
cutout("/images/products/airpods-5/main-1.webp", "airpods-5-select-202609");

// Repair services
photo("/images/products/screen-replacement/main.webp", "1539331586018-346b53b2aaa4", "max bushuev");
photo("/images/products/battery-replacement/main.webp", "1639776739505-1e55563c9938", "Vitalijus");
photo("/images/products/charging-port-repair/main.webp", "1557767382-97b28f5488e7", "Andreas Haslinger");
photo("/images/products/back-glass-replacement/main.webp", "1706972612625-d5be9a7aadd8", "Dong Xu");
photo("/images/products/camera-repair/main.webp", "1747409864642-c7150b97bef9", "Anuj Mhatre");
photo("/images/products/water-damage-treatment/main.webp", "1765220066469-54d4efe41ca5", "Maximus Mazar");

// Editorial
photo("/images/editorial/workbench.webp", "1746005514011-ea00280f3b6e", "Fotografia Lui Vlad");
photo("/images/editorial/teardown.webp", "1746005718004-1f992c399428", "Fotografia Lui Vlad");
photo("/images/editorial/technician.webp", "1639776739297-f7e1f21526f4", "Vitalijus");
photo("/images/editorial/internals.webp", "1782671987032-f605622c4f6b", "Sandeep");
photo("/images/editorial/internals-dark.webp", "1782671987176-a9b521bcf296", "Sandeep");
photo("/images/editorial/lens.webp", "1759588071838-d560be56b2a2", "ubeyonroad");

/* ── Processing ───────────────────────────────────────────────────────── */

async function download(url, attempts = 4) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(150_000), headers: { "User-Agent": "Mozilla/5.0 CellifyShop image fetcher" } });
      if (res.status === 404) return null;
      if (res.ok && res.headers.get("content-type")?.startsWith("image/")) return Buffer.from(await res.arrayBuffer());
    } catch {
      // Network hiccup: retry below.
    }
    await new Promise((r) => setTimeout(r, 600 * attempt));
  }
  return null;
}

/** Older shots place a small phone on a wide canvas, so they need more pixels. */
const LEGACY = /-\d+inch-/;

async function fetchApple(name) {
  for (const host of APPLE_HOSTS) {
    const buffer = await download(`${host}/${name}?wid=${LEGACY.test(name) ? 2400 : 1600}&hei=${LEGACY.test(name) ? 2400 : 1600}&fmt=png-alpha`);
    if (buffer && buffer.length > 2000) return buffer;
  }
  return null;
}

/**
 * Remove the flat studio background that touches the image edges (older
 * Apple shots sit on #F5F5F7), then trim and centre on a transparent square.
 */
async function toCutout(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const isBackground = (i) => {
    const a = data[i * 4 + 3];
    if (a < 12) return true;
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    return Math.abs(r - 245) <= 5 && Math.abs(g - 245) <= 5 && Math.abs(b - 247) <= 5;
  };

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const push = (i) => {
    if (!visited[i] && isBackground(i)) {
      visited[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (head < tail) {
    const i = queue[head++];
    data[i * 4 + 3] = 0;
    const x = i % width;
    if (x > 0) push(i - 1);
    if (x < width - 1) push(i + 1);
    if (i >= width) push(i - width);
    if (i < width * (height - 1)) push(i + width);
  }

  const keyed = await sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
  const trimmed = await sharp(keyed).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 }).toBuffer({ resolveWithObject: true });
  const side = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 1.08);
  const padX = Math.floor((side - trimmed.info.width) / 2);
  const padY = Math.floor((side - trimmed.info.height) / 2);

  return sharp(trimmed.data)
    .extend({ left: padX, right: side - trimmed.info.width - padX, top: padY, bottom: side - trimmed.info.height - padY, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 90, effort: 5 })
    .toBuffer();
}

async function toPhoto(id) {
  const buffer = await download(`https://images.unsplash.com/photo-${id}?w=2000&q=85&fm=jpg`);
  if (!buffer) return null;
  return sharp(buffer).resize(1800, 1800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toBuffer();
}

const selected = jobs.filter((job) => !filters.length || filters.some((f) => job.output.includes(f)));
const failures = [];
let done = 0;

async function run(job) {
  const file = path.join(PUBLIC, job.output);
  if (!force && existsSync(file)) return;
  let output = null;
  if (job.kind === "cutout") {
    for (const name of job.sources) {
      const buffer = await fetchApple(name);
      if (buffer) {
        output = await toCutout(buffer);
        break;
      }
    }
  } else {
    output = await toPhoto(job.id);
  }
  if (!output) {
    failures.push(job.output);
    return;
  }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, output);
  done++;
  console.log(`  ✓ ${job.output}`);
}

// Small worker pool keeps the image services happy.
const queue = [...selected];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) await run(queue.shift());
  }),
);

console.log(`\n${done} written, ${selected.length - done - failures.length} already present, ${failures.length} unavailable`);
if (failures.length) console.log(failures.map((f) => `  ✗ ${f}`).join("\n"));
