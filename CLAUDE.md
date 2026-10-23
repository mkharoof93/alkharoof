# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Al Kharoof Butchery Co. — a bilingual (English / Arabic RTL), mobile-first meat storefront for Kuwait with WhatsApp checkout, plus an `/admin` dashboard. Next.js 15 App Router, React 19, TypeScript (strict), Supabase, `lucide-react` icons. Deploys to Vercel.

## Commands

```bash
npm install
npm run dev     # http://localhost:3000 and http://localhost:3000/admin
npm run build   # also the type check (tsconfig has noEmit; there is no separate lint/test script)
npm start
```

There is no test suite or linter configured.

## Architecture

### Demo mode vs. Supabase mode
The whole app runs with or without Supabase, and this dual path shapes most code:

- `lib/db.ts` — `db()` returns a **service-role** Supabase client, or `null` when `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are missing. `supabaseConfigured()` drives `/api/status` and `/api/admin/session`, which report demo vs. Supabase mode.
- **API routes** (`app/api/{products,categories,banners,ticker,settings}/route.ts`): `GET` returns the seed data from `lib/data.ts` when `db()` is null, otherwise reads the matching table ordered by `sortOrder`. `POST` upserts (by `id`) and `DELETE` removes by `{id}` in the JSON body; both require `authorized(req)` and return 503 without Supabase. Each route normalises/whitelists fields itself — adding a field means updating the route's object literal, not just the type.
- **Storefront**: `app/page.tsx` is a server component (ISR, `revalidate = 3600`) that passes `getStoreData()` from `lib/store.ts` into the client component `app/StoreFront.tsx`. `getStoreData` is an `unstable_cache` snapshot of all five tables (active rows only), tagged `store`; it returns seeds when Supabase isn't configured and **throws** on a Supabase error so the last good page stays online. Every successful admin `POST`/`DELETE` calls `refreshStore()` (`revalidateTag('store')` + `revalidatePath('/')`), so changes appear on the next page load. New write routes must call it too. The storefront makes no `/api` calls from the browser; the public `GET` routes are now used only by the admin.
- **Supabase free tier**: caching keeps DB reads near zero; `vercel.json` runs a daily cron to `/api/keepalive` (protected by `CRON_SECRET` if set) to prevent the 7-day inactivity pause; admin uploads are resized to ≤1600px WebP in the browser (`compressImage` in `app/admin/page.tsx`).
- **Admin** (`app/admin/page.tsx`, client component) calls `/api/admin/session` on load and always requires sign-in. In demo mode all CRUD goes to `localStorage` keys `akh-admin-{products,categories,banners,ticker,settings}` seeded from `lib/data.ts` (only that browser sees it; a "Database not connected" banner is shown). In Supabase mode it calls the API routes (cookie auth, same-origin) and uploads images via `POST /api/upload` (multipart, ≤4 MB because of Vercel's body limit), which writes to the public `store-media` bucket with the service-role key.

### Auth / security model
Admin login uses static credentials from `ADMIN_USERNAME` / `ADMIN_PASSWORD` (no Supabase Auth). `lib/admin-session.ts` checks them in constant time and issues an HMAC-signed, expiring token stored in the httpOnly `akh_admin` cookie (`/api/admin/login`, `/api/admin/logout`). The signing key is `ADMIN_SESSION_SECRET`, or derived from the credentials, so changing the password revokes all sessions. `authorized()` in `lib/db.ts` accepts either that cookie (only when the `Origin` matches the host, as CSRF protection) or `Authorization: Bearer $ADMIN_API_KEY`. Login is rate-limited per IP in memory (per serverless instance only). All tables have RLS enabled with no public policies, so only server routes using the service-role key touch them. The `admin_users` table and Storage policies in `supabase.sql` are leftovers from the old Supabase Auth flow and aren't used. The service-role key must never be a `NEXT_PUBLIC_` variable.

### Data model
- `lib/data.ts` is the single source of the TypeScript types (`Product`, `Category`, `Banner`, `TickerItem`, `StoreSettings`) and the seed data (50 products, 6 categories, 3 banners, 3 ticker items, store settings).
- `supabase.sql` is the schema + identical seed. It is written to be **re-runnable** (`create table if not exists`, `add column if not exists` upgrade block, `on conflict`). Columns are camelCase and quoted (`"oldPrice"`, `"sortOrder"`, `"stockQty"`) to match the TS objects one-to-one — keep that convention. `store_settings` is a single row with `id = 'store'`.
- When adding a field, update all of: the type + seeds in `lib/data.ts`, the column (and an `alter table … add column if not exists` line) in `supabase.sql`, the API route's upsert object, and the admin form.
- Prices are KWD with 3 decimals (`numeric(12,3)`).

### Bilingual UI
Content fields come in `en`/`ar` (or `…En`/`…Ar`) pairs; the UI switches language and RTL direction client-side. Arabic copy uses Kuwaiti/Khaleeji retail wording for marketing text but keeps checkout/address copy formal. Styles live in `app/style.css` (storefront) and `app/admin/admin.css`.

### Checkout
There is no payment backend: the cart is serialised into a message and opened as `wa.me/<store WhatsApp>?text=…`, with the number taken from store settings.

### Preview files
`CLIENT_PREVIEW.html` and `ADMIN_PREVIEW.html` are standalone static HTML mockups for showing the client; they are not generated from the Next.js app and won't reflect app changes unless edited separately.

## Notes
- Product prices and some (Unsplash) product photography are placeholders pending client approval; real images live in `public/images/`.
- `SUPABASE_CONNECT_LATER.md` holds the go-live checklist (run `supabase.sql`, set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel, redeploy).
- For local testing of the admin, pass credentials inline: `ADMIN_USERNAME=x ADMIN_PASSWORD=y npm run dev` (Next doesn't override variables that are already set in the environment).
