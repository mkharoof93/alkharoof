# Al Kharoof Butchery Co. — Storefront + Admin V9

Bilingual (English / Arabic RTL) mobile-first meat e-commerce web app for Kuwait, with WhatsApp checkout and a complete Supabase-ready administration system.

## What is included

### Customer storefront
- English + Arabic RTL
- Responsive mobile-first shopping UI
- 50 starter products
- Dynamic product catalogue loaded from `/api/products`
- Dynamic categories loaded from `/api/categories`
- Dynamic 3-slide promotion hero loaded from `/api/banners`
- Dynamic scrolling fresh-products ticker loaded from `/api/ticker`
- Dynamic company/contact/WhatsApp details loaded from `/api/settings`
- Product search, filters, favourites and cart
- Product weight and preparation choices
- Kuwait delivery form and customer location link
- WhatsApp checkout to the configured store WhatsApp number

### `/admin` dashboard
- Modern responsive dashboard overview
- Product add / edit / duplicate / hide / delete
- English + Arabic product names and descriptions
- SKU, category, current/old price, selling unit and badges
- Stock quantity + in-stock / low-stock / out-of-stock status
- Featured / visibility controls
- Weight and preparation options
- Product image upload hook + image URL fallback
- Category add / edit / hide / delete and ordering
- Promotion-banner add / edit / delete, offer pricing, CTA and themes
- Scrolling ticker add / edit / hide / delete
- Company name, official address, phone numbers and WhatsApp settings
- Demo/local mode before Supabase is connected
- Username/password admin login (static credentials from environment variables)
- Supabase Storage image upload (server-side, max 4 MB per image)

## Admin login

`/admin` is protected by one username/password read from environment variables:

```env
ADMIN_USERNAME=choose-a-username
ADMIN_PASSWORD=choose-a-long-password
ADMIN_SESSION_SECRET=optional-long-random-string
```

Signing in sets a signed, httpOnly session cookie valid for 7 days. To change the password, update `ADMIN_PASSWORD` in Vercel and redeploy; every existing session is signed out automatically. If the variables are missing, `/admin` shows a "login not configured" screen.

## Demo mode (before Supabase)

If the Supabase variables are missing, the admin (after sign-in) runs in **Demo / local data** mode with a red "Database not connected" banner. Changes are stored only in that browser's `localStorage` and do **not** reach the live store. Use **Reset demo data** in the sidebar to restore the original 50-product catalogue.

## Connect Supabase (required for a live admin)

Vercel has no permanent storage of its own, so products, offers and images are saved in Supabase.

1. Create a Supabase project.
2. Open **SQL Editor** and run the complete `supabase.sql` file. It creates the schema and seeds 50 products, 6 categories, 3 hero banners, 3 ticker messages, the company settings and the public `store-media` image bucket.
3. Copy `.env.example` to `.env.local` (local development) and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

4. Restart the dev server. The admin header switches from **Demo mode** to **Live database**.

## Vercel deployment

In **Vercel > Project > Settings > Environment Variables** add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (optionally `ADMIN_SESSION_SECRET`), then redeploy. The service-role key is server-only and must never be exposed as a `NEXT_PUBLIC_` variable.

Then deploy normally:

```bash
npm install
npm run build
```

## Staying on the Supabase free tier

- The homepage is a cached static page. Supabase is read only after an admin change (or once an hour at most), not on every visit, so traffic doesn't use database quota.
- Every admin save or delete refreshes the cache immediately; the change is visible on the next page load.
- A daily Vercel cron (`vercel.json` → `/api/keepalive`) runs one tiny query so the free project is never paused for inactivity. Optionally set `CRON_SECRET` in Vercel to protect that endpoint.
- Admin image uploads are resized to max 1600px and converted to WebP before upload (usually 150–300 KB each), keeping storage (1 GB) and bandwidth (5 GB/month) low.

## Security design

The browser never receives the service-role key or the admin password. Every write (`POST`/`DELETE` on the store APIs and `/api/upload`) is checked on the server: it needs a valid signed session cookie from `/api/admin/login` and must come from the same site. Login attempts are rate-limited and failed attempts are delayed. The server then uses the service-role key to update Supabase.

## Initial business details

- Arabic: شركة ملحمة الخروف
- English: Al Kharoof Butchery Co.
- Address Arabic: مبارك الكبير غرب ابو فطيرة الحرفيه - القسيمة 119 - محل رقم 5
- Address English: West Abu Fateera Building No. 119 - Shop No.5
- Business phones: +965 50982666 / +965 51196116
- WhatsApp orders: +965 5581 6212

## Important before public launch

The supplied/demo product prices and some illustrative product photography still require client approval/replacement. The database/admin system is built so these changes can be made without touching code.

## Local commands

```bash
npm install
npm run dev
# http://localhost:3000
# http://localhost:3000/admin
```


## V10 storefront polish
- Arabic-first typography with Alexandria/Tajawal and Manrope/DM Serif English pairing.
- Kuwait-local shopping microcopy while checkout/address copy stays clear and formal.
- Refined product cards, ticker, header lockup, category photography treatment and mobile interactions.
- Supabase/admin architecture from V9 preserved.

### Preview
Open `CLIENT_PREVIEW.html` for the polished V10 bilingual storefront and `ADMIN_PREVIEW.html` for the admin demo.


## V11 premium frontend polish

- Added a mobile-first **Butcher’s Picks / الأكثر طلباً الحين** horizontal rail.
- Rebuilt mid-page promotions as image-led BBQ and family campaign cards.
- Improved bilingual product cards with stock state, weight/preparation chips, stronger KWD/د.ك pricing hierarchy and cleaner CTAs.
- Added sticky mobile category filters, refined category photography, richer shadows and section rhythm.
- Improved Arabic retail wording and RTL presentation while keeping checkout/address copy professional.
- Preserved the V9/V10 Supabase-ready admin architecture and all CRUD functionality.
