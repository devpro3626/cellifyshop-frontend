# CellifyShop: storefront and admin

Next.js 16 (App Router, Cache Components) store for iPhones, same-day repairs and accessories, with an admin portal. All data comes from the CellifyShop API in `../cellify-backend` (Express + MongoDB).

```bash
# 1. Start the API first (see ../cellify-backend/README.md)
cd ../cellify-backend && npm run dev

# 2. Then the storefront
npm run dev      # http://localhost:3000
npm run build    # production build (the API must be running: pages are prerendered from it)
npm run images   # (re)download the starting product and editorial imagery
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home |
| `/products` | All products, grouped by category |
| `/products/[category]` | One category with search, sort and filters |
| `/product/[id]` | Product page: gallery, options, price, Buy on WhatsApp |
| `/about` | Company page |
| `/contact` | Contact page; the form saves messages to the admin inbox |
| `/admin` | Admin portal (password protected) |

Prices are in AED. Buy, booking and chat buttons open WhatsApp with a pre-filled message and a link to the chosen product. Contact details come from environment variables (see `.env.example`).

## Environment

| Variable | Purpose |
| --- | --- |
| `API_URL` | Base URL of the API, e.g. `http://localhost:4000/api`. Used on the server only |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number with country code |
| `NEXT_PUBLIC_WHATSAPP_DISPLAY` | How the number is shown on the site |
| `NEXT_PUBLIC_SITE_URL` | Public address, used for product links in WhatsApp messages |

The admin password is set in the API (`ADMIN_PASSWORD` in `cellify-backend/.env`).

## Admin portal

Sign in at `/admin` with the API's admin password. The API returns a token, which is kept in an httpOnly cookie.

- **Products:** paginated list with search and category filter. Create and edit name, category, image links (tagged by colour), options from the taxonomy, and a price and stock for every variant.
- **Categories:** create, edit, reorder, and delete empty categories. The web address is generated from the name.
- **Taxonomy:** create and edit attributes (Colour, Storage, Condition…) and their values. Values in use can't be removed.
- **Messages:** contact-form inbox with All / Unread / Read tabs, search and pagination. Reply by call, WhatsApp or email; mark read or delete.

Saves refresh the store immediately (`updateTag("catalog")`).

## How the frontend talks to the API

`lib/api/client.ts` creates two axios instances with interceptors:

- **response interceptor** (both): turns any failure into a typed `ApiError` with the API's message, or a clear message when the API is unreachable.
- **request interceptor** (`adminApi`): attaches the admin token from the httpOnly cookie as `Authorization: Bearer …`.

`lib/api/catalog.api.ts` and `lib/api/messages.api.ts` wrap the endpoints. Storefront reads go through `lib/catalog/repository.ts` (cached, tag `catalog`); admin writes go through server actions in `lib/admin/actions.ts`.

## Structure

```
app/(store)/      Storefront pages
app/admin/        Admin portal: login and the (panel) screens behind the session check
components/       home, product, shop, layout, bag, admin, three (hero light field), ui
lib/api/          axios clients, interceptors and endpoint wrappers
lib/catalog/      types, repository (cached reads), variant helpers
lib/admin/        session, server actions, admin data helpers
lib/contact/      contact-form server action
lib/config/       site settings: name, currency, contact, navigation
```

## Imagery

Products and categories use image links. The starting images live in `public/images` and were downloaded by `scripts/fetch-images.mjs`: product cut-outs from Apple's public store image service, and workshop photography from Unsplash (Unsplash License, credits in the manifest). Before going live, confirm you're permitted to use manufacturer imagery, or replace it with your own.

`next.config.ts` allows images from any https host so admin-added links display. Narrow `images.remotePatterns` to your image hosts once they're settled.
