# CellifyShop: storefront and admin

Next.js 16 (App Router, Cache Components) store for iPhones, same-day repairs and accessories, with a simple admin portal.

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run images   # (re)download the starting product and editorial imagery
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home |
| `/products` | All products, grouped by category |
| `/products/[category]` | One category with search, sort and filters |
| `/product/[slug]` | Product page: gallery, options, price, Buy on WhatsApp |
| `/about`, `/contact` | Company and contact pages |
| `/admin` | Admin portal (password protected) |

Prices are in AED. Buy, booking and contact buttons open WhatsApp (+971 56 236 1397) with a pre-filled message. Contact details live in `lib/config/site.ts`.

## Admin portal (version 1)

Sign in at `/admin`. Set the password in `.env.local`:

```bash
ADMIN_PASSWORD=your-strong-password
ADMIN_SECRET=another-long-random-string   # optional, signs the session cookie
```

In development, if `ADMIN_PASSWORD` is not set, the password is `cellify-admin` (shown on the sign-in page). In production the portal stays locked until `ADMIN_PASSWORD` is set.

- **Products:** create and edit name, category, images (upload or path, tag by colour), options from the taxonomy, and a price and stock for every variant. Highlights, specs and box contents are edited here too.
- **Categories:** create, edit, reorder, and delete empty categories.
- **Taxonomy:** create and edit attributes (Colour, Storage, Condition…) and their values. Values in use can't be removed.

Changes appear on the store immediately: every save calls `updateTag("catalog")`.

### Where data is stored

The catalogue is one JSON file, `data/catalog.json`, created from the seed in `lib/catalog/data` on first run. Uploaded images go to `data/uploads` and are served from `/uploads/…`. This suits a single server (`next start`, a VPS, or a container with a persistent volume). For serverless hosting, replace `readCatalog`/`writeCatalog` in `lib/catalog/store.ts` and the upload target in `lib/admin/actions.ts` with a database and object storage; no page code changes.

## Structure

```
app/(store)/      Storefront pages
app/admin/        Admin portal: login and the (panel) screens behind the session check
app/uploads/      Serves uploaded images
components/       home, product, shop, layout, bag, admin, three (hero light field), ui
lib/catalog/      types, seed data, store (file), repository (cached reads), variant helpers
lib/admin/        auth (signed session cookie), server actions
lib/config/       site settings: name, currency, contact, navigation
```

## Imagery

`scripts/fetch-images.mjs` downloads the starting images: product cut-outs from Apple's public store image service, and workshop photography from Unsplash (Unsplash License, credits in the manifest). Before going live, confirm you're permitted to use manufacturer imagery, or replace the files with your own. New images can also be uploaded from the admin portal.
