# Netlify + Supabase migration

Converts the ChatGPT Sites / Cloudflare Workers build into a plain Next.js 16 app.

## 1. Delete from the repo
```
vite.config.ts
cloudflare-env.d.ts
drizzle.config.ts
pnpm-workspace.yaml
build/                (sites-vite-plugin.ts + LICENSE)
scripts/              (run-framework.mjs, execution-profile.mjs, sites-env.mjs, install-pnpm.sh, build-verified.sh)
db/                   (index.ts, schema.ts — ported to supabase/0001_leads.sql)
drizzle/
examples/
app/chatgpt-auth.ts   (replaced by app/auth.ts)
.openai/
tsconfig.tsbuildinfo
```

## 2. Copy in these files (overwrite existing)
```
package.json          netlify.toml          tsconfig.json        next-env.d.ts
proxy.ts              .env.example
app/auth.ts           app/leads/page.tsx    app/api/leads/route.ts
app/login/page.tsx    app/login/login-form.tsx    app/logout/route.ts
lib/database.ts       lib/supabase/server.ts      lib/supabase/client.ts
supabase/0001_leads.sql
```
Then regenerate the lockfile:
```
rm pnpm-lock.yaml && pnpm install
```

## 3. Check the three files I did not see
- `lib/notifications.ts` — if it reads `env` from `cloudflare:workers`, switch to `process.env.RESEND_API_KEY` etc.
- `lib/catalog.ts`, `app/estimator.tsx`, `app/layout.tsx` — should be unaffected; grep for `cloudflare` or `chatgpt-auth` to be sure.
- `.gitignore` — must contain `.env*`, `.next`, `node_modules`.

## 4. Supabase
1. Create a project. Run `supabase/0001_leads.sql` in the SQL editor.
2. Authentication → Providers → Email: enable, disable "Confirm email" for staff simplicity (or keep it and confirm once).
3. Authentication → Users → "Add user": create each staff login with a password.
4. Settings → API: copy Project URL and anon key.

## 5. Netlify environment variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
STAFF_EMAILS          comma-separated; must match the Supabase users you created
```
plus whatever `lib/notifications.ts` needs. Netlify UI build settings can stay as-is
(`pnpm run build`, publish `.next`, Next.js plugin) — `netlify.toml` now pins them.

## Behaviour changes
- `/leads` redirects to `/login` instead of ChatGPT SIWC. `POST /logout` signs out.
- Only emails in `STAFF_EMAILS` pass `requireStaffUser` / the API — the allowlist BUILD_NOTES called for.
- `POST /api/leads` still requires sign-in (unchanged). Public customer intake remains a separate, later piece of work.
- `leads.data` is `jsonb`, so the route no longer `JSON.parse`s it; `desk.tsx` is untouched.
- Owner scoping is enforced twice: `.eq("owner", …)` in the route and Row Level Security in Postgres.
