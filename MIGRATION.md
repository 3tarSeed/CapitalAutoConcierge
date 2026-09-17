# Public intake

Customers can now submit without signing in. All leads land on one shared desk visible to any
email in STAFF_EMAILS.

## 1. Supabase
SQL Editor → run `supabase/0002_public_intake.sql`.

## 2. Netlify env var (mark as SECRET)
SUPABASE_SERVICE_ROLE_KEY   ← Supabase → Project Settings → API Keys → "service_role" / sb_secret_…
                               Never expose this in the browser; it is only read in lib/supabase/admin.ts.

## 3. Repo — overwrite / add
app/api/leads/route.ts      app/estimator.tsx      app/leads/desk.tsx
lib/supabase/admin.ts       lib/turnstile.ts       supabase/0002_public_intake.sql

## 4. Optional bot protection (recommended before advertising the site)
Cloudflare dashboard → Turnstile → Add widget → hostname capitalautoconcierge.com → Managed.
Add to Netlify: NEXT_PUBLIC_TURNSTILE_SITE_KEY (public) and TURNSTILE_SECRET_KEY (secret).
Redeploy. Until both are set, the form has a honeypot only and Turnstile is skipped.
