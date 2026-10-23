# Go-live checklist

1. Run `supabase.sql` in the Supabase SQL Editor (creates tables, seed data and the `store-media` image bucket).
2. In Vercel → Project → Settings → Environment Variables, add:
   - `ADMIN_USERNAME` and `ADMIN_PASSWORD` (the admin login)
   - `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API)
   - optional: `ADMIN_SESSION_SECRET` (any long random string)
3. Redeploy.
4. Open `/admin` and sign in. The header chip should say **Live database** (not "Demo mode").
5. Test: add one product, upload one image, edit one banner, update one ticker message, then confirm the storefront reflects each change.

Do not put the service-role key in any `NEXT_PUBLIC_` variable.
